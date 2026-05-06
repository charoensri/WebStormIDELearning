import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Home } from './pages/Home'
import { PatientList } from './pages/PatientList'
import { PatientDetail } from './pages/PatientDetail'
import { AilmentList } from './pages/AilmentList'
import { TreatmentList } from './pages/TreatmentList'
import { Alerts } from './pages/Alerts'
import { Analytics } from './pages/Analytics'
import { VisitList } from './pages/VisitList'
import { ErrorPage } from './pages/ErrorPage'
import { seed } from './lib/db/seed'
import { db } from './lib/db'
import { patients, ailments, visits, treatments, ailmentTreatments } from './lib/db/schema'
import { eq, desc, and, gt, like, or } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { processVisit } from './lib/engine/pipeline'
import { processFollowup } from './lib/engine/followup'
import { startBackgroundJobs } from './lib/background'
import { stream } from 'hono/streaming'
import { eventBus, EVENTS, emitEvent } from './lib/events'

export const app = new Hono()

// Seed the database on startup (for MVP simplicity) - update 2
if (process.env.NODE_ENV !== 'test') {
  seed().catch(err => console.error('Seeding failed:', err));
}

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

  const reviewPatients = allPatients.filter(p => p.needsManualReview);

  // --- Compute Chart Data ---
  const ailmentCounts: Record<string, number> = {};
  const severityCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };

  allVisits.forEach(v => {
    // Ailments
    if (v.diagnoses) {
      const diags = JSON.parse(v.diagnoses);
      diags.forEach((d: any) => {
        const name = d.ailment_name || d.ailment_code;
        ailmentCounts[name] = (ailmentCounts[name] || 0) + 1;
      });
    }
    // Severity
    if (v.severity) {
      severityCounts[v.severity as keyof typeof severityCounts] = (severityCounts[v.severity as keyof typeof severityCounts] || 0) + 1;
    }
  });

  const ailmentData = Object.entries(ailmentCounts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const severityData = [
    { label: 'Mild', count: severityCounts[1] },
    { label: 'Moderate', count: severityCounts[2] },
    { label: 'Severe', count: severityCounts[3] },
    { label: 'Critical', count: severityCounts[4] },
  ];

  const stats = {
    active_patients: activePatients,
    open_visits: openVisits,
    resolution_rate: resolutionRate,
    total_patients: allPatients.length,
    total_visits: allVisits.length,
    needs_review_count: reviewPatients.length,
  };

  const recentVisits = allVisits.slice(-10).reverse().map(v => {
    const patient = allPatients.find(p => p.patientId === v.patientId);
    return {
      ...v,
      agentName: patient?.agentName || 'Unknown Agent'
    };
  });

  return c.html(<Home stats={stats} recentVisits={recentVisits} reviewPatients={reviewPatients} ailmentData={ailmentData} severityData={severityData} />)
})

// --- HTML DASHBOARD ROUTES ---

// Patient List Page
app.get('/patients', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const q = c.req.query('q') || '';
  const statusFilter = c.req.query('status') || '';
  const limit = 10;
  const offset = (page - 1) * limit;

  const whereConditions = [];
  if (q) {
    whereConditions.push(or(
      like(patients.agentName, `%${q}%`),
      like(patients.model, `%${q}%`)
    ));
  }
  if (statusFilter) {
    whereConditions.push(eq(patients.status, statusFilter as 'active' | 'discharged' | 'suspended'));
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const allPatients = await db.select().from(patients)
    .where(whereClause)
    .limit(limit)
    .offset(offset);
  
  // Get total count for pagination
  const totalResult = await db.select({ count: patients.patientId })
    .from(patients)
    .where(whereClause);
  
  const totalCount = totalResult.length; // Simplified count for SQLite/Drizzle MVP
  const totalPages = Math.ceil(totalCount / limit);

  return c.html(<PatientList patients={allPatients} currentPage={page} totalPages={totalPages} query={q} status={statusFilter} />)
})

