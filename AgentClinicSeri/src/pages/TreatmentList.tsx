import { Layout } from '../components/Layout'

interface TreatmentListProps {
  treatments: any[];
}

export function TreatmentList({ treatments }: TreatmentListProps) {
  return (
    <Layout title="Therapies">
      <div className="dashboard-header">
        <h1>Therapies Catalog</h1>
        <p style={{ color: '#666' }}>Remediation strategies for agent wellness.</p>
      </div>

      <div className="recent-visits-section">
        <table className="visit-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Therapy Name</th>
              <th>Description</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {treatments.map((t) => (
              <tr key={t.treatmentCode}>
                <td><code style={{ fontSize: '1rem', color: '#0d6efd' }}>{t.treatmentCode}</code></td>
                <td><strong>{t.treatmentName}</strong></td>
                <td style={{ maxWidth: '400px' }}>{t.description}</td>
                <td>{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {treatments.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>No therapies in catalog.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#e9f7ef', borderRadius: '8px' }}>
        <h3>Therapy Effectiveness</h3>
        <p>Therapies are automatically mapped to ailments. Our clinical engine tracks <strong>Success Rates</strong> over time, refining the <code>effectiveness_score</code> based on real-world outcomes reported by agents during follow-ups.</p>
      </div>
    </Layout>
  )
}
