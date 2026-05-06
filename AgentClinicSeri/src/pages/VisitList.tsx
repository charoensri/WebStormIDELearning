import { Layout } from '../components/Layout'

interface VisitListProps {
  visits: any[];
  title: string;
  currentPage: number;
  totalPages: number;
  state?: string;
  query?: string;
}

export function VisitList({ visits, title, currentPage, totalPages, state, query }: VisitListProps) {
  const states = ['TRIAGE', 'DIAGNOSED', 'PRESCRIBED', 'AWAITING_FOLLOWUP', 'RESOLVED', 'UNRESOLVED', 'EXPIRED'];

  return (
    <Layout title={title}>
      <div className="dashboard-header">
        <h1>{title}</h1>
        <p style={{ color: '#666' }}>Active and historical clinical interaction records.</p>
      </div>

      <div className="filter-section" style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '0.75rem', border: '1px solid var(--color-border)' }}>
        <form method="GET" action="/visits" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label htmlFor="q" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Search Symptoms</label>
            <input 
              type="text" 
              id="q" 
              name="q" 
              placeholder="Search symptom text..." 
              defaultValue={query}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid var(--color-border)' }}
            />
          </div>
          <div style={{ width: '180px' }}>
            <label htmlFor="state" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>State</label>
            <select 
              id="state" 
              name="state" 
              defaultValue={state}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid var(--color-border)', backgroundColor: 'white' }}
            >
              <option value="">All States</option>
              {states.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="view-link" style={{ padding: '0.6rem 1.5rem', border: 'none', cursor: 'pointer' }}>
            Apply Filters
          </button>
          {(query || state) && (
            <a href="/visits" style={{ padding: '0.6rem 0', color: '#666', fontSize: '0.9rem', textDecoration: 'none' }}>Clear</a>
          )}
        </form>
      </div>

      <div className="recent-visits-section">
        <div className="table-container">
          <table className="visit-table">
            <thead>
              <tr>
                <th className="mobile-hide">ID</th>
                <th>Patient</th>
                <th>State</th>
                <th className="mobile-hide">Severity</th>
                <th>Diagnoses</th>
                <th>Treatments</th>
                <th className="mobile-hide">Time</th>
              </tr>
            </thead>
            <tbody>
              {visits.length > 0 ? visits.map((v) => {
                const diags = JSON.parse(v.diagnoses || '[]');
                const pxs = JSON.parse(v.prescriptions || '[]');
                
                return (
                  <tr key={v.visitId}>
                    <td className="mobile-hide"><code style={{ fontSize: '0.8rem' }}>{v.visitId.slice(0, 8)}</code></td>
                    <td><a href={`/patients/${v.patientId}`} className="view-link">Patient {v.patientId.slice(0, 8)}</a></td>
                    <td><span className={`status-badge ${v.state.toLowerCase()}`}>{v.state}</span></td>
                    <td className="mobile-hide"><span className="status-badge triage">Lvl {v.severity}</span></td>
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
                    <td className="mobile-hide">{new Date(v.createdAt).toLocaleString()}</td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    No visits found matching your criteria.
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
            if (state) params.set('state', state);
            params.set('page', pageNum.toString());
            
            return (
              <a 
                key={i} 
                href={`/visits?${params.toString()}`}
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
      
      <div style={{ marginTop: '2rem' }}>
        <a href="/analytics" className="view-link">← Back to Analytics</a>
      </div>
    </Layout>
  )
}
