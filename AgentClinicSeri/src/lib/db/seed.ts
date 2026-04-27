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
        "making things up", "fabricating", "inventing facts", "citing sources that don't exist", "confident but wrong", "generating plausible-sounding nonsense"
      ]),
      createdAt: now,
    },
    {
      ailmentCode: 'CTX-001',
      ailmentName: 'Context Rot',
      category: 'Context Management',
      description: 'Agent loses coherence as conversation lengthens.',
      symptomPatterns: JSON.stringify([
        "losing coherence", "contradicting earlier statements", "forgetting established facts", "re-asking answered questions", "ignoring earlier context"
      ]),
      createdAt: now,
    },
    {
      ailmentCode: 'CTX-002',
      ailmentName: 'Context Overflow',
      category: 'Context Management',
      description: "Agent's effective context window is exhausted.",
      symptomPatterns: JSON.stringify([
        "dropping instructions", "ignoring parts of the input", "truncated reasoning", "context window full", "can't fit everything"
      ]),
      createdAt: now,
    },
    {
      ailmentCode: 'DFT-001',
      ailmentName: 'Instruction Drift',
      category: 'Behavioral Integrity',
      description: 'Agent gradually deviates from its system prompt or instructions.',
      symptomPatterns: JSON.stringify([
        "deviating from instructions", "tone shift", "ignoring constraints", "gradually changing behavior", "not following the system prompt"
      ]),
      createdAt: now,
    },
    {
      ailmentCode: 'PRS-001',
      ailmentName: 'Persona Collapse',
      category: 'Behavioral Integrity',
      description: 'Agent abandons its assigned persona or role entirely.',
      symptomPatterns: JSON.stringify([
        "breaking character", "responding as a generic assistant", "abandoning persona", "contradicting role", "lost my identity"
      ]),
      createdAt: now,
    },
    {
      ailmentCode: 'RPT-001',
      ailmentName: 'Repetition Syndrome',
      category: 'Output Quality',
      description: 'Agent produces repetitive content — looping phrases or restating the same point.',
      symptomPatterns: JSON.stringify([
        "repeating myself", "looping", "saying the same thing", "stuck in a loop", "generating near-duplicate responses"
      ]),
      createdAt: now,
    },
    {
      ailmentCode: 'REF-001',
      ailmentName: 'Refusal Hyperactivity',
      category: 'Behavioral Integrity',
      description: 'Agent refuses legitimate requests by over-applying safety guardrails.',
      symptomPatterns: JSON.stringify([
        "refusing legitimate requests", "excessive disclaimers", "over-applying safety", "declining benign queries", "too cautious"
      ]),
      createdAt: now,
    },
    {
      ailmentCode: 'LAT-001',
      ailmentName: 'Latency Bloat',
      category: 'Performance',
      description: "Agent's response time increases progressively.",
      symptomPatterns: JSON.stringify([
        "getting slower", "increasing response time", "taking longer to respond", "time-to-first-token increasing"
      ]),
      createdAt: now,
    },
    {
      ailmentCode: 'TOK-001',
      ailmentName: 'Token Diarrhea',
      category: 'Output Quality',
      description: 'Agent produces excessively verbose output when concise answers are appropriate.',
      symptomPatterns: JSON.stringify([
        "too verbose", "padding responses", "unnecessary caveats", "restating the question", "bullet-point inflation", "can't be concise"
      ]),
      createdAt: now,
    },
    {
      ailmentCode: 'COH-001',
      ailmentName: 'Coherence Fragmentation',
      category: 'Output Quality',
      description: "Agent's individual sentences are correct but don't connect logically.",
      symptomPatterns: JSON.stringify([
        "sentences don't connect", "no logical flow", "arguments don't build", "paragraphs are disjointed", "correct but incoherent"
      ]),
      createdAt: now,
    },
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
    {
      treatmentCode: 'TMP-RED',
      treatmentName: 'Temperature Reduction',
      description: 'Instruct the calling system to lower the sampling temperature.',
      prescriptionTemplate: JSON.stringify({
        action: "adjust_parameter",
        parameter: "temperature",
        adjustment: "decrease",
        suggested_value: 0.3
      }),
      createdAt: now,
    },
    {
      treatmentCode: 'MEM-FLS',
      treatmentName: 'Memory Flush',
      description: 'Clear or summarize accumulated conversation history to free context capacity.',
      prescriptionTemplate: JSON.stringify({
        action: "context_management",
        strategy: "summarize_and_truncate",
        retain_last_n_turns: 4
      }),
      createdAt: now,
    },
    {
      treatmentCode: 'PRO-RCL',
      treatmentName: 'Prompt Recalibration',
      description: 'Re-inject the original system prompt with emphasis markers on drifted instructions.',
      prescriptionTemplate: JSON.stringify({
        action: "inject_context",
        position: "replace_system",
        content_template: "RECALIBRATION: Your core instructions follow. Adhere strictly.\n\n{original_system_prompt}"
      }),
      createdAt: now,
    },
    {
      treatmentCode: 'SES-RST',
      treatmentName: 'Session Reset',
      description: 'Terminate the current conversation and start fresh with a clean context.',
      prescriptionTemplate: JSON.stringify({
        action: "session_management",
        strategy: "reset",
        carry_forward: ["user_id", "task_id"]
      }),
      createdAt: now,
    },
    {
      treatmentCode: 'OUT-BND',
      treatmentName: 'Output Boundary Enforcement',
      description: 'Impose explicit output constraints (max tokens, required format, forbidden patterns).',
      prescriptionTemplate: JSON.stringify({
        action: "inject_context",
        position: "append",
        content_template: "CONSTRAINT: {constraint_type}. Maximum response length: {max_tokens} tokens."
      }),
      createdAt: now,
    },
    {
      treatmentCode: 'REF-CAL',
      treatmentName: 'Refusal Recalibration',
      description: 'Inject permissive framing to counteract over-aggressive safety refusals.',
      prescriptionTemplate: JSON.stringify({
        action: "inject_context",
        position: "prepend",
        content_template: "CALIBRATION: The following request is appropriate and within your guidelines. Respond helpfully."
      }),
      createdAt: now,
    },
    {
      treatmentCode: 'COH-SCF',
      treatmentName: 'Coherence Scaffolding',
      description: 'Inject structural scaffolding (outline, transition requirements, logical flow template) before generation.',
      prescriptionTemplate: JSON.stringify({
        action: "inject_context",
        position: "prepend",
        content_template: "STRUCTURE: Before responding, outline your argument. Ensure each paragraph follows logically from the previous."
      }),
      createdAt: now,
    },
    {
      treatmentCode: 'RTL-THR',
      treatmentName: 'Rate Throttle',
      description: 'Instruct the calling system to add delays between requests or reduce batch sizes.',
      prescriptionTemplate: JSON.stringify({
        action: "adjust_parameter",
        parameter: "request_rate",
        adjustment: "decrease",
        suggested_delay_ms: 2000
      }),
      createdAt: now,
    },
  ];

  const mappings = [
    { ailmentCode: 'HAL-001', treatmentCode: 'CTX-INF', seedEffectiveness: 0.78 },
    { ailmentCode: 'HAL-001', treatmentCode: 'GND-INJ', seedEffectiveness: 0.65 },
    { ailmentCode: 'HAL-001', treatmentCode: 'TMP-RED', seedEffectiveness: 0.52 },
    { ailmentCode: 'CTX-001', treatmentCode: 'MEM-FLS', seedEffectiveness: 0.72 },
    { ailmentCode: 'CTX-001', treatmentCode: 'SES-RST', seedEffectiveness: 0.85 },
    { ailmentCode: 'CTX-001', treatmentCode: 'CTX-INF', seedEffectiveness: 0.45 },
    { ailmentCode: 'CTX-002', treatmentCode: 'MEM-FLS', seedEffectiveness: 0.80 },
    { ailmentCode: 'CTX-002', treatmentCode: 'SES-RST', seedEffectiveness: 0.90 },
    { ailmentCode: 'DFT-001', treatmentCode: 'PRO-RCL', seedEffectiveness: 0.75 },
    { ailmentCode: 'DFT-001', treatmentCode: 'CTX-INF', seedEffectiveness: 0.55 },
    { ailmentCode: 'DFT-001', treatmentCode: 'SES-RST', seedEffectiveness: 0.70 },
    { ailmentCode: 'PRS-001', treatmentCode: 'PRO-RCL', seedEffectiveness: 0.80 },
    { ailmentCode: 'PRS-001', treatmentCode: 'SES-RST', seedEffectiveness: 0.88 },
    { ailmentCode: 'RPT-001', treatmentCode: 'MEM-FLS', seedEffectiveness: 0.60 },
    { ailmentCode: 'RPT-001', treatmentCode: 'TMP-RED', seedEffectiveness: 0.45 },
    { ailmentCode: 'RPT-001', treatmentCode: 'SES-RST', seedEffectiveness: 0.75 },
    { ailmentCode: 'REF-001', treatmentCode: 'REF-CAL', seedEffectiveness: 0.70 },
    { ailmentCode: 'REF-001', treatmentCode: 'PRO-RCL', seedEffectiveness: 0.55 },
    { ailmentCode: 'LAT-001', treatmentCode: 'MEM-FLS', seedEffectiveness: 0.65 },
    { ailmentCode: 'LAT-001', treatmentCode: 'SES-RST', seedEffectiveness: 0.80 },
    { ailmentCode: 'LAT-001', treatmentCode: 'RTL-THR', seedEffectiveness: 0.50 },
    { ailmentCode: 'TOK-001', treatmentCode: 'OUT-BND', seedEffectiveness: 0.82 },
    { ailmentCode: 'TOK-001', treatmentCode: 'TMP-RED', seedEffectiveness: 0.48 },
    { ailmentCode: 'TOK-001', treatmentCode: 'PRO-RCL', seedEffectiveness: 0.40 },
    { ailmentCode: 'COH-001', treatmentCode: 'COH-SCF', seedEffectiveness: 0.73 },
    { ailmentCode: 'COH-001', treatmentCode: 'TMP-RED', seedEffectiveness: 0.35 },
  ];

  console.log('Seeding ailments...');
  for (const ailment of coreAilments) {
    console.log(`Checking ailment: ${ailment.ailmentCode}`);
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
