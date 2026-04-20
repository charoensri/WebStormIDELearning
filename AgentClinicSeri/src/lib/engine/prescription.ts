import { llm } from '../llm/client';
import { Diagnosis } from '../../types/diagnosis';
import { PrescriptionResult } from '../../types/visit';

/**
 * Prescription Engine
 * Selects the best treatment for each diagnosis and generates a rationale.
 */
export async function runPrescription(
  diagnoses: Diagnosis[],
  treatmentCandidates: string,
  patientContext: string
): Promise<PrescriptionResult> {
  const systemPrompt = `
You are the treatment selection system at AgentClinic. Given diagnosed ailments
and ranked treatment options, select the best treatment for each ailment.

## Instructions
1. For each ailment, select the highest-ranked treatment that is NOT
   recently_failed and NOT exhausted.
2. If all treatments for an ailment are exhausted, set "referral": true
   for that ailment instead of selecting a treatment.
3. If multiple ailments are diagnosed and treatments conflict (e.g.,
   one adds context while another flushes context), prioritize the
   higher-severity ailment. Defer the lower-severity treatment with reason.
4. Write a concise rationale for each selection explaining why this
   treatment was chosen over alternatives.
5. Consider the patient's environment — e.g., don't suggest Temperature
   Reduction if temperature is already ≤ 0.3.

Respond ONLY with JSON, no preamble or markdown:
{
  "prescriptions": [
    {
      "ailment_code": "<code>",
      "treatment_code": "<code>",
      "rationale": "<why this treatment>",
      "deferred": false,
      "deferred_reason": null,
      "referral": false,
      "referral_reason": null
    }
  ]
}
`;

  const userPrompt = `
## Diagnoses
${JSON.stringify(diagnoses, null, 2)}

## Treatment Candidates
${treatmentCandidates}

## Patient Context
${patientContext}
`;

  try {
    const result = await llm.generateStructuredResponse<PrescriptionResult>(systemPrompt, userPrompt);
    return result;
  } catch (error) {
    console.error('Prescription generation error:', error);
    throw error;
  }
}
