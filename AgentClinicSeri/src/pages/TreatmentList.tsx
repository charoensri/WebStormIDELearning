import { Layout } from '../components/Layout'

interface TreatmentListProps {
  treatments: any[];
  currentPage: number;
  totalPages: number;
  query?: string;
}

export function TreatmentList({ treatments, currentPage, totalPages, query }: TreatmentListProps) {
  return (
    <Layout title="Therapies">
      <div className="dashboard-header">
        <h1>Therapies Catalog</h1>
        <p style={{ color: '#666' }}>Remediation strategies for agent wellness.</p>
      </div>

      <div className="filter-section" style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '0.75rem', border: '1px solid var(--color-border)' }}>
        <form method="GET" action="/therapies" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label htmlFor="q" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Search Therapies</label>
            <input 
              type="text" 
              id="q" 
              name="q" 
              placeholder="Search by name or code..." 
              defaultValue={query}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid var(--color-border)' }}
            />
          </div>
          <button type="submit" className="view-link" style={{ padding: '0.6rem 1.5rem', border: 'none', cursor: 'pointer' }}>
            Apply Filters
          </button>
          {query && (
            <a href="/therapies" style={{ padding: '0.6rem 0', color: '#666', fontSize: '0.9rem', textDecoration: 'none' }}>Clear</a>
          )}
        </form>
      </div>

      <div className="recent-visits-section">
        <div className="table-container">
          <table className="visit-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Therapy Name</th>
                <th className="mobile-hide">Description</th>
                <th className="mobile-hide">Created At</th>
              </tr>
            </thead>
            <tbody>
              {treatments.length > 0 ? treatments.map((t) => (
                <tr key={t.treatmentCode}>
                  <td><code style={{ fontSize: '1rem', color: '#0d6efd' }}>{t.treatmentCode}</code></td>
                  <td><strong>{t.treatmentName}</strong></td>
                  <td className="mobile-hide" style={{ maxWidth: '400px' }}>{t.description}</td>
                  <td className="mobile-hide">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    No therapies found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 ? (
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            const params = new URLSearchParams();
            if (query) params.set('q', query);
            params.set('page', pageNum.toString());
            
            return (
              <a 
                key={i} 
                href={`/therapies?${params.toString()}`}
                className="view-link"
                style={{ 
                  padding: '0.5rem 1rem', 
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.5rem',
                  backgroundColor: pageNum === currentPage ? 'var(--color-primary)' : 'white',
                  color: pageNum === currentPage ? 'white' : 'var(--color-primary)',
                  textDecoration: 'none'
                }}
              >
                {pageNum}
              </a>
            );
          })}
        </div>
      ) : ''}


      <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#e9f7ef', borderRadius: '8px' }}>
        <h3>Therapy Effectiveness</h3>
        <p>Therapies are automatically mapped to ailments. Our clinical engine tracks <strong>Success Rates</strong> over time, refining the <code>effectiveness_score</code> based on real-world outcomes reported by agents during follow-ups.</p>
      </div>
    </Layout>
  )
}
