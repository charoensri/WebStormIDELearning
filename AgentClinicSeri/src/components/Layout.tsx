import { Child } from 'hono/jsx'

type Props = {
  title: string
  children: Child
}

export function Layout({ title, children }: Props) {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title} | AgentClinic</title>
        <link rel="stylesheet" href="/static/style.css" />
        <script dangerouslySetInnerHTML={{ __html: `
          const eventSource = new EventSource('/api/events');
          eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('[SSE] Received event:', data);
            // Simple approach: refresh the page on any relevant event
            // In a real app, we might update specific UI elements
            if (data.type === 'visit_created' || data.type === 'visit_resolved' || data.type === 'patient_registered') {
              window.location.reload();
            }
          };
          eventSource.onerror = (err) => {
            console.error('[SSE] EventSource failed:', err);
          };
        ` }} />
      </head>
      <body>
        <header>
          <h1>AgentClinic</h1>
          <p className="slogan">AgentClinic is open for business (verified: 2026-04-27)</p>
          <nav>
            <a href="/" style={{ marginRight: '1rem', textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>Dashboard</a>
            <a href="/patients" style={{ marginRight: '1rem', textDecoration: 'none', color: 'inherit' }}>Patients</a>
            <a href="/ailments" style={{ marginRight: '1rem', textDecoration: 'none', color: 'inherit' }}>Ailments</a>
            <a href="/therapies" style={{ marginRight: '1rem', textDecoration: 'none', color: 'inherit' }}>Therapies</a>
            <a href="/analytics" style={{ marginRight: '1rem', textDecoration: 'none', color: 'inherit' }}>Analytics</a>
            <a href="/alerts" style={{ marginRight: '1rem', textDecoration: 'none', color: 'inherit' }}>Alerts</a>
            <a href="/api/analytics/overview" target="_blank" style={{ textDecoration: 'none', color: 'inherit', fontSize: '0.875rem' }}>API Stats</a>
          </nav>
        </header>
        <main>
          {children}
        </main>
        <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
        <footer style={{ marginTop: 'auto' }}>
          <p>&copy; 2026 AgentClinic — Wellness for AI</p>
        </footer>
        <script dangerouslySetInnerHTML={{ __html: `
          document.addEventListener('click', function(e) {
            const header = e.target.closest('th[data-sort]');
            if (!header) return;
            
            const table = header.closest('table');
            const tbody = table.querySelector('tbody');
            const index = Array.from(header.parentNode.children).indexOf(header);
            const type = header.getAttribute('data-sort');
            const order = header.getAttribute('data-order') === 'asc' ? 'desc' : 'asc';
            
            const rows = Array.from(tbody.querySelectorAll('tr'));
            
            const sortedRows = rows.sort((a, b) => {
              const aVal = a.children[index].textContent.trim();
              const bVal = b.children[index].textContent.trim();
              
              if (type === 'number') {
                return order === 'asc' ? parseFloat(aVal) - parseFloat(bVal) : parseFloat(bVal) - parseFloat(aVal);
              }
              return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            });
            
            // Update UI
            table.querySelectorAll('th[data-sort]').forEach(th => {
              th.removeAttribute('data-order');
              th.classList.remove('sorted-asc', 'sorted-desc');
            });
            header.setAttribute('data-order', order);
            header.classList.add(order === 'asc' ? 'sorted-asc' : 'sorted-desc');
            
            tbody.append(...sortedRows);
          });
        ` }} />
      </body>
    </html>
  )
}
