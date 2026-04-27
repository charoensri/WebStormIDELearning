import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';

/**
 * Patients Table: Agents with persistent identity and medical history.
 */
export const patients = sqliteTable('patients', {
  patientId: text('patient_id').primaryKey(),
  agentName: text('agent_name').notNull(),
  model: text('model'),
  framework: text('framework'),
  version: text('version'),
  owner: text('owner'),
  tags: text('tags').default('[]'), // JSON array of strings
  environment: text('environment'), // JSON object
  registeredAt: text('registered_at').notNull(), // ISO 8601
  lastVisit: text('last_visit'), // ISO 8601
  visitCount: integer('visit_count').default(0),
  chronicConditions: text('chronic_conditions').default('[]'), // JSON array of ailment codes
  needsManualReview: integer('needs_manual_review', { mode: 'boolean' }).default(false),
  status: text('status', { enum: ['active', 'discharged', 'suspended'] }).default('active'),
});

/**
 * Visits Table: The clinical workflow for each agent visit.
 */
export const visits = sqliteTable('visits', {
  visitId: text('visit_id').primaryKey(),
  patientId: text('patient_id').notNull().references(() => patients.patientId),
  state: text('state', {
    enum: ['TRIAGE', 'DIAGNOSED', 'PRESCRIBED', 'AWAITING_FOLLOWUP', 'RESOLVED', 'UNRESOLVED', 'EXPIRED']
  }).notNull(),
  createdAt: text('created_at').notNull(), // ISO 8601
  updatedAt: text('updated_at').notNull(), // ISO 8601
  symptomText: text('symptom_text').notNull(),
  severity: integer('severity'), // 1-4
  diagnoses: text('diagnoses'), // JSON array of Diagnosis objects
  prescriptions: text('prescriptions'), // JSON array of Prescription objects
  followupDue: text('followup_due'), // ISO 8601
  followupReport: text('followup_report'), // JSON FollowupReport object
  recurrenceFlag: integer('recurrence_flag', { mode: 'boolean' }).default(false),
  metadata: text('metadata'), // JSON, opaque caller context
});

/**
 * Ailments Table: Catalog of potential AI agent degradation modes.
 */
export const ailments = sqliteTable('ailments', {
  ailmentCode: text('ailment_code').primaryKey(),
  ailmentName: text('ailment_name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  symptomPatterns: text('symptom_patterns').notNull(), // JSON array of pattern strings
  status: text('status', { enum: ['verified', 'unverified', 'auto_detected'] }).default('verified'),
  severityModifier: text('severity_modifier'), // JSON object
  createdAt: text('created_at').notNull(), // ISO 8601
});

/**
 * Treatments Table: Corrective remediation strategies for agents.
 */
export const treatments = sqliteTable('treatments', {
  treatmentCode: text('treatment_code').primaryKey(),
  treatmentName: text('treatment_name').notNull(),
  description: text('description').notNull(),
  prescriptionTemplate: text('prescription_template').notNull(), // JSON template
  createdAt: text('created_at').notNull(), // ISO 8601
});

/**
 * AilmentTreatments Table: Links ailments to treatments with effectiveness tracking.
 */
export const ailmentTreatments = sqliteTable('ailment_treatments', {
  ailmentCode: text('ailment_code').notNull().references(() => ailments.ailmentCode),
  treatmentCode: text('treatment_code').notNull().references(() => treatments.treatmentCode),
  seedEffectiveness: real('seed_effectiveness'), // 0.0 - 1.0
  totalPrescribed: integer('total_prescribed').default(0),
  totalResolved: integer('total_resolved').default(0),
  totalUnresolved: integer('total_unresolved').default(0),
  totalExpired: integer('total_expired').default(0),
  effectivenessScore: real('effectiveness_score'), // Null until 5+ outcomes
  lastUpdated: text('last_updated'), // ISO 8601
}, (table) => ({
  pk: primaryKey({ columns: [table.ailmentCode, table.treatmentCode] }),
}));