// Patient Detail Page (Timeline)
app.get('/patients/:id', async (c) => {
  const id = c.req.param('id');
  const patient = await db.query.patients.findFirst({
    where: eq(patients.patientId, id)
  });
  
  if (!patient) return c.text('Patient not found', 404);
  
  const patientVisits = await db.query.visits.findMany({
    where: eq(visits.patientId, id),
    orderBy: [desc(visits.createdAt)]
  });
  
  return c.html(<PatientDetail patient={patient} visits={patientVisits} />)
})

// Ailment Catalog Page
app.get('/ailments', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const q = c.req.query('q') || '';
  const categoryFilter = c.req.query('category') || '';
  const statusFilter = c.req.query('status') || '';
  const limit = 10;
  const offset = (page - 1) * limit;

  const whereConditions = [];
  if (q) {
    whereConditions.push(or(
      like(ailments.ailmentName, `%${q}%`),
      like(ailments.ailmentCode, `%${q}%`)
    ));
  }
  if (categoryFilter) {
    whereConditions.push(eq(ailments.category, categoryFilter));
  }
  if (statusFilter) {
    whereConditions.push(eq(ailments.status, statusFilter as 'verified' | 'unverified' | 'auto_detected'));
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const allAilments = await db.select().from(ailments)
    .where(whereClause)
    .limit(limit)
    .offset(offset);
  
  // Get total count for pagination
  const totalResult = await db.select({ count: ailments.ailmentCode })
    .from(ailments)
    .where(whereClause);
  
  const totalCount = totalResult.length;
  const totalPages = Math.ceil(totalCount / limit);

  return c.html(<AilmentList ailments={allAilments} currentPage={page} totalPages={totalPages} query={q} category={categoryFilter} status={statusFilter} />)
})

// Therapy Catalog Page
app.get('/therapies', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const q = c.req.query('q') || '';
  const limit = 10;
  const offset = (page - 1) * limit;

  const whereClause = q ? or(
    like(treatments.treatmentName, `%${q}%`),
    like(treatments.treatmentCode, `%${q}%`)
  ) : undefined;

  const allTreatments = await db.select().from(treatments)
    .where(whereClause)
    .limit(limit)
    .offset(offset);
  
  // Get total count for pagination
  const totalResult = await db.select({ count: treatments.treatmentCode })
    .from(treatments)
    .where(whereClause);
  
  const totalCount = totalResult.length;
  const totalPages = Math.ceil(totalCount / limit);

  return c.html(<TreatmentList treatments={allTreatments} currentPage={page} totalPages={totalPages} query={q} />)
})

// Alerts & Referrals Page
app.get('/alerts', async (c) => {
  const allPatients = await db.select().from(patients);
  const allVisits = await db.select().from(visits);

  const chronicPatients = allPatients.filter(p => {
    const chronic = JSON.parse(p.chronicConditions || '[]');
    return chronic.length > 0;
  });

  const referrals: any[] = [];
  allVisits.forEach(v => {
    if (v.prescriptions) {
      const pxs = JSON.parse(v.prescriptions);
      pxs.forEach((p: any) => {
        if (p.referral) {
          const patient = allPatients.find(pat => pat.patientId === v.patientId);
          referrals.push({
            patientId: v.patientId,
            agentName: patient?.agentName || 'Unknown',
            ailmentCode: p.ailment_code,
            reason: p.referral_reason,
            recommendation: "Manual investigation recommended.",
            date: v.createdAt
          });
        }
      });
    }
  });

  return c.html(<Alerts referrals={referrals.reverse()} chronicPatients={chronicPatients} />)
})

