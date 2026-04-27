# Tech Stack

AgentClinic is a high-performance, server-side TypeScript application. It leverages modern tooling to provide a rich, interactive dashboard with minimal client-side overhead.

## Core

| Layer | Choice | Rationale |
|---|---|---|
| Language | **TypeScript** | Strict type safety across the clinical engine and UI. |
| Runtime | **Node.js** | Reliable industry standard for the backend. |
| Server framework | **Hono** | Lightweight, high-performance, and TypeScript-native. |
| Templating | **Hono JSX** | Server-side rendering for fast initial loads and SEO. |
| Database | **SQLite** | Embedded database via `better-sqlite3` for local speed and simplicity. |
| ORM | **Drizzle ORM** | Type-safe SQL builder and schema management; keeps data access predictable. |

## Specialized Features

- **LLM Engine**: Integration with **Ollama** (or similar providers) for automated triage, diagnosis, and prescription rationale.
- **Real-time Updates**: **Server-Sent Events (SSE)** for instant dashboard refreshes when new visits occur or patients register.
- **Analytics**: **ApexCharts** for rendering clinical heatmaps and severity trends.
- **Background Jobs**: Custom background worker for processing follow-ups and system maintenance.

## Data & Migrations

- **Drizzle Kit**: Used for schema definitions and managing database migrations.
- **Seeding**: Custom seed scripts to populate fictional agent patients and clinical catalogs.

## Testing

- **Python Integration Tests**: Using `requests` to validate the REST API and the LLM diagnostic pipeline.
- **Manual Verification**: End-to-end clinical workflow validation via the Staff Dashboard.

## Tooling

- `tsx`: Development runner with instant watch-mode reloading.
- `drizzle-kit`: For database schema push and migrations.
- `dotenv`: Configuration management for API keys and environment variables.

## What We Are Not Using

- **No heavy SPAs**: No React/Vue/Angular on the client; Hono JSX handles the UI logic.
- **No heavy CSS frameworks**: Vanilla CSS provides a clean, fast UI without the bloat of Tailwind or Bootstrap.
