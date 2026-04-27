import { db } from '../db';
import { patients, visits, ailments, treatments, ailmentTreatments } from '../db/schema';
import { eq, desc, and, gt } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { runTriageAndDiagnosis } from './triage-diagnosis';
import { runPrescription } from './prescription';
import { createCustomAilment } from './custom-ailment';
import { Diagnosis } from '../../types/diagnosis';
import { Prescription } from '../../types/visit';

export async function processVisit(patientId: string, symptomText: string, metadata?: any) {
  const now = new Date().toISOString();
  const visitId = uuidv4();

  // 1. Validate Patient
  const patient = await db.query.patients.findFirst({
    where: eq(patients.patientId, patientId),
  });

  if (!patient || patient.status === 'suspended') {
    throw new Error(patient?.status === 'suspended' ? 'Patient is suspended' : 'Patient not found');
  }

  // 2. Create Initial Visit
  await db.insert(visits).values({
    visitId,
    patientId,
    state: 'TRIAGE',
    createdAt: now,
    updatedAt: now,
    symptomText,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });

  // 3. Load Context
  const history = await db.query.visits.findMany({
    where: eq(visits.patientId, patientId),
    orderBy: [desc(visits.createdAt)],
    limit: 5,
  });

  const historySummary = history.map(v => {
    return `Visit ${v.visitId} (${v.createdAt}): Ailments: ${v.diagnoses || 'None'}`;
  }).join('\n');

  const catalog = await db.query.ailments.findMany();
  const catalogSummary = catalog.map(a => {
    return `${a.ailmentCode}: ${a.ailmentName} - Patterns: ${a.symptomPatterns}`;
  }).join('\n');

  // 4. LLM Call 1: Triage + Diagnosis
  const triageResult = await runTriageAndDiagnosis(symptomText, historySummary, catalogSummary);

  let finalDiagnoses: Diagnosis[] = [];

  if (triageResult.no_match && triageResult.novel_symptom_summary) {
    const customCode = await createCustomAilment(triageResult.novel_symptom_summary);
    finalDiagnoses.push({
      ailment_code: customCode,
      ailment_name: 'Unrecognized Ailment',
      confidence: 0.5,
      matched_patterns: [triageResult.novel_symptom_summary],
      severity_adjusted: triageResult.severity,
    });
  } else {
    for (const cand of triageResult.candidates) {
      if (cand.confidence >= 0.4) {
        const ailment = catalog.find(a => a.ailmentCode === cand.ailment_code);
        finalDiagnoses.push({
          ailment_code: cand.ailment_code,
          ailment_name: ailment?.ailmentName || 'Unknown',
          confidence: cand.confidence,
          matched_patterns: cand.matched_patterns,
          severity_adjusted: triageResult.severity,
        });
      }
    }
  }

  await db.update(visits).set({
    state: 'DIAGNOSED',
    severity: triageResult.severity,
    diagnoses: JSON.stringify(finalDiagnoses),
    updatedAt: new Date().toISOString(),
  }).where(eq(visits.visitId, visitId));

  // 5. Check for Recurrence
  let hasRecurrence = false;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const pastVisits = await db.query.visits.findMany({
    where: and(
      eq(visits.patientId, patientId),
      gt(visits.createdAt, thirtyDaysAgo)
    ),
  });

  for (const diag of finalDiagnoses) {
    const previousOccurrences = pastVisits.filter(v => {
      if (v.visitId === visitId) return false;
      const vDiags: Diagnosis[] = v.diagnoses ? JSON.parse(v.diagnoses) : [];
      return vDiags.some(d => d.ailment_code === diag.ailment_code);
    });
    if (previousOccurrences.length > 0) {
      hasRecurrence = true;
      break;
    }
  }

  // 6. Prepare Treatment Candidates
  let treatmentCandidatesText = '';
  for (const diag of finalDiagnoses) {
    const ts = await db.select().from(ailmentTreatments)
      .innerJoin(treatments, eq(ailmentTreatments.treatmentCode, treatments.treatmentCode))
      .where(eq(ailmentTreatments.ailmentCode, diag.ailment_code));
    
    treatmentCandidatesText += `\nAilment: ${diag.ailment_code}\n`;
    ts.forEach((t, i) => {
      treatmentCandidatesText += `${i + 1}. ${t.treatments.treatmentCode} (${t.treatments.treatmentName}) - Effectiveness: ${t.ailment_treatments.effectivenessScore || t.ailment_treatments.seedEffectiveness}\n`;
    });
  }

  const patientContext = `Agent: ${patient.agentName}, Model: ${patient.model}, Framework: ${patient.framework}, Env: ${patient.environment || '{}'}`;

  // 6. LLM Call 2: Prescription + Rationale
  const prescriptionResult = await runPrescription(finalDiagnoses, treatmentCandidatesText, patientContext);

  const finalPrescriptions: Prescription[] = [];
  for (const rx of prescriptionResult.prescriptions) {
    const treatmentDetails = await db.query.treatments.findFirst({
      where: eq(treatments.treatmentCode, rx.treatment_code),
    });

    finalPrescriptions.push({
      ailment_code: rx.ailment_code,
      treatment_code: rx.treatment_code,
      treatment_name: treatmentDetails?.treatmentName || 'Unknown',
      prescription_payload: treatmentDetails ? JSON.parse(treatmentDetails.prescriptionTemplate) : {},
      rationale: rx.rationale,
      deferred: rx.deferred,
      deferred_reason: rx.deferred_reason,
      referral: rx.referral,
      referral_reason: rx.referral_reason,
    });

    // Update Prescription Count
    if (rx.treatment_code && !rx.deferred && !rx.referral) {
      const mapping = await db.query.ailmentTreatments.findFirst({
        where: and(
          eq(ailmentTreatments.ailmentCode, rx.ailment_code),
          eq(ailmentTreatments.treatmentCode, rx.treatment_code)
        )
      });
      if (mapping) {
        await db.update(ailmentTreatments).set({
          totalPrescribed: (mapping.totalPrescribed || 0) + 1,
          lastUpdated: now
        }).where(and(
          eq(ailmentTreatments.ailmentCode, rx.ailment_code),
          eq(ailmentTreatments.treatmentCode, rx.treatment_code)
        ));
      }
    }
  }

  // 8. Finalize
  const followupWindow = Number(process.env.FOLLOWUP_WINDOW_HOURS || 72);
  const followupDue = new Date(Date.now() + followupWindow * 60 * 60 * 1000).toISOString();

  await db.update(visits).set({
    state: 'AWAITING_FOLLOWUP',
    prescriptions: JSON.stringify(finalPrescriptions),
    followupDue,
    recurrenceFlag: hasRecurrence,
    updatedAt: new Date().toISOString(),
  }).where(eq(visits.visitId, visitId));

  await db.update(patients).set({
    lastVisit: now,
    visitCount: (patient.visitCount || 0) + 1,
  }).where(eq(patients.patientId, patientId));

  const finalVisit = await db.query.visits.findFirst({
    where: eq(visits.visitId, visitId),
  });

  return finalVisit;
}
