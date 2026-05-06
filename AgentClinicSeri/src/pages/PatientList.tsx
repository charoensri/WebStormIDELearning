import { Layout } from '../components/Layout'

interface PatientListProps {
  patients: any[];
  currentPage: number;
  totalPages: number;
  query?: string;
  status?: string;
}

export function PatientList({ patients, currentPage, totalPages, query, status }: PatientListProps) {
  return (
    <Layout title="Patient Directory">
      <div className="dashboard-header">
        <h1>Patient Directory</h1>
        <p style={{ color: '#666' }}>Active and historical AI agent records.</p>
      </div>

      <div className="filter-section" style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '0.75rem', border: '1px solid var(--color-border)' }}>
        <form method="GET" action="/patients" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label htmlFor="q" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Search Agents</label>
            <input 
              type="text" 
              id="q" 
              name="q" 
              placeholder="Search by name or model..." 
              defaultValue={query}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid var(--color-border)' }}
            />
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
              <option value="active">Active</option>
              <option value="discharged">Discharged</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <button type="submit" className="view-link" style={{ padding: '0.6rem 1.5rem', border: 'none', cursor: 'pointer' }}>
            Apply Filters
          </button>
          {(query || status) && (
            <a href="/patients" style={{ padding: '0.6rem 0', color: '#666', fontSize: '0.9rem', textDecoration: 'none' }}>Clear</a>
          )}
        </form>
      </div>

      <div className="recent-visits-section">
        <div className="table-container">
          <table className="visit-table">
            <thead>
              <tr>
                <th>Agent Name</th>
                <th>Model</th>
                <th>Status</th>
                <th className="mobile-hide">Registered</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.length > 0 ? patients.map((p) => (
                <tr key={p.patientId}>
                  <td><strong>{p.agentName}</strong></td>
                  <td><code style={{ fontSize: '0.8rem' }}>{p.model}</code></td>
                  <td><span className={`status-badge ${p.status.toLowerCase()}`}>{p.status}</span></td>
                  <td className="mobile-hide">{new Date(p.registeredAt).toLocaleDateString()}</td>
                  <td><a href={`/patients/${p.patientId}`} className="view-link">View Charts</a></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    No agents found matching your filters.
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
            if (status) params.set('status', status);
            params.set('page', pageNum.toString());
            
            return (
              <a 
                key={i} 
                href={`/patients?${params.toString()}`}
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
    </Layout>
  )
}
