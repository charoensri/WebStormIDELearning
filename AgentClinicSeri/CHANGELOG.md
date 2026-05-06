# Changelog

All notable changes to this project will be documented in this file.

## 2026-04-30
### Added
- **Tabular Data Enhancement:** Implemented filtering and pagination across all major list pages (Patients, Ailments, Therapies, and Visits).
- Added search capabilities for agent names, models, ailments, and symptoms.
- Introduced status-based filtering for agents and ailments.
- Implemented server-side pagination to handle growing datasets efficiently.

### Fixed
- Resolved TypeScript type incompatibilities when filtering database columns with enum types in the backend.
- Fixed a port duplication issue where the server was starting on both 3001 and 3005 simultaneously.
- Resolved a UI overlap issue on the Dashboard where the local header obscured the global navigation during scroll.

## 2026-04-29
### Added
- **Phase 12: Component Architecture** - Refactored `Layout.tsx` into modular `Header`, `Footer`, and `Main` components for better maintainability.
- **Phase 13: Testing Suite** - Implemented a comprehensive testing strategy (Vitest, Playwright).
- New `changelog-manager` skill installed globally to automate project history updates.

### Changed
- **Refactoring:** Modularized `index.tsx` into `app.tsx` to enable isolated API testing.

### Removed
- Temporary skill development source files and build artifacts.

## 2026-04-28
- Mobile friendly enhancement
- End of phase 1 to phase 9
- chore: add Qodana configuration

## 2026-04-27
- End of phase 1 to phase 9

## 2026-04-21
- feat: implement AgentClinic MVP with Ollama pipeline, dashboard, and database schema

## 2026-04-19
- initial commit

## 2026-04-14
- Unpack changelog.skill into changelog/ folder in Lessons 09-13
- Populate Lesson_11-13 and add generic feature-spec skill
- Add Git to prerequisites and link to WebStorm download
- Add .gitignore for .DS_Store and local script file

## 2026-04-13
- Rename lesson folders with zero-padded numbers for correct sort order
- Add course lesson folders, skills, example specs, and README
