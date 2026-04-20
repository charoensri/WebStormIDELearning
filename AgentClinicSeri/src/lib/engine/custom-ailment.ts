import { db } from '../db';
import { ailments } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a custom ailment when no core ailment matches.
 */
export async function createCustomAilment(novelSymptomSummary: string): Promise<string> {
  const code = `CUST-${uuidv4().slice(0, 4).toUpperCase()}`;
  const now = new Date().toISOString();

  await db.insert(ailments).values({
    ailmentCode: code,
    ailmentName: 'Unrecognized Ailment',
    category: 'Auto Detected',
    description: novelSymptomSummary,
    symptomPatterns: JSON.stringify([novelSymptomSummary]),
    status: 'auto_detected',
    createdAt: now,
  });

  return code;
}
