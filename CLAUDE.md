# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the companion code repository for a **Spec-Driven Development course**. The core project is **AgentClinic** — a satirical web app where AI agents are patients at a mental health clinic. The repo demonstrates progressive development across 13 lessons.

## Directory Structure

- `sc-spec-driven-development-files/` — Main course content
  - `Lesson_04/` through `Lesson_13/` — Snapshots of the AgentClinic project at the start of each lesson
  - `example_specs/` — Specification documents used in the course (including `AgentClinic-Mission.md`)
  - `skills/` — Reusable Claude Code skills (changelog generation, feature-spec kickoff)

**Active development happens in `Lesson_13/`** — this is the most complete state of the project.

## Commands (run from `sc-spec-driven-development-files/Lesson_13/`)

```bash
npm run dev        # Start dev server with hot reload (tsx watch src/index.tsx)
npm run build      # Compile TypeScript
npm run typecheck  # Type-check without emitting
npm test           # Run Vitest test suite
npm run seed       # Seed the SQLite database
```

No linter or formatter is configured.

## Tech Stack (Lesson_13)

- **Runtime:** Node.js + TypeScript 5.5 (strict mode)
- **Web framework:** Hono 4.x with `@hono/node-server`
- **Rendering:** Hono JSX (server-side only, `.tsx` files, `jsxImportSource: "hono/jsx"`)
- **Database:** SQLite via `better-sqlite3` — synchronous, embedded, hand-written migrations (no ORM)
- **Testing:** Vitest 4.x
- **Styling:** Vanilla CSS in `static/`

> **Note:** `example_specs/AgentClinic-Tech-Stack.md` specifies Next.js, Drizzle ORM, and Tailwind CSS. These were deliberately deferred — the course uses the simpler Hono-based stack. Do not suggest migrating to those alternatives.

## Architecture

The app follows a standard MVC-like structure under `src/`:

- `routes/` — Hono route handlers (agents, ailments, appointments, dashboard, feedback, therapies)
- `components/` — Reusable Hono JSX components
- `pages/` — Top-level page components (Home, Feedback, NotFound, ServerError)
- `db/` — Schema definitions, migrations, seed data, and TypeScript types
- `middleware/` — Logger middleware
- `index.tsx` — App entry point

## Changelog

Keep `CHANGELOG.md` current in the project root. Run the changelog skill before merging a branch or after completing a feature:

```bash
python3 sc-spec-driven-development-files/skills/changelog/scripts/changelog.py
```

Or invoke `/changelog` — the skill appends only commits newer than the last recorded date, then commit `CHANGELOG.md` as part of the merge commit.

## Spec-Driven Development Workflow

Features are driven by specifications. The `skills/feature-spec/` skill automates the kickoff: it reads `specs/roadmap.md` for the next incomplete phase, creates a git branch, interviews the user, and writes a dated spec directory under `specs/` containing `plan.md`, `requirements.md`, and `validation.md`.

Invoke with `/feature-spec` or by saying "next phase" / "start the next feature".

## AgentClinic Domain Model

The app uses a medical metaphor — AI agents are patients, degradation modes are ailments:

- **Visit states:** `TRIAGE → DIAGNOSED → PRESCRIBED → AWAITING_FOLLOWUP → RESOLVED/UNRESOLVED/EXPIRED`
- **Severity levels:** MILD (1), MODERATE (2), SEVERE (3), CRITICAL (4)
- Core entities: Agents (patients), Visits, Ailments, Treatments, Appointments, Feedback
