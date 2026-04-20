import { Diagnosis } from './diagnosis';

export interface Prescription {
  ailment_code: string;
  treatment_code: string;
  treatment_name: string;
  prescription_payload: any;
  rationale: string;
  deferred: boolean;
  deferred_reason?: string | null;
  referral: boolean;
  referral_reason?: string | null;
}

export interface FollowupReport {
  submitted_at: string;
  outcome: 'improved' | 'no_change' | 'worsened' | 'unknown';
  outcome_text?: string | null;
  metrics?: any;
}

export interface VisitRecord {
  visit_id: string;
  patient_id: string;
  state: 'TRIAGE' | 'DIAGNOSED' | 'PRESCRIBED' | 'AWAITING_FOLLOWUP' | 'RESOLVED' | 'UNRESOLVED' | 'EXPIRED';
  created_at: string;
  updated_at: string;
  symptom_text: string;
  severity: number | null;
  diagnoses: Diagnosis[] | null;
  prescriptions: Prescription[] | null;
  followup_due: string | null;
  recurrence_flag: boolean;
}

export interface PrescriptionResult {
  prescriptions: {
    ailment_code: string;
    treatment_code: string;
    rationale: string;
    deferred: boolean;
    deferred_reason: string | null;
    referral: boolean;
    referral_reason: string | null;
  }[];
}
