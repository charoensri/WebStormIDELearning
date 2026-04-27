import { db } from '../db';
import { visits, ailmentTreatments, patients } from '../db/schema';
import { eq, and, desc, gt } from 'drizzle-orm';
import { FollowupReport, Prescription } from '../../types/visit';
import { Diagnosis } from '../../types/diagnosis';
import { processVisit } from './pipeline';

/**
 * Processes a follow-up report for a visit.
 * Transitions state, updates effectiveness, and checks for chronic flags.
 */
export async function processFollowup(
  visitId: string,
  report: Omit<FollowupReport, 'submitted_at'>
) {
  const visit = await db.query.visits.findFirst({
    where: eq(visits.visitId, visitId),
  });

  if (!visit) throw new Error('Visit not found');
  if (visit.state !== 'AWAITING_FOLLOWUP') throw new Error('Visit is not awaiting follow-up');

  const now = new Date().toISOString();
  const fullReport: FollowupReport = {
    ...report,
    submitted_at: now,
  };

  // 1. Determine new state
  let newState: 'RESOLVED' | 'UNRESOLVED' | 'EXPIRED';
  if (report.outcome === 'improved') {
    newState = 'RESOLVED';
  } else if (report.outcome === 'unknown') {
    newState = 'EXPIRED';
  } else {
    newState = 'UNRESOLVED';
  }

  // 2. Update Effectiveness Data
  const diagnoses: Diagnosis[] = visit.diagnoses ? JSON.parse(visit.diagnoses) : [];
  const prescriptions: Prescription[] = visit.prescriptions ? JSON.parse(visit.prescriptions) : [];

  for (const rx of prescriptions) {
    if (rx.deferred || rx.referral) continue;

    const mapping = await db.query.ailmentTreatments.findFirst({
      where: and(
        eq(ailmentTreatments.ailmentCode, rx.ailment_code),
        eq(ailmentTreatments.treatmentCode, rx.treatment_code)
      ),
    });

    if (mapping) {
      let { totalResolved, totalUnresolved, totalExpired, totalPrescribed, seedEffectiveness } = mapping;
      totalResolved = totalResolved || 0;
      totalUnresolved = totalUnresolved || 0;
      totalExpired = totalExpired || 0;

      if (report.outcome === 'improved') {
        totalResolved++;
      } else if (report.outcome === 'unknown') {
        totalExpired++;
      } else {
        totalUnresolved++;
      }

      const n = totalResolved + totalUnresolved;
      let effectivenessScore = mapping.effectivenessScore;

      // Bayesian smoothing: (seed * 5 + observed * n) / (5 + n)
      if (n >= 5) {
        const seed = seedEffectiveness || 0.5;
        const observed = totalResolved / n;
        effectivenessScore = (seed * 5 + observed * n) / (5 + n);
      }

      await db.update(ailmentTreatments).set({
        totalResolved,
        totalUnresolved,
        totalExpired,
        effectivenessScore,
        lastUpdated: now,
      }).where(and(
        eq(ailmentTreatments.ailmentCode, rx.ailment_code),
        eq(ailmentTreatments.treatmentCode, rx.treatment_code)
      ));
    }
  }

  // 3. Update Visit
  await db.update(visits).set({
    state: newState,
    followupReport: JSON.stringify(fullReport),
    updatedAt: now,
  }).where(eq(visits.visitId, visitId));

  // 4. Chronic Condition Check
  if (newState === 'UNRESOLVED') {
    for (const diag of diagnoses) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const recentVisits = await db.query.visits.findMany({
        where: and(
          eq(visits.patientId, visit.patientId),
          gt(visits.createdAt, thirtyDaysAgo)
        ),
      });

      const recurrenceCount = recentVisits.filter(v => {
        const vDiags: Diagnosis[] = v.diagnoses ? JSON.parse(v.diagnoses) : [];
        return vDiags.some(d => d.ailment_code === diag.ailment_code);
      }).length;

      if (recurrenceCount >= 3) {
        const patient = await db.query.patients.findFirst({
          where: eq(patients.patientId, visit.patientId),
        });
        if (patient) {
          const chronic: string[] = JSON.parse(patient.chronicConditions || '[]');
          let updatedChronic = [...chronic];
          if (!chronic.includes(diag.ailment_code)) {
            updatedChronic.push(diag.ailment_code);
          }
          
          await db.update(patients).set({
            chronicConditions: JSON.stringify(updatedChronic),
            needsManualReview: true, // Flag for operator attention
          }).where(eq(patients.patientId, visit.patientId));
        }
      }
    }
  }

  // 5. Explicit Flag for Critical Severity
  if (visit.severity && visit.severity >= 4) {
    await db.update(patients).set({
      needsManualReview: true
    }).where(eq(patients.patientId, visit.patientId));
  }

  // 6. Automate new visit if symptoms persist
  if (newState === 'UNRESOLVED') {
    console.log(`[Followup] Symptoms persist for visit ${visitId}. Opening new visit...`);
    await processVisit(visit.patientId, visit.symptomText, {
      source_visit_id: visitId,
      reason: 'Automated follow-up after unresolved treatment'
    });
  }

  return await db.query.visits.findFirst({
    where: eq(visits.visitId, visitId),
  });
}
