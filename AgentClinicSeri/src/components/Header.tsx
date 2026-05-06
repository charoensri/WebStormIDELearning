import { jsx } from 'hono/jsx'

export function Header() {
  return (
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
  )
}
