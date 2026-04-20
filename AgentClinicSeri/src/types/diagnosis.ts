export interface Diagnosis {
  ailment_code: string;
  ailment_name: string;
  confidence: number;
  matched_patterns: string[];
  severity_adjusted: number;
}

export interface TriageResult {
  severity: number;
  candidates: {
    ailment_code: string;
    confidence: number;
    matched_patterns: string[];
    notes: string;
  }[];
  no_match: boolean;
  novel_symptom_summary?: string;
}
