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
      </head>
      <body>
        <header>
          <h1>AgentClinic</h1>
          <nav>
            <a href="/" style={{ marginRight: '1rem', textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>Dashboard</a>
            <a href="/api/analytics/overview" target="_blank" style={{ textDecoration: 'none', color: 'inherit', fontSize: '0.875rem' }}>API Stats</a>
          </nav>
        </header>
        <main>
          {children}
        </main>
        <footer>
          <p>&copy; 2026 AgentClinic — Wellness for AI</p>
        </footer>
      </body>
    </html>
  )
}
