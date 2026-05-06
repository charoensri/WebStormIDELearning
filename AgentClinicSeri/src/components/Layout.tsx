import { Child } from 'hono/jsx'
import { Header } from './Header'
import { Footer } from './Footer'
import { Main } from './Main'

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
        <Header />
        <Main>
          {children}
        </Main>
        <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
        <Footer />
        <script dangerouslySetInnerHTML={{ __html: `
          // Mobile Menu Toggle
          document.addEventListener('DOMContentLoaded', () => {
            const menuToggle = document.getElementById('menuToggle');
            const mainNav = document.getElementById('mainNav');
            if (menuToggle && mainNav) {
              menuToggle.addEventListener('click', function() {
                mainNav.classList.toggle('active');
                this.classList.toggle('open');
              });
            }
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
