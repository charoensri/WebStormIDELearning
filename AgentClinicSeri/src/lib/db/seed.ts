import { db } from './index';
import { ailments, treatments, ailmentTreatments } from './schema';
import { v4 as uuidv4 } from 'uuid';

export async function seed() {
  const now = new Date().toISOString();

  const coreAilments = [
    {
      ailmentCode: 'HAL-001',
      ailmentName: 'Hallucination',
      category: 'Output Integrity',
      description: 'Agent generates factually incorrect content with high confidence.',
      symptomPatterns: JSON.stringify([
        'making things up', 'fabricating', 'inventing facts',
        'citing sources that don\'t exist', 'confident but wrong',
        'generating plausible-sounding nonsense'
      ]),
      createdAt: now,
    },
    {
      ailmentCode: 'CTX-001',
      ailmentName: 'Context Rot',
      category: 'Context Management',
      description: 'Agent loses coherence as conversation lengthens.',
      symptomPatterns: JSON.stringify([
        'losing coherence', 'contradicting earlier statements',
        'forgetting established facts', 're-asking answered questions',
        'ignoring earlier context'
      ]),
      createdAt: now,
    },
    // Add other ailments from mission.md...
  ];

  const coreTreatments = [
    {
      treatmentCode: 'CTX-INF',
      treatmentName: 'Context Infusion',
      description: 'Inject a curated context block into the agent\'s next prompt.',
      prescriptionTemplate: JSON.stringify({
        action: 'inject_context',
        position: 'prepend',
        content_template: 'GROUNDING: Verify all claims against provided sources. Do not generate information not present in sources. If uncertain, state uncertainty explicitly.'
      }),
      createdAt: now,
    },
    {
      treatmentCode: 'GND-INJ',
      treatmentName: 'Grounding Injection',
      description: 'Provide verified factual anchors the agent must reference.',
      prescriptionTemplate: JSON.stringify({
        action: 'inject_context',
        position: 'prepend',
        content_template: 'GROUNDING: The following verified facts are your authoritative source. Do not contradict or extrapolate beyond them.\n\n{sources}'
      }),
      createdAt: now,
    },
    // Add other treatments from mission.md...
  ];

  const mappings = [
    { ailmentCode: 'HAL-001', treatmentCode: 'CTX-INF', seedEffectiveness: 0.78 },
    { ailmentCode: 'HAL-001', treatmentCode: 'GND-INJ', seedEffectiveness: 0.65 },
    // Add more mappings...
  ];

  console.log('Seeding ailments...');
  for (const ailment of coreAilments) {
    await db.insert(ailments).values(ailment).onConflictDoNothing();
  }

  console.log('Seeding treatments...');
  for (const treatment of coreTreatments) {
    await db.insert(treatments).values(treatment).onConflictDoNothing();
  }

  console.log('Seeding mappings...');
  for (const mapping of mappings) {
    await db.insert(ailmentTreatments).values(mapping).onConflictDoNothing();
  }

  console.log('Seeding complete!');
}
