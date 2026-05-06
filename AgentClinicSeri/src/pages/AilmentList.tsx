import { Layout } from '../components/Layout'

interface AilmentListProps {
  ailments: any[];
  currentPage: number;
  totalPages: number;
  query?: string;
  category?: string;
  status?: string;
}

export function AilmentList({ ailments, currentPage, totalPages, query, category, status }: AilmentListProps) {
  const categories = [
    'Output Integrity',
    'Context Management',
    'Behavioral Integrity',
    'Output Quality',
    'Performance',
    'Manual'
  ];

  return (
    <Layout title="Ailments">
      <div className="dashboard-header">
        <h1>Ailment Catalog</h1>
        <p style={{ color: '#666' }}>Core and custom agent degradation modes.</p>
      </div>

      <div className="filter-section" style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '0.75rem', border: '1px solid var(--color-border)' }}>
        <form method="GET" action="/ailments" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label htmlFor="q" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Search Ailments</label>
            <input 
              type="text" 
              id="q" 
              name="q" 
              placeholder="Search by name or code..." 
              defaultValue={query}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid var(--color-border)' }}
            />
          </div>
          <div style={{ width: '180px' }}>
            <label htmlFor="category" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Category</label>
            <select 
              id="category" 
              name="category" 
              defaultValue={category}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid var(--color-border)', backgroundColor: 'white' }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div style={{ width: '150px' }}>
            <label htmlFor="status" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Status</label>
            <select 
              id="status" 
              name="status" 
              defaultValue={status}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid var(--color-border)', backgroundColor: 'white' }}
            >
              <option value="">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
              <option value="auto_detected">Auto-Detected</option>
            </select>
          </div>
          <button type="submit" className="view-link" style={{ padding: '0.6rem 1.5rem', border: 'none', cursor: 'pointer' }}>
            Apply Filters
          </button>
          {(query || category || status) && (
            <a href="/ailments" style={{ padding: '0.6rem 0', color: '#666', fontSize: '0.9rem', textDecoration: 'none' }}>Clear</a>
          )}
        </form>
      </div>

      <div className="recent-visits-section">
        <div className="table-container">
          <table className="visit-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Ailment Name</th>
                <th>Category</th>
                <th className="mobile-hide">Description</th>
                <th className="mobile-hide">Status</th>
              </tr>
            </thead>
            <tbody>
              {ailments.length > 0 ? ailments.map((a) => (
                <tr key={a.ailmentCode}>
                  <td><code style={{ fontSize: '1rem', color: '#d63384' }}>{a.ailmentCode}</code></td>
                  <td><strong>{a.ailmentName}</strong></td>
                  <td>{a.category}</td>
                  <td className="mobile-hide" style={{ maxWidth: '400px' }}>{a.description}</td>
                  <td className="mobile-hide"><span className={`status-badge ${a.status}`}>{a.status}</span></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    No ailments found matching your filters.
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
            if (category) params.set('category', category);
            if (status) params.set('status', status);
            params.set('page', pageNum.toString());
            
            return (
              <a 
                key={i} 
                href={`/ailments?${params.toString()}`}
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

      <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#f0f4f8', borderRadius: '8px' }}>
        <h3>Diagnosis Insights</h3>
        <p>The diagnosis engine uses LLM-powered semantic matching against the <strong>Symptom Patterns</strong> defined for each ailment. Core ailments are verified; novel symptoms found during triage are automatically added as <code>auto_detected</code>.</p>
      </div>
    </Layout>
  )
}
