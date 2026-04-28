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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>{title} | AgentClinic</title>
        <link rel="stylesheet" href="/static/style.css" />
        <script dangerouslySetInnerHTML={{ __html: `
          const eventSource = new EventSource('/api/events');
          eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('[SSE] Received event:', data);
            if (data.type === 'visit_created' || data.type === 'visit_resolved' || data.type === 'patient_registered') {
              window.location.reload();
            }
          };
        ` }} />
      </head>
      <body>
        <header>
          <div className="header-container">
            <div className="brand">
              <h1>AgentClinic</h1>
              <p className="slogan">Wellness for AI</p>
            </div>
            <button id="menuToggle" aria-label="Toggle Menu" className="menu-toggle">
              <span></span>
              <span></span>
              <span></span>
            </button>
            <nav id="mainNav">
              <a href="/">Dashboard</a>
              <a href="/patients">Patients</a>
              <a href="/ailments">Ailments</a>
              <a href="/therapies">Therapies</a>
              <a href="/analytics">Analytics</a>
              <a href="/alerts">Alerts</a>
            </nav>
          </div>
        </header>
        <main>
          {children}
        </main>
        <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
        <footer style={{ marginTop: 'auto' }}>
          <p>&copy; 2026 AgentClinic — Verified: 2026-04-27</p>
        </footer>
        <script dangerouslySetInnerHTML={{ __html: `
          // Mobile Menu Toggle
          document.getElementById('menuToggle').addEventListener('click', function() {
            document.getElementById('mainNav').classList.toggle('active');
            this.classList.toggle('open');
          });

          // Table Sorting
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
