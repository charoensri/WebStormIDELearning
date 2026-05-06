import { Layout } from '../components/Layout'

interface HomeProps {
  stats: {
    active_patients: number;
    open_visits: number;
    resolution_rate: number;
    total_patients: number;
    total_visits: number;
    needs_review_count: number;
  };
  recentVisits: any[];
  reviewPatients: any[];
  ailmentData: { label: string, count: number }[];
  severityData: { label: string, count: number }[];
}

export function Home({ stats, recentVisits, reviewPatients, ailmentData, severityData }: HomeProps) {
  return (
    <Layout title="Dashboard">
      <div className="dashboard-header">
        <h1>Clinic Overview</h1>
      </div>

      <section className="stats-grid" aria-label="Key Statistics">
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
      </section>

      <section className="stats-grid visualizations" aria-label="Clinical Visualizations">
        <div className="stat-card">
          <h3>Ailment Distribution</h3>
          <div id="ailmentChart" style={{ minHeight: '300px' }}></div>
        </div>
        <div className="stat-card">
          <h3>Severity Breakdown</h3>
          <div id="severityChart" style={{ minHeight: '300px' }}></div>
        </div>
      </section>

      {reviewPatients.length > 0 ? (
        <section className="recent-visits-section" style={{ border: '2px solid #ef4444', backgroundColor: '#fef2f2' }} aria-label="Urgent Manual Reviews">
          <h2 style={{ color: '#b91c1c' }}>⚠️ Manual Review Needed ({reviewPatients.length})</h2>
          <div className="table-container">
            <table className="visit-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Model</th>
                  <th>Owner</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reviewPatients.map((p) => (
                  <tr key={p.patientId}>
                    <td><strong>{p.agentName}</strong></td>
                    <td>{p.model}</td>
                    <td>{p.owner}</td>
                    <td><a href={`/patients/${p.patientId}`} className="view-link">Review Chart</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : ''}

      <section className="recent-visits-section" aria-label="Recent Visits Log">
        <h2>Recent Visits</h2>
        <div className="table-container">
          <table className="visit-table">
            <thead>
              <tr>
                <th data-sort="string" className="mobile-hide">Visit ID</th>
                <th data-sort="string">Patient</th>
                <th data-sort="string">State</th>
                <th data-sort="number" className="mobile-hide">Severity</th>
                <th data-sort="string">Created At</th>
              </tr>
            </thead>
            <tbody>
              {recentVisits.map((v) => (
                <tr key={v.visitId}>
                  <td className="mobile-hide"><code>[{v.visitId.slice(0, 8)}]</code></td>
                  <td><strong>{v.agentName}</strong></td>
                  <td><span className={`status-badge ${v.state.toLowerCase()}`}>{v.state}</span></td>
                  <td className="mobile-hide">{v.severity || 'N/A'}</td>
                  <td>{new Date(v.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {recentVisits.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>No visits recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function() {
          // Ailment Chart
          const ailmentData = ${JSON.stringify(ailmentData)};
          new ApexCharts(document.querySelector("#ailmentChart"), {
            series: [{ data: ailmentData.map(d => d.count) }],
            chart: { type: 'bar', height: 300, toolbar: { show: false }, animations: { enabled: false } },
            plotOptions: { bar: { borderRadius: 4, horizontal: true } },
            dataLabels: { enabled: false },
            xaxis: { categories: ailmentData.map(d => d.label) },
            colors: ['#2563eb']
          }).render();

          // Severity Chart
          const severityData = ${JSON.stringify(severityData)};
          new ApexCharts(document.querySelector("#severityChart"), {
            series: severityData.map(d => d.count),
            chart: { type: 'donut', height: 300, animations: { enabled: false } },
            labels: severityData.map(d => d.label),
            legend: { position: 'bottom' },
            colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
          }).render();
        });
      ` }} />
    </Layout>
  )
}
