import { Layout } from '../components/Layout'

interface AilmentListProps {
  ailments: any[];
}

export function AilmentList({ ailments }: AilmentListProps) {
  return (
    <Layout title="Ailments">
      <div className="dashboard-header">
        <h1>Ailment Catalog</h1>
        <p style={{ color: '#666' }}>Core and custom agent degradation modes.</p>
      </div>

      <div className="recent-visits-section">
        <table className="visit-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Ailment Name</th>
              <th>Category</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ailments.map((a) => (
              <tr key={a.ailmentCode}>
                <td><code style={{ fontSize: '1rem', color: '#d63384' }}>{a.ailmentCode}</code></td>
                <td><strong>{a.ailmentName}</strong></td>
                <td>{a.category}</td>
                <td style={{ maxWidth: '400px' }}>{a.description}</td>
                <td><span className={`status-badge ${a.status}`}>{a.status}</span></td>
              </tr>
            ))}
            {ailments.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>No ailments in catalog.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#f0f4f8', borderRadius: '8px' }}>
        <h3>Diagnosis Insights</h3>
        <p>The diagnosis engine uses LLM-powered semantic matching against the <strong>Symptom Patterns</strong> defined for each ailment. Core ailments are verified; novel symptoms found during triage are automatically added as <code>auto_detected</code>.</p>
      </div>
    </Layout>
  )
}
