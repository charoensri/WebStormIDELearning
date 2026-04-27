import { Layout } from '../components/Layout'

interface PatientDetailProps {
  patient: any;
  visits: any[];
}

export function PatientDetail({ patient, visits }: PatientDetailProps) {
  const chronicConditions = JSON.parse(patient.chronicConditions || '[]');

  return (
    <Layout title={`Patient: ${patient.agentName}`}>
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
          <h1>{patient.agentName}</h1>
          <span className={`status-badge ${patient.status}`}>{patient.status}</span>
        </div>
        <p style={{ color: '#666' }}>Patient ID: {patient.patientId}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Model</h3>
          <p className="stat-value" style={{ fontSize: '1.2rem' }}>{patient.model || 'Unknown'}</p>
        </div>
        <div className="stat-card">
          <h3>Framework</h3>
          <p className="stat-value" style={{ fontSize: '1.2rem' }}>{patient.framework || 'Unknown'}</p>
        </div>
        <div className="stat-card">
          <h3>Total Visits</h3>
          <p className="stat-value">{patient.visitCount}</p>
        </div>
        <div className="stat-card">
          <h3>Registered</h3>
          <p className="stat-value" style={{ fontSize: '1rem' }}>{new Date(patient.registeredAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Chronic Conditions</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          {chronicConditions.length > 0 ? (
            chronicConditions.map((c: string) => (
              <span key={c} className="status-badge triage">{c}</span>
            ))
          ) : (
            <p style={{ fontStyle: 'italic', color: '#666' }}>No chronic conditions identified.</p>
          )}
        </div>
      </div>

      <div className="recent-visits-section" style={{ marginTop: '3rem' }}>
        <h2>Clinical Timeline</h2>
        <div className="timeline">
          {visits.map((v) => {
            const diags = JSON.parse(v.diagnoses || '[]');
            const prescriptions = JSON.parse(v.prescriptions || '[]');
            const followup = v.followupReport ? JSON.parse(v.followupReport) : null;

            return (
              <div key={v.visitId} className="timeline-item" style={{ 
                borderLeft: '4px solid #eee', 
                paddingLeft: '1.5rem', 
                marginBottom: '2rem',
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  left: '-9px', 
                  top: '0', 
                  width: '14px', 
                  height: '14px', 
                  borderRadius: '50%', 
                  backgroundColor: '#ccc'
                }}></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      Visit {v.visitId.slice(0, 8)}
                    </span>
                    <span style={{ marginLeft: '1rem', color: '#666' }}>
                      {new Date(v.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span className={`status-badge ${v.state.toLowerCase()}`}>{v.state}</span>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <p><strong>Symptoms:</strong> {v.symptomText}</p>
                  
                  {diags.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong>Diagnoses:</strong>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        {diags.map((d: any) => (
                          <span key={d.ailment_code} className="status-badge diagnosed" title={`Confidence: ${d.confidence}`}>
                            {d.ailment_name} ({d.ailment_code})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {prescriptions.length > 0 && (
                    <div style={{ marginTop: '1rem', backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '4px' }}>
                      <strong>Prescriptions:</strong>
                      {prescriptions.map((rx: any) => (
                        <div key={rx.treatment_code} style={{ marginTop: '0.5rem' }}>
                          <p><strong>{rx.treatment_name} ({rx.treatment_code}):</strong> {rx.rationale}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {followup && (
                    <div style={{ marginTop: '1rem', borderTop: '1px dashed #eee', paddingTop: '0.5rem' }}>
                      <p><strong>Follow-up Outcome:</strong> 
                        <span className={`status-badge ${followup.outcome === 'improved' ? 'resolved' : 'unresolved'}`} style={{ marginLeft: '0.5rem' }}>
                          {followup.outcome}
                        </span>
                      </p>
                      {followup.outcome_text && <p style={{ fontStyle: 'italic', marginTop: '0.25rem' }}>"{followup.outcome_text}"</p>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {visits.length === 0 && <p>No visit history found for this patient.</p>}
        </div>
      </div>
    </Layout>
  )
}
