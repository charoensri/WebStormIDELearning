# Phase 11 — Mobile-First UX Implementation Plan

## Approach
We will utilize a Mobile-First CSS approach, using media queries to enhance the layout for larger screens while ensuring the baseline experience works well on small devices.

## Step 1: Layout & Global CSS [DONE]
- [x] Update `viewport` meta tag for better mobile scaling.
- [x] Implement hamburger menu markup in `Layout.tsx`.
- [x] Add JS toggle logic for the mobile menu.
- [x] Add CSS variables for header height and touch-friendly targets.
- [x] Create `.table-container` class for horizontal scrolling.

## Step 2: Content Refactoring [DONE]
- [x] Wrap all `visit-table` instances in `.table-container` across all pages.
- [x] Refactor `Home.tsx` and `Analytics.tsx` to use flexible grid systems instead of fixed column counts.
- [x] Update `PatientDetail.tsx` timeline for narrow viewports.

## Step 3: Touch & Density [DONE]
- [x] Audit all buttons to ensure `min-height: 44px`.
- [x] Adjust padding in `stat-card` for mobile.
- [x] Verify chart responsiveness in `Home` and `Analytics`.

## Step 4: Polish [DONE]
- [x] Smooth transition for mobile menu opening.
- [x] Hide less critical columns on mobile for the most used tables (e.g., Patient ID).
- [x] Final visual regression check on real mobile browser/emulator.
