# Phase 13 — Testing Suite Requirements

## Context
While the application has some ad-hoc Python scripts for testing API endpoints, it lacks a comprehensive, unified testing suite. To ensure long-term stability and prevent regressions as new features are added, we need a robust testing strategy covering multiple layers of the application.

## Goals
1.  **Reliability:** Catch bugs before they reach production.
2.  **Confidence:** Allow developers to refactor with the assurance that existing functionality remains intact.
3.  **Documentation:** Tests serve as executable documentation for the system's behavior.

## Requirements
- **Unit Tests:** Focus on pure functions and logic in the clinical engine (`src/lib/engine/`).
- **Integration Tests:** Validate API endpoints and database interactions.
- **E2E Tests:** Simulate user interactions in the browser (e.g., registering a patient, following the triage flow).
- **Unified Runner:** A single command to run all relevant tests.
- **Mocking:** Strategy for mocking LLM calls during testing to avoid costs and latency.

## Success Criteria
- [ ] Test coverage for the core diagnostic pipeline.
- [ ] Automated tests for all major API routes (`/api/patients`, `/api/visits`, etc.).
- [ ] At least one E2E flow (Dashboard -> Patient List -> Detail -> New Visit) is automated.
- [ ] Tests can be run locally with a single command (e.g., `npm test`).
