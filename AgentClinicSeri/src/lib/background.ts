import { db } from './db';
import { visits, ailmentTreatments, patients } from './db/schema';
import { eq, and, lt } from 'drizzle-orm';
import { Diagnosis } from '../types/diagnosis';

/**
 * Checks for visits that have exceeded their follow-up window
 * and marks them as EXPIRED.
 */
export async function expireVisits() {
  const now = new Date().toISOString();
  
  const expiredVisits = await db.query.visits.findMany({
    where: and(
      eq(visits.state, 'AWAITING_FOLLOWUP'),
      lt(visits.followupDue, now)
    )
  });

  if (expiredVisits.length === 0) return;

  console.log(`[Background] Expiring ${expiredVisits.length} visits...`);

  for (const visit of expiredVisits) {
    const followupReport = {
      outcome: 'unknown',
      outcome_text: 'Visit expired due to inactivity.',
      submitted_at: now
    };

    // Update effectiveness (increment totalExpired)
    const prescriptions = visit.prescriptions ? JSON.parse(visit.prescriptions) : [];
    for (const rx of prescriptions) {
      if (rx.deferred || rx.referral) continue;

      const mapping = await db.query.ailmentTreatments.findFirst({
        where: and(
          eq(ailmentTreatments.ailmentCode, rx.ailment_code),
          eq(ailmentTreatments.treatmentCode, rx.treatment_code)
        ),
      });

      if (mapping) {
        await db.update(ailmentTreatments).set({
          totalExpired: (mapping.totalExpired || 0) + 1,
          lastUpdated: now,
        }).where(and(
          eq(ailmentTreatments.ailmentCode, rx.ailment_code),
          eq(ailmentTreatments.treatmentCode, rx.treatment_code)
        ));
      }
    }

    await db.update(visits).set({
      state: 'EXPIRED',
      followupReport: JSON.stringify(followupReport),
      updatedAt: now
    }).where(eq(visits.visitId, visit.visitId));
  }
}

/**
 * Starts the background interval jobs.
 */
export function startBackgroundJobs() {
  const intervalMinutes = Number(process.env.EXPIRE_CHECK_INTERVAL_MINUTES || 15);
  const intervalMs = intervalMinutes * 60 * 1000;

  console.log(`[Background] Starting jobs with interval: ${intervalMinutes}m`);
  
  // Run once on startup
  expireVisits().catch(err => console.error('[Background] Initial expireVisits failed:', err));

  setInterval(() => {
    expireVisits().catch(err => console.error('[Background] Periodic expireVisits failed:', err));
  }, intervalMs);
}
