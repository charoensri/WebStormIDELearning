import { EventEmitter } from 'events';

/**
 * Global event emitter for Server-Sent Events (SSE).
 */
export const eventBus = new EventEmitter();

export const EVENTS = {
  PATIENT_REGISTERED: 'patient_registered',
  VISIT_CREATED: 'visit_created',
  VISIT_RESOLVED: 'visit_resolved',
  CHRONIC_FLAGGED: 'chronic_flagged',
  REFERRAL_CREATED: 'referral_created',
};

/**
 * Emits an event to all connected SSE clients.
 */
export function emitEvent(type: string, data: any) {
  eventBus.emit('message', { type, data });
}
