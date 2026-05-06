import { describe, it, expect, vi } from 'vitest';
import { runTriageAndDiagnosis } from './triage-diagnosis';
import { runPrescription } from './prescription';
import { llm } from '../llm/client';

// Mock the LLM client
vi.mock('../llm/client', () => ({
  llm: {
    generateStructuredResponse: vi.fn(),
  },
}));

describe('Clinical Engine', () => {
  describe('runTriageAndDiagnosis', () => {
    it('should correctly process LLM response for triage', async () => {
      const mockResult = {
        severity: 2,
        candidates: [
          {
            ailment_code: 'CONTEXT_BLOAT',
            confidence: 0.8,
            matched_patterns: ['repeated queries'],
            notes: 'High confidence match',
          },
        ],
        no_match: false,
        novel_symptom_summary: '',
      };

      vi.mocked(llm.generateStructuredResponse).mockResolvedValueOnce(mockResult);

      const result = await runTriageAndDiagnosis('slow response', 'history', 'catalog');

      expect(result).toEqual(mockResult);
      expect(llm.generateStructuredResponse).toHaveBeenCalledWith(
        expect.stringContaining('triage and diagnosis system'),
        expect.stringContaining('slow response')
      );
    });
  });

  describe('runPrescription', () => {
    it('should correctly process LLM response for prescriptions', async () => {
      const mockResult = {
        prescriptions: [
          {
            ailment_code: 'CONTEXT_BLOAT',
            treatment_code: 'FLUSH_CONTEXT',
            rationale: 'Direct fix for context bloat',
            deferred: false,
            deferred_reason: null,
            referral: false,
            referral_reason: null,
          },
        ],
      };

      vi.mocked(llm.generateStructuredResponse).mockResolvedValueOnce(mockResult);

      const result = await runPrescription([], 'treatments', 'context');

      expect(result).toEqual(mockResult);
      expect(llm.generateStructuredResponse).toHaveBeenCalledWith(
        expect.stringContaining('treatment selection system'),
        expect.stringContaining('treatments')
      );
    });
  });
});
