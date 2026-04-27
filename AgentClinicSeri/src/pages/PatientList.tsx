import { Layout } from '../components/Layout'

interface PatientListProps {
  patients: any[];
  currentPage: number;
  totalPages: number;
}

export function PatientList({ patients, currentPage, totalPages }: PatientListProps) {
  return (
    <Layout title="Patients">
      <div className="dashboard-header">
        <h1>Patient Directory</h1>
      </div>

      <div className="recent-visits-section">
        <table className="visit-table">
          <thead>
            <tr>
              <th data-sort="string">Name</th>
              <th data-sort="string">Model</th>
              <th data-sort="string">Owner</th>
              <th data-sort="number">Visits</th>
              <th>Chronic Conditions</th>
              <th data-sort="string">Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.patientId}>
                <td><strong>{p.agentName}</strong></td>
                <td>{p.model || 'N/A'}</td>
                <td>{p.owner || 'N/A'}</td>
                <td>{p.visitCount}</td>
                <td>
                  {p.needsManualReview && (
                    <span className="status-badge suspended" style={{ marginRight: '4px' }}>Review Needed</span>
                  )}
                  {JSON.parse(p.chronicConditions || '[]').map((c: string) => (
                    <span key={c} className="status-badge triage" style={{ marginRight: '4px' }}>{c}</span>
                  ))}
                </td>
                <td><span className={`status-badge ${p.status}`}>{p.status}</span></td>
                <td>
                  <a href={`/patients/${p.patientId}`} className="view-link">View Chart</a>
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center' }}>No patients registered yet.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '1.5rem', 
            gap: '1rem',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: '#f8fafc'
          }}>
            <a 
              href={`/patients?page=${currentPage - 1}`} 
              style={{ 
                visibility: currentPage > 1 ? 'visible' : 'hidden',
                textDecoration: 'none',
                color: 'var(--color-primary)',
                fontWeight: '600'
              }}
            >
              &larr; Previous
            </a>
            
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
              Page {currentPage} of {totalPages}
            </span>

            <a 
              href={`/patients?page=${currentPage + 1}`} 
              style={{ 
                visibility: currentPage < totalPages ? 'visible' : 'hidden',
                textDecoration: 'none',
                color: 'var(--color-primary)',
                fontWeight: '600'
              }}
            >
              Next &rarr;
            </a>
          </div>
        )}
      </div>
    </Layout>
  )
}
