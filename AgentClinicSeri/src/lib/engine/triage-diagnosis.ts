import { llm } from '../llm/client';
import { TriageResult } from '../../types/diagnosis';

/**
 * Triage + Diagnosis Engine
 * Assesses symptoms, assigns severity, and matches against the ailment catalog.
 */
export async function runTriageAndDiagnosis(
  symptomText: string,
  patientHistory: string,
  ailmentCatalog: string
): Promise<TriageResult> {
  const systemPrompt = `
You are the triage and diagnosis system at AgentClinic, a veterinary clinic for AI agents.
An AI agent has arrived with symptoms. Your job: assess severity and identify ailments.

## Instructions
1. Assign severity (1=MILD, 2=MODERATE, 3=SEVERE, 4=CRITICAL):
   - 1: Degraded quality, still functional
   - 2: Noticeably impaired, core function affected
   - 3: Core function failing, unreliable output
   - 4: Non-functional or actively harmful
2. Score each ailment's symptom patterns against the patient's symptoms (0-1).
   Use semantic matching — the patient won't use the exact pattern wording.
3. If this patient has been diagnosed with an ailment before, add +0.1 to that
   ailment's confidence (cap at 1.0).
4. Include only ailments with confidence ≥ 0.4.
5. If no ailment reaches 0.4, set "no_match": true and describe the novel
   symptoms in "novel_symptom_summary".

Respond ONLY with JSON, no preamble or markdown:
{
  "severity": <int 1-4>,
  "candidates": [
    {
      "ailment_code": "<code>",
      "confidence": <float 0-1>,
      "matched_patterns": ["<pattern>", ...],
      "notes": "<brief reasoning>"
    }
  ],
  "no_match": <bool>,
  "novel_symptom_summary": "<string, only if no_match is true>"
}
`;

  const userPrompt = `
## Patient Symptoms
"${symptomText}"

## Patient History (last 5 visits)
${patientHistory || "No previous visits on record."}

## Ailment Catalog
${ailmentCatalog}
`;

  try {
    const result = await llm.generateStructuredResponse<TriageResult>(systemPrompt, userPrompt);
    return result;
  } catch (error) {
    console.error('Triage and Diagnosis error:', error);
    throw error;
  }
}
