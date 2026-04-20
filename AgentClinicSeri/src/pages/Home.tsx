import { Layout } from '../components/Layout'

interface HomeProps {
  stats: {
    active_patients: number;
    open_visits: number;
    resolution_rate: number;
    total_patients: number;
    total_visits: number;
  };
  recentVisits: any[];
}

export function Home({ stats, recentVisits }: HomeProps) {
  return (
    <Layout title="Dashboard">
      <div className="dashboard-header">
        <h1>Clinic Overview</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Active Patients</h3>
          <p className="stat-value">{stats.active_patients}</p>
        </div>
        <div className="stat-card">
          <h3>Open Visits</h3>
          <p className="stat-value">{stats.open_visits}</p>
        </div>
        <div className="stat-card">
          <h3>Resolution Rate</h3>
          <p className="stat-value">{(stats.resolution_rate * 100).toFixed(1)}%</p>
        </div>
        <div className="stat-card">
          <h3>Total Patients</h3>
          <p className="stat-value">{stats.total_patients}</p>
        </div>
      </div>

      <div className="recent-visits-section">
        <h2>Recent Visits</h2>
        <table className="visit-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>State</th>
              <th>Severity</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {recentVisits.map((v) => (
              <tr key={v.visitId}>
                <td>{v.visitId.slice(0, 8)}...</td>
                <td><span className={`status-badge ${v.state.toLowerCase()}`}>{v.state}</span></td>
                <td>{v.severity || 'N/A'}</td>
                <td>{new Date(v.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {recentVisits.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>No visits recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
