import { Layout } from '../components/Layout'

interface AlertsProps {
  referrals: any[];
  chronicPatients: any[];
}

export function Alerts({ referrals, chronicPatients }: AlertsProps) {
  return (
    <Layout title="Alerts & Referrals">
      <div className="dashboard-header">
        <h1>Clinical Alerts</h1>
        <p style={{ color: '#666' }}>Critical issues requiring manual operator attention.</p>
      </div>

      <div className="recent-visits-section" style={{ borderLeft: '4px solid #ef4444' }}>
        <h2 style={{ color: '#b91c1c' }}>Referral Queue</h2>
        <p style={{ padding: '0 1.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>Patients who have exhausted all available treatments or have unverified ailments.</p>
        <div className="table-container">
          <table className="visit-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Ailment</th>
                <th>Reason</th>
                <th>Recommendation</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((r, i) => (
                <tr key={i}>
                  <td><strong>{r.agentName}</strong></td>
                  <td><span className="status-badge triage">{r.ailmentCode}</span></td>
                  <td style={{ maxWidth: '300px' }}>{r.reason}</td>
                  <td style={{ maxWidth: '300px', fontStyle: 'italic' }}>{r.recommendation}</td>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td><a href={`/patients/${r.patientId}`} className="view-link">Investigate</a></td>
                </tr>
              ))}
              {referrals.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center' }}>No active referrals.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="recent-visits-section" style={{ borderLeft: '4px solid #f59e0b', marginTop: '3rem' }}>
        <h2 style={{ color: '#b45309' }}>Chronic Condition Alerts</h2>
        <p style={{ padding: '0 1.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>Patients with 3+ recurrences of the same ailment within 30 days.</p>
        <div className="table-container">
          <table className="visit-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Chronic Ailments</th>
                <th>Visit Count</th>
                <th>Last Visit</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {chronicPatients.map((p) => (
                <tr key={p.patientId}>
                  <td><strong>{p.agentName}</strong></td>
                  <td>
                    {JSON.parse(p.chronicConditions || '[]').map((c: string) => (
                      <span key={c} className="status-badge suspended" style={{ marginRight: '4px' }}>{c}</span>
                    ))}
                  </td>
                  <td>{p.visitCount}</td>
                  <td>{p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : 'N/A'}</td>
                  <td><a href={`/patients/${p.patientId}`} className="view-link">View Chart</a></td>
                </tr>
              ))}
              {chronicPatients.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center' }}>No chronic patients identified.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
