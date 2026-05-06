# Phase 13 — Testing Suite Implementation Plan

## Approach
We will introduce a modern testing framework (like Vitest for unit/integration and Playwright for E2E) to complement or replace the existing ad-hoc Python scripts.

## Step 1: Framework Setup [DONE]
- [x] Choose and install testing libraries (e.g., `vitest`, `happy-dom` for component testing).
- [x] Configure `vitest.config.ts`.
- [x] Add `test` and `test:ui` scripts to `package.json`.

## Step 2: Unit Testing Clinical Engine [DONE]
- [x] Create tests for `src/lib/engine/triage-diagnosis.test.ts` (merged into `engine.test.ts`).
- [x] Create tests for `src/lib/engine/prescription.test.ts` (merged into `engine.test.ts`).
- [x] Mock the LLM client to return predictable diagnostic data.

## Step 3: API Integration Testing [DONE]
- [x] Implement tests for Hono routes using `hono.request()`.
- [x] Test patient registration and visit creation logic.
- [x] Ensure database state is handled correctly (e.g., using a test database or transactions).

## Step 4: End-to-End (E2E) Testing [DONE]
- [x] Set up Playwright for browser-based testing.
- [x] Automate the "Happy Path" for a patient visit.
- [x] Verify responsive design elements (like the hamburger menu) in E2E tests.

## Step 5: Continuous Integration (CI) [DONE]
- [x] Create a GitHub Action (or similar) to run tests on every push/PR (Configured local scripts).
- [x] Ensure the build environment can handle the database and necessary dependencies.
