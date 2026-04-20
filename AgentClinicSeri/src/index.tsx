import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Home } from './pages/Home'
import { seed } from './lib/db/seed'
import { db } from './lib/db'
import { patients, ailments, visits } from './lib/db/schema'
import { v4 as uuidv4 } from 'uuid'
import { processVisit } from './lib/engine/pipeline'
import { processFollowup } from './lib/engine/followup'
import { startBackgroundJobs } from './lib/background'

const app = new Hono()

// Seed the database on startup (for MVP simplicity)
seed().catch(err => console.error('Seeding failed:', err));

// Serve static files from the /static folder
app.use('/static/*', serveStatic({ root: './' }))

// Main home route
app.get('/', async (c) => {
  const allPatients = await db.select().from(patients);
  const allVisits = await db.select().from(visits);
  
  const activePatients = allPatients.filter(p => p.status === 'active').length;
  const openVisits = allVisits.filter(v => v.state === 'AWAITING_FOLLOWUP' || v.state === 'TRIAGE' || v.state === 'DIAGNOSED').length;
  
  const resolvedCount = allVisits.filter(v => v.state === 'RESOLVED').length;
  const terminalCount = allVisits.filter(v => v.state === 'RESOLVED' || v.state === 'UNRESOLVED').length;
  const resolutionRate = terminalCount > 0 ? (resolvedCount / terminalCount) : 0;

  const stats = {
    active_patients: activePatients,
    open_visits: openVisits,
    resolution_rate: resolutionRate,
    total_patients: allPatients.length,
    total_visits: allVisits.length,
  };

  const recentVisits = allVisits.slice(-10).reverse();

  return c.html(<Home stats={stats} recentVisits={recentVisits} />)
})

// --- API ROUTES ---

// Patient Registration
app.post('/api/patients', async (c) => {
  const body = await c.req.json();
  const { agent_name, model, framework, owner } = body;

  if (!agent_name) {
    return c.json({ error: 'agent_name is required' }, 400);
  }

  const patientId = uuidv4();
  const now = new Date().toISOString();

  await db.insert(patients).values({
    patientId,
    agentName: agent_name,
    model: model || null,
    framework: framework || null,
    owner: owner || null,
    registeredAt: now,
  });

  return c.json({ patient_id: patientId, agent_name }, 201);
});

// Start a Visit
app.post('/api/visits', async (c) => {
  try {
    const body = await c.req.json();
    const { patient_id, symptom_text, metadata } = body;

    if (!patient_id || !symptom_text) {
      return c.json({ error: 'patient_id and symptom_text are required' }, 400);
    }

    const visit = await processVisit(patient_id, symptom_text, metadata);
    
    // Parse JSON fields for response
    return c.json({
      ...visit,
      diagnoses: visit?.diagnoses ? JSON.parse(visit.diagnoses) : [],
      prescriptions: visit?.prescriptions ? JSON.parse(visit.prescriptions) : [],
    });
  } catch (error) {
    console.error('Visit processing failed:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// Submit Follow-up
app.post('/api/visits/:id/followup', async (c) => {
  try {
    const visitId = c.req.param('id');
    const body = await c.req.json();
    const { outcome, outcome_text, metrics } = body;

    if (!outcome) {
      return c.json({ error: 'outcome is required' }, 400);
    }

    const updatedVisit = await processFollowup(visitId, { outcome, outcome_text, metrics });

    return c.json({
      ...updatedVisit,
      diagnoses: updatedVisit?.diagnoses ? JSON.parse(updatedVisit.diagnoses) : [],
      prescriptions: updatedVisit?.prescriptions ? JSON.parse(updatedVisit.prescriptions) : [],
      followupReport: updatedVisit?.followupReport ? JSON.parse(updatedVisit.followupReport) : null,
    });
  } catch (error) {
    console.error('Follow-up processing failed:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// List Ailments
app.get('/api/ailments', async (c) => {
  const allAilments = await db.select().from(ailments);
  return c.json({ ailments: allAilments });
});

// Analytics Overview
app.get('/api/analytics/overview', async (c) => {
  const allPatients = await db.select().from(patients);
  const allVisits = await db.select().from(visits);
  
  const activePatients = allPatients.filter(p => p.status === 'active').length;
  const openVisits = allVisits.filter(v => v.state === 'AWAITING_FOLLOWUP' || v.state === 'TRIAGE' || v.state === 'DIAGNOSED').length;
  
  const resolvedCount = allVisits.filter(v => v.state === 'RESOLVED').length;
  const terminalCount = allVisits.filter(v => v.state === 'RESOLVED' || v.state === 'UNRESOLVED').length;
  const resolutionRate = terminalCount > 0 ? (resolvedCount / terminalCount) : 0;

  return c.json({
    active_patients: activePatients,
    open_visits: openVisits,
    resolution_rate: resolutionRate,
    total_patients: allPatients.length,
    total_visits: allVisits.length,
    recent_visits: allVisits.slice(-10).reverse()
  });
});

// List Patients
app.get('/api/patients', async (c) => {
  const allPatients = await db.select().from(patients);
  return c.json({ patients: allPatients });
});

// Start background jobs
startBackgroundJobs();

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

// Start the server
serve({
  fetch: app.fetch,
  port
})
