import { Layout } from '../components/Layout'

interface VisitListProps {
  visits: any[];
  title: string;
}

export function VisitList({ visits, title }: VisitListProps) {
  return (
    <Layout title={title}>
      <div className="dashboard-header">
        <h1>{title}</h1>
        <p style={{ color: '#666' }}>Showing {visits.length} clinical records matching your filter.</p>
      </div>

      <div className="recent-visits-section">
        <div className="table-container">
          <table className="visit-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>State</th>
                <th>Severity</th>
                <th>Diagnoses</th>
                <th>Treatments</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((v) => {
                const diags = JSON.parse(v.diagnoses || '[]');
                const pxs = JSON.parse(v.prescriptions || '[]');
                
                return (
                  <tr key={v.visitId}>
                    <td><code style={{ fontSize: '0.8rem' }}>{v.visitId.slice(0, 8)}</code></td>
                    <td><a href={`/patients/${v.patientId}`} className="view-link">Patient {v.patientId.slice(0, 8)}</a></td>
                    <td><span className={`status-badge ${v.state.toLowerCase()}`}>{v.state}</span></td>
                    <td><span className="status-badge triage">Lvl {v.severity}</span></td>
                    <td>
                      {diags.map((d: any) => (
                        <div key={d.ailment_code} style={{ fontSize: '0.85rem' }}>{d.ailment_name}</div>
                      ))}
                    </td>
                    <td>
                      {pxs.map((p: any) => (
                        <div key={p.treatment_code} style={{ fontSize: '0.85rem' }}>{p.treatment_name}</div>
                      ))}
                    </td>
                    <td>{new Date(v.createdAt).toLocaleString()}</td>
                  </tr>
                )
              })}
              {visits.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center' }}>No visits found matching these criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <a href="/analytics" className="view-link">← Back to Analytics</a>
      </div>
    </Layout>
  )
}
