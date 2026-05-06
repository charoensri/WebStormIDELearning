import { Layout } from '../components/Layout'
import { Fragment } from 'hono/jsx'

interface ReviewQueueItem {
  ailmentCode: string;
  ailmentName: string;
  category: string;
  status: string | null;
}

interface EffectivenessItem {
  ailmentCode: string;
  ailmentName: string;
  treatmentCode: string;
  treatmentName: string;
  totalResolved: number;
  totalUnresolved: number;
  effectivenessScore: number | null;
  seedEffectiveness: number;
}

interface AnalyticsProps {
  heatmapData: { x: string, y: number, ailment: string }[]; // x: severity, y: count, grouped by ailment
  ailmentNames: string[];
  trendData: { name: string, data: { x: string, y: number }[] }[];
  effectivenessData: EffectivenessItem[];
  reviewQueue: ReviewQueueItem[];
}

declare global {
  function verifyAilment(code: string): Promise<void>;
  function updateAilmentName(code: string): Promise<void>;
  function mergeAilment(code: string): Promise<void>;
  function dismissAilment(code: string): Promise<void>;
}

export function Analytics({ heatmapData, ailmentNames, trendData, effectivenessData, reviewQueue }: AnalyticsProps) {
  return (
    <Layout title="Clinical Analytics">
      <div className="dashboard-header">
        <h1>Clinical Analytics</h1>
        <p style={{ color: '#666' }}>In-depth analysis of clinic performance and treatment efficacy.</p>
      </div>

      <div className="recent-visits-section" style={{ borderLeft: '4px solid #3b82f6', marginBottom: '3rem' }}>
        <h2>Ailment Review Queue ({reviewQueue.length})</h2>
        <p style={{ padding: '0 1.5rem', marginBottom: '1rem', color: '#666' }}>Verify or rename ailments detected during automated triage.</p>
        <div className="table-container">
          <table className="visit-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Current Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviewQueue.map((a) => (
                <tr key={a.ailmentCode} id={`row-${a.ailmentCode}`}>
                  <td><code style={{ color: '#d63384' }}>{a.ailmentCode}</code></td>
                  <td>
                    <input 
                      type="text" 
                      id={`name-${a.ailmentCode}`} 
                      defaultValue={a.ailmentName} 
                      style={{ padding: '4px', border: '1px solid #ddd', borderRadius: '4px', width: '200px' }}
                    />
                  </td>
                  <td>{a.category}</td>
                  <td><span className={`status-badge ${a.status}`}>{a.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                      className="btn" 
                      onClick={() => (window as any).verifyAilment(a.ailmentCode)}
                    >
                      Verify
                    </button>
                    <button 
                      className="btn" 
                      style={{ color: '#666' }}
                      onClick={() => (window as any).updateAilmentName(a.ailmentCode)}
                    >
                      Rename
                    </button>
                    <button 
                      className="btn" 
                      style={{ color: '#f59e0b' }}
                      onClick={() => (window as any).mergeAilment(a.ailmentCode)}
                    >
                      Merge
                    </button>
                    <button 
                      className="btn" 
                      style={{ color: '#ef4444' }}
                      onClick={() => (window as any).dismissAilment(a.ailmentCode)}
                    >
                      Dismiss
                    </button>
                  </div>
                </td>
                </tr>
              ))}
              {reviewQueue.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center' }}>No ailments currently require review.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="stats-grid visualizations" style={{ marginTop: '2rem' }}>
        <div className="stat-card">
          <h3>Ailment Heatmap</h3>
          <div id="heatmapChart" style={{ minHeight: '400px' }}></div>
        </div>
        <div className="stat-card">
          <h3>Ailment Trends</h3>
          <div id="trendChart" style={{ minHeight: '400px' }}></div>
        </div>
      </div>

      <div className="recent-visits-section" style={{ marginTop: '3rem' }}>
        <h2>Treatment Effectiveness</h2>
        <div className="table-container">
          <table className="visit-table">
            <thead>
              <tr>
                <th>Treatment</th>
                <th>Resolved</th>
                <th>Unresolved</th>
                <th>Success Rate</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(new Set(effectivenessData.map(e => e.ailmentCode))).map(ailmentCode => {
                const ailmentGroup = effectivenessData.filter(e => e.ailmentCode === ailmentCode);
                const ailmentName = ailmentGroup[0]?.ailmentName || ailmentCode;
                
                return (
                  <Fragment key={ailmentCode}>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <td colSpan={5}><strong>{ailmentName} ({ailmentCode})</strong></td>
                    </tr>
                    {ailmentGroup.map((e) => (
                      <tr key={`${ailmentCode}-${e.treatmentCode}`}>
                        <td style={{ paddingLeft: '2rem' }}>{e.treatmentName}</td>
                        <td>
                          <a href={`/visits?ailment=${e.ailmentCode}&treatment=${e.treatmentCode}&state=RESOLVED`} className="view-link">
                            {e.totalResolved}
                          </a>
                        </td>
                        <td>
                          <a href={`/visits?ailment=${e.ailmentCode}&treatment=${e.treatmentCode}&state=UNRESOLVED`} className="view-link">
                            {e.totalUnresolved}
                          </a>
                        </td>
                        <td>
                          {e.effectivenessScore !== null 
                            ? <strong style={{ color: e.effectivenessScore > 0.7 ? '#10b981' : '#f59e0b' }}>{(e.effectivenessScore * 100).toFixed(1)}%</strong>
                            : <span style={{ color: '#94a3b8' }}>Seeding: {(e.seedEffectiveness * 100).toFixed(0)}%</span>
                          }
                        </td>
                        <td>
                          <span className="status-badge triage">
                            {e.totalResolved + e.totalUnresolved >= 5 ? 'High' : 'Low'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function() {
          // Heatmap
          const ailmentNames = ${JSON.stringify(ailmentNames)};
          const heatmapSeries = ailmentNames.map(name => {
            return {
              name: name,
              data: ${JSON.stringify(heatmapData)}.filter(d => d.ailment === name)
            };
          });

          new ApexCharts(document.querySelector("#heatmapChart"), {
            series: heatmapSeries,
            chart: { height: 400, type: 'heatmap', toolbar: { show: false } },
            dataLabels: { enabled: false },
            colors: ["#2563eb"],
            title: { text: 'Volume by Severity' },
            xaxis: { type: 'category', categories: ['Mild', 'Moderate', 'Severe', 'Critical'] }
          }).render();

          // Trend Chart
          new ApexCharts(document.querySelector("#trendChart"), {
            series: ${JSON.stringify(trendData)},
            chart: { height: 400, type: 'line', toolbar: { show: false }, zoom: { enabled: false } },
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 3 },
            title: { text: 'Ailment Frequency' },
            xaxis: { type: 'datetime' },
            yaxis: { title: { text: 'Daily Visits' } },
            legend: { position: 'bottom' }
          }).render();
        });

        async function verifyAilment(code) {
          if (!confirm('Verify this ailment and add to permanent catalog?')) return;
          const resp = await fetch(\`/api/ailments/\${code}\`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'verified' })
          });
          if (resp.ok) window.location.reload();
        }

        async function updateAilmentName(code) {
          const newName = document.getElementById(\`name-\${code}\`).value;
          const resp = await fetch(\`/api/ailments/\${code}\`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ailment_name: newName })
          });
          if (resp.ok) alert('Ailment renamed successfully.');
        }

        async function dismissAilment(code) {
          if (!confirm('Dismiss this ailment?')) return;
          const resp = await fetch(\`/api/ailments/\${code}\`, {
            method: 'DELETE'
          });
          if (resp.ok) window.location.reload();
        }

        async function mergeAilment(sourceCode) {
          const targetCode = prompt('Enter the target ailment code to merge into:');
          if (!targetCode) return;
          const resp = await fetch(\`/api/ailments/\${sourceCode}/merge\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target_code: targetCode })
          });
          if (resp.ok) window.location.reload();
        }

        window.verifyAilment = verifyAilment;
        window.updateAilmentName = updateAilmentName;
        window.dismissAilment = dismissAilment;
        window.mergeAilment = mergeAilment;
      ` }} />
    </Layout>
  )
}
