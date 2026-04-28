import { Layout } from '../components/Layout'

interface PatientListProps {
  patients: any[];
  currentPage: number;
  totalPages: number;
}

export function PatientList({ patients, currentPage, totalPages }: PatientListProps) {
  return (
    <Layout title="Patient Directory">
      <div className="dashboard-header">
        <h1>Patient Directory</h1>
        <p style={{ color: '#666' }}>Active and historical AI agent records.</p>
      </div>

      <div className="recent-visits-section">
        <div className="table-container">
          <table className="visit-table">
            <thead>
              <tr>
                <th>Agent Name</th>
                <th>Model</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.patientId}>
                  <td><strong>{p.agentName}</strong></td>
                  <td><code style={{ fontSize: '0.8rem' }}>{p.model}</code></td>
                  <td><span className={`status-badge ${p.status.toLowerCase()}`}>{p.status}</span></td>
                  <td>{new Date(p.registeredAt).toLocaleDateString()}</td>
                  <td><a href={`/patients/${p.patientId}`} className="view-link">View Charts</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <a 
              key={i} 
              href={`/patients?page=${i + 1}`}
              className="view-link"
              style={{ 
                padding: '0.5rem 1rem', 
                border: '1px solid var(--color-border)',
                borderRadius: '0.5rem',
                backgroundColor: (i + 1) === currentPage ? 'var(--color-primary)' : 'white',
                color: (i + 1) === currentPage ? 'white' : 'var(--color-primary)',
                textDecoration: 'none'
              }}
            >
              {i + 1}
            </a>
          ))}
        </div>
      )}
    </Layout>
  )
}
