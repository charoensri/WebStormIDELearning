# Phase 12 — Component Architecture Implementation Plan

## Approach
We will incrementally extract the sub-components from `Layout.tsx` into separate files in `src/components/`.

## Step 1: Create Header Component [DONE]
- [x] Create `src/components/Header.tsx`.
- [x] Move the `<header>` block and its associated CSS classes/markup.
- [x] Import and use `Header` in `Layout.tsx`.

## Step 2: Create Footer Component [DONE]
- [x] Create `src/components/Footer.tsx`.
- [x] Move the `<footer>` block.
- [x] Import and use `Footer` in `Layout.tsx`.

## Step 3: Refactor Main/Content Wrapper [DONE]
- [x] Decide if `<main>` deserves its own component or stays as a simple tag in `Layout`.
- [x] Ensure `{children}` are correctly passed.

## Step 4: Logic & Scripts [DONE]
- [x] Audit the scripts in `Layout.tsx`.
- [x] Move the mobile menu toggle logic to be more closely associated with the `Header` if possible, or ensure it still targets the correct IDs.
- [x] Keep the SSE script and Table Sorting script in `Layout` or move them to appropriate utility files/components if they are global.

## Step 5: Validation [DONE]
- [x] Verify navigation works on mobile and desktop.
- [x] Verify footer is correctly positioned.
- [x] Run `npm run typecheck` (or equivalent) to ensure no TS errors.