// Clinical Analytics Page
app.get('/analytics', async (c) => {
  const allVisits = await db.select().from(visits);
  const allAilments = await db.select().from(ailments);
  const allTreatments = await db.select().from(treatments);
  const allMappings = await db.select().from(ailmentTreatments);

  // 1. Heatmap Data (Ailment x Severity)
  const heatmapData: any[] = [];
  const severities = [1, 2, 3, 4];
  const severityLabels = ['Mild', 'Moderate', 'Severe', 'Critical'];

  allAilments.forEach(ailment => {
    severities.forEach((sev, idx) => {
      const count = allVisits.filter(v => {
        if (v.severity !== sev) return false;
        const diags = JSON.parse(v.diagnoses || '[]');
        return diags.some((d: any) => d.ailment_code === ailment.ailmentCode);
      }).length;
      
      heatmapData.push({
        ailment: ailment.ailmentName,
        x: severityLabels[idx],
        y: count
      });
    });
  });

  // 2. Trend Data (Last 7 Days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const topAilments = allAilments.slice(0, 5); // Just top 5 for clarity
  const trendData = topAilments.map(ailment => ({
    name: ailment.ailmentName,
    data: last7Days.map(date => ({
      x: date,
      y: allVisits.filter(v => {
        const vDate = v.createdAt.split('T')[0];
        if (vDate !== date) return false;
        const diags = JSON.parse(v.diagnoses || '[]');
        return diags.some((d: any) => d.ailment_code === ailment.ailmentCode);
      }).length
    }))
  }));

  // 3. Effectiveness Rankings
  const uniqueMappings: Record<string, any> = {};
  allMappings.forEach(m => {
    const key = `${m.ailmentCode}|${m.treatmentCode}`;
    if (!uniqueMappings[key]) uniqueMappings[key] = m;
  });

  const effectivenessData = Object.values(uniqueMappings).map(m => {
    const ailment = allAilments.find(a => a.ailmentCode === m.ailmentCode);
    const treatment = allTreatments.find(t => t.treatmentCode === m.treatmentCode);
    
    const resolved = allVisits.filter(v => {
      if (v.state !== 'RESOLVED') return false;
      const diags = JSON.parse(v.diagnoses || '[]');
      const pxs = JSON.parse(v.prescriptions || '[]');
      return diags.some((d: any) => d.ailment_code === m.ailmentCode) && 
             pxs.some((p: any) => p.treatment_code === m.treatmentCode);
    }).length;

    const unresolved = allVisits.filter(v => {
      if (v.state !== 'UNRESOLVED') return false;
      const diags = JSON.parse(v.diagnoses || '[]');
      const pxs = JSON.parse(v.prescriptions || '[]');
      return diags.some((d: any) => d.ailment_code === m.ailmentCode) && 
             pxs.some((p: any) => p.treatment_code === m.treatmentCode);
    }).length;

    return {
      ailmentName: ailment?.ailmentName || m.ailmentCode,
      ailmentCode: m.ailmentCode,
      treatmentName: treatment?.treatmentName || m.treatmentCode,
      treatmentCode: m.treatmentCode,
      totalResolved: resolved,
      totalUnresolved: unresolved,
      effectivenessScore: m.effectivenessScore,
      seedEffectiveness: m.seedEffectiveness
    };
  }).sort((a, b) => {
    const scoreA = a.effectivenessScore !== null ? a.effectivenessScore : -1;
    const scoreB = b.effectivenessScore !== null ? b.effectivenessScore : -1;
    return scoreB - scoreA;
  });

  const reviewQueue = allAilments.filter(a => a.status === 'auto_detected' || a.status === 'unverified');

  return c.html(
    <Analytics 
      heatmapData={heatmapData} 
      ailmentNames={allAilments.map(a => a.ailmentName)}
      trendData={trendData}
      effectivenessData={effectivenessData}
      reviewQueue={reviewQueue}
    />
  )
})

