import { describe, it, expect, vi, beforeEach } from 'vitest';
import { app } from './app';

// Mock the database
vi.mock('./lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => []),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve()),
    })),
    query: {
      patients: {
        findFirst: vi.fn(),
      },
    },
  },
}));

// Mock the clinical engine
vi.mock('./lib/engine/pipeline', () => ({
  processVisit: vi.fn(),
}));

// Mock event emitter
vi.mock('./lib/events', () => ({
  emitEvent: vi.fn(),
  EVENTS: {
    PATIENT_REGISTERED: 'patient_registered',
    VISIT_CREATED: 'visit_created',
  },
}));

describe('API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/patients - successfully registers a patient', async () => {
    const res = await app.request('/api/patients', {
      method: 'POST',
      body: JSON.stringify({
        agent_name: 'TestAgent',
        model: 'gpt-4',
        framework: 'langchain',
        owner: 'user1'
      }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.agent_name).toBe('TestAgent');
    expect(data.patient_id).toBeDefined();
  });

  it('POST /api/patients - fails if agent_name is missing', async () => {
    const res = await app.request('/api/patients', {
      method: 'POST',
      body: JSON.stringify({ model: 'gpt-4' }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('agent_name is required');
  });
});