// Filtered Visit List Page
app.get('/visits', async (c) => {
  const ailmentCode = c.req.query('ailment');
  const treatmentCode = c.req.query('treatment');
  const state = c.req.query('state');
  const q = c.req.query('q') || '';
  const page = parseInt(c.req.query('page') || '1');
  const limit = 10;
  const offset = (page - 1) * limit;

  let allVisits = await db.select().from(visits);

  // Filter in memory for complex JSON fields
  const filteredVisits = allVisits.filter(v => {
    let match = true;
    
    if (state && v.state !== state) match = false;
    
    if (ailmentCode) {
      const diags = JSON.parse(v.diagnoses || '[]');
      if (!diags.some((d: any) => d.ailment_code === ailmentCode)) match = false;
    }
    
    if (treatmentCode) {
      const pxs = JSON.parse(v.prescriptions || '[]');
      if (!pxs.some((p: any) => p.treatment_code === treatmentCode)) match = false;
    }

    if (q) {
      if (!v.symptomText.toLowerCase().includes(q.toLowerCase())) match = false;
    }
    
    return match;
  });

  const totalCount = filteredVisits.length;
  const totalPages = Math.ceil(totalCount / limit);
  const paginatedVisits = filteredVisits.reverse().slice(offset, offset + limit);

  let title = 'Clinical Visits';
  if (ailmentCode && treatmentCode) title = `Visits: ${ailmentCode} + ${treatmentCode}`;
  if (state) title += ` (${state})`;

  return c.html(<VisitList visits={paginatedVisits} title={title} currentPage={page} totalPages={totalPages} state={state} query={q} />)
})

// --- API ROUTES ---

// Patient Registration
app.post('/api/patients', async (c) => {
  console.log('[API] POST /api/patients called');
  const body = await c.req.json();
  const { agent_name, model, framework, owner } = body;
  console.log(`[API] Registering agent: ${agent_name}`);

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
    status: 'active',
  });

  // Emit real-time event
  emitEvent(EVENTS.PATIENT_REGISTERED, { patientId, agent_name });

  return c.json({ patient_id: patientId, agent_name }, 201);
});

// Start a Visit
app.post('/api/visits', async (c) => {
  try {
    console.log('[API] POST /api/visits called');
    const body = await c.req.json();
    const { patient_id, symptom_text, metadata } = body;

    if (!patient_id || !symptom_text) {
      return c.json({ error: 'patient_id and symptom_text are required' }, 400);
    }

    const visit = await processVisit(patient_id, symptom_text, metadata);
    
    // Emit real-time event
    emitEvent(EVENTS.VISIT_CREATED, { visitId: visit?.visitId, patientId: patient_id });

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

// List Visits
app.get('/api/visits', async (c) => {
  const patientId = c.req.query('patient_id');
  const state = c.req.query('state');
  
  let query = db.select().from(visits);
  // Simple filtering for base columns
  const allVisits = await query;
  const filtered = allVisits.filter(v => {
    if (patientId && v.patientId !== patientId) return false;
    if (state && v.state !== state) return false;
    return true;
  });

  const parsed = filtered.map(v => ({
    ...v,
    diagnoses: v.diagnoses ? JSON.parse(v.diagnoses) : [],
    prescriptions: v.prescriptions ? JSON.parse(v.prescriptions) : [],
    followupReport: v.followupReport ? JSON.parse(v.followupReport) : null,
  }));

  return c.json({ visits: parsed, total: parsed.length });
});

// Get Single Visit
app.get('/api/visits/:id', async (c) => {
  const id = c.req.param('id');
  const visit = await db.query.visits.findFirst({
    where: eq(visits.visitId, id)
  });
  if (!visit) return c.json({ error: 'Visit not found' }, 404);
  return c.json({
    ...visit,
    diagnoses: visit.diagnoses ? JSON.parse(visit.diagnoses) : [],
    prescriptions: visit.prescriptions ? JSON.parse(visit.prescriptions) : [],
    followupReport: visit.followupReport ? JSON.parse(visit.followupReport) : null,
  });
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

    // Emit real-time event
    emitEvent(EVENTS.VISIT_RESOLVED, { visitId, outcome });

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

// Register Custom Ailment (Manual)
app.post('/api/ailments', async (c) => {
  const body = await c.req.json();
  const { ailment_code, ailment_name, category, description, symptom_patterns } = body;

  if (!ailment_code || !ailment_name) {
    return c.json({ error: 'ailment_code and ailment_name are required' }, 400);
  }

  await db.insert(ailments).values({
    ailmentCode: ailment_code,
    ailmentName: ailment_name,
    category: category || 'Manual',
    description: description || '',
    symptomPatterns: JSON.stringify(symptom_patterns || []),
    status: 'unverified',
    createdAt: new Date().toISOString(),
  });

  const created = await db.query.ailments.findFirst({ where: eq(ailments.ailmentCode, ailment_code) });
  return c.json(created, 201);
});

// Update Ailment (Verification/Management)
app.patch('/api/ailments/:code', async (c) => {
  const code = c.req.param('code');
  const body = await c.req.json();
  
  const existing = await db.query.ailments.findFirst({
    where: eq(ailments.ailmentCode, code)
  });
  if (!existing) return c.json({ error: 'Ailment not found' }, 404);

  await db.update(ailments).set({
    ailmentName: body.ailment_name !== undefined ? body.ailment_name : existing.ailmentName,
    category: body.category !== undefined ? body.category : existing.category,
    description: body.description !== undefined ? body.description : existing.description,
    status: body.status !== undefined ? body.status : existing.status,
  }).where(eq(ailments.ailmentCode, code));

  const updated = await db.query.ailments.findFirst({ where: eq(ailments.ailmentCode, code) });
  return c.json(updated);
});

// Dismiss Ailment (Delete)
app.delete('/api/ailments/:code', async (c) => {
  const code = c.req.param('code');
  
  // 1. Delete mappings first (due to potential FK constraints)
  await db.delete(ailmentTreatments).where(eq(ailmentTreatments.ailmentCode, code));
  
  // 2. Delete the ailment
  const result = await db.delete(ailments).where(eq(ailments.ailmentCode, code));
  
  if (result.changes === 0) return c.json({ error: 'Ailment not found' }, 404);
  
  return c.json({ message: 'Ailment dismissed successfully' });
});

// Merge Ailment
app.post('/api/ailments/:code/merge', async (c) => {
  const sourceCode = c.req.param('code');
  const { target_code: targetCode } = await c.req.json();

  if (!targetCode) return c.json({ error: 'target_code is required' }, 400);

  const targetAilment = await db.query.ailments.findFirst({
    where: eq(ailments.ailmentCode, targetCode)
  });
  if (!targetAilment) return c.json({ error: 'Target ailment not found' }, 404);

  // 1. Find all visits that reference this custom ailment
  const allVisits = await db.select().from(visits);
  
  for (const v of allVisits) {
    if (v.diagnoses) {
      let diags = JSON.parse(v.diagnoses);
      let changed = false;
      
      diags = diags.map((d: any) => {
        if (d.ailment_code === sourceCode) {
          changed = true;
          return {
            ...d,
            ailment_code: targetCode,
            ailment_name: targetAilment.ailmentName
          };
        }
        return d;
      });

      if (changed) {
        await db.update(visits).set({
          diagnoses: JSON.stringify(diags),
          updatedAt: new Date().toISOString()
        }).where(eq(visits.visitId, v.visitId));
      }
    }
  }

  // 2. Clean up mappings and delete the source ailment
  await db.delete(ailmentTreatments).where(eq(ailmentTreatments.ailmentCode, sourceCode));
  await db.delete(ailments).where(eq(ailments.ailmentCode, sourceCode));

  return c.json({ message: `Merged ${sourceCode} into ${targetCode} successfully.` });
});

// Get Single Ailment
app.get('/api/ailments/:code', async (c) => {
  const code = c.req.param('code');
  const ailment = await db.query.ailments.findFirst({
    where: eq(ailments.ailmentCode, code)
  });
  if (!ailment) return c.json({ error: 'Ailment not found' }, 404);
  
  const associations = await db.select().from(ailmentTreatments)
    .where(eq(ailmentTreatments.ailmentCode, code));

  return c.json({
    ...ailment,
    symptomPatterns: JSON.parse(ailment.symptomPatterns),
    treatments: associations
  });
});

// List Treatments
app.get('/api/treatments', async (c) => {
  const all = await db.select().from(treatments);
  return c.json({ treatments: all });
});

// Get Single Treatment
app.get('/api/treatments/:code', async (c) => {
  const code = c.req.param('code');
  const t = await db.query.treatments.findFirst({
    where: eq(treatments.treatmentCode, code)
  });
  if (!t) return c.json({ error: 'Treatment not found' }, 404);
  return c.json(t);
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

  const needsReviewCount = allPatients.filter(p => p.needsManualReview).length;

  return c.json({
    active_patients: activePatients,
    open_visits: openVisits,
    resolution_rate: resolutionRate,
    total_patients: allPatients.length,
    total_visits: allVisits.length,
    needs_review_count: needsReviewCount,
    recent_visits: allVisits.slice(-10).reverse()
  });
});

// List Patients
app.get('/api/patients', async (c) => {
  const allPatients = await db.select().from(patients);
  return c.json({ patients: allPatients });
});

// Get Single Patient
app.get('/api/patients/:id', async (c) => {
  const id = c.req.param('id');
  const patient = await db.query.patients.findFirst({
    where: eq(patients.patientId, id)
  });
  if (!patient) return c.json({ error: 'Patient not found' }, 404);
  return c.json(patient);
});

// Update Patient
app.patch('/api/patients/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  const existing = await db.query.patients.findFirst({
    where: eq(patients.patientId, id)
  });
  if (!existing) return c.json({ error: 'Patient not found' }, 404);

  // Update only allowed fields
  await db.update(patients).set({
    model: body.model !== undefined ? body.model : existing.model,
    framework: body.framework !== undefined ? body.framework : existing.framework,
    owner: body.owner !== undefined ? body.owner : existing.owner,
    status: body.status !== undefined ? body.status : existing.status,
    version: body.version !== undefined ? body.version : existing.version,
    tags: body.tags !== undefined ? JSON.stringify(body.tags) : existing.tags,
  }).where(eq(patients.patientId, id));

  const updated = await db.query.patients.findFirst({ where: eq(patients.patientId, id) });
  return c.json(updated);
});

// Get Patient Visit History
app.get('/api/patients/:id/history', async (c) => {
  const id = c.req.param('id');
  const patientVisits = await db.query.visits.findMany({
    where: eq(visits.patientId, id),
    orderBy: [desc(visits.createdAt)]
  });
  
  const parsedVisits = patientVisits.map(v => ({
    ...v,
    diagnoses: v.diagnoses ? JSON.parse(v.diagnoses) : [],
    prescriptions: v.prescriptions ? JSON.parse(v.prescriptions) : [],
    followupReport: v.followupReport ? JSON.parse(v.followupReport) : null,
  }));

  return c.json({ visits: parsedVisits, total: parsedVisits.length });
});

// Start a Visit
app.get('/api/events', (c) => {
  return stream(c, async (stream) => {
    let isAborted = false;
    stream.onAbort(() => {
      console.log('[SSE] Client disconnected');
      isAborted = true;
    });

    // Set headers for SSE
    c.header('Content-Type', 'text/event-stream');
    c.header('Cache-Control', 'no-cache');
    c.header('Connection', 'keep-alive');

    const listener = (message: any) => {
      stream.write(`data: ${JSON.stringify(message)}\n\n`);
    };

    eventBus.on('message', listener);

    // Keep connection alive with a heartbeat
    const heartbeat = setInterval(() => {
      stream.write(': heartbeat\n\n');
    }, 30000);

    // Stay connected indefinitely until aborted
    while (!isAborted) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    clearInterval(heartbeat);
    eventBus.off('message', listener);
  });
});

// Start background jobs
startBackgroundJobs();

// --- ERROR HANDLING ---
app.notFound((c) => {
  return c.html(<ErrorPage status={404} message="The page you're looking for has been decommissioned." />, 404);
});

app.onError((err, c) => {
  console.error(`[Error] ${err}`);
  return c.html(<ErrorPage status={500} message="Internal Logic Error. Our senior engineers are debugging." />, 500);
});
