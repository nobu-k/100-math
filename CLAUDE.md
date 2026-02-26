# Git

- Keep history linear: use fast-forward merges or rebase (no merge commits).
- Delete branches after merging.
- Always ask for permission before running `git push`.

# Code Style

- Prefer arrow functions over regular functions.
- Follow Uncle Bob's stepdown rule: order functions so that higher-level functions appear before the lower-level functions they call. Each function should be followed by those at the next level of abstraction.

# Print Layout Guidelines

Every worksheet is designed to be printed on a single A4 page. When adding or modifying worksheets, follow these rules.

## 1. Fit on one A4 page

All problems must fit within a single A4 page (794×1123px at 96 dpi, with `@page { margin: 15mm }`). Nothing should overflow, be clipped, or overlap with the QR code in the bottom-right corner.

**Common violations (from `plans/print-layout-fixes.md`):**
- `data/data-analysis` had 8 problems that filled the entire page — problem (8) was squeezed to the bottom edge and the QR code overlapped problem (7)'s table. Fixed by reducing to 6 problems.
- `equations/simultaneous-eq` had 12 problems in a single column that consumed the full page. Fixed by reducing to 8 and switching to a 2-column layout.
- `computation/division` had a 3-column grid that overflowed A4 width, clipping the left column's digits. Fixed by reducing the KaTeX font size (24→20px) and column gap (32→12px).

## 2. Sufficient horizontal space

Problems must not be clipped at the left or right edges. Multi-column layouts must fit within the printable width with adequate padding.

**Rules of thumb:**
- Add `padding: 0 2mm` to grid containers (`g1-page`) in print CSS.
- Add `padding-left: 2mm` to figure grids (`dev-fig-page`) in print CSS.
- For 3-column grids, verify the total width (columns + gaps) fits within ~680px (A4 minus 15mm margins at 96 dpi). Reduce font size or gap if needed.
- SVGs with fixed `width`/`height` attributes should also include `viewBox` so they can be scaled via CSS for print.

**Common violations:**
- `geometry/angle` had left-column diagrams slightly clipped at the left edge due to missing padding.
- `data/line-graph` had 380px-wide SVG charts that didn't scale for print. Fixed by adding `viewBox` and a print CSS class that sets `width: 300px; height: auto`.

## 3. Sufficient vertical space

Students need blank space between and around problems to write answers and show work. Problems should be distributed across the full page — don't pack them at the top and leave the bottom half empty.

**Rules of thumb:**
- Simple fill-in-the-blank (e.g., `5 ÷ 3 = □`): minimal space needed — the grid layout provides enough.
- Text-based questions with short answers (e.g., scale conversion): 8–10 problems max. Beyond that the page becomes a dense wall of text.
- Problems requiring multi-step work (e.g., simultaneous equations, data analysis): 6–8 problems max. Use a 2-column layout and the `print-spread` class to distribute rows evenly across the full page height.
- Graph/chart problems with sub-questions: 2–3 graphs per page. Scale down SVGs for print to leave room for answers near each question.

**The `print-spread` class:** Add `print-spread` to any grid container where problems are sparse relative to the page. It sets `min-height: 220mm` (the printable A4 height minus title area) and `align-content: space-between` to distribute grid rows evenly from top to bottom. This ensures that the vertical space between problems grows to fill the page, giving students room to show their work.

```html
<div className="dev-fig-page print-spread">
```

**Common violations:**
- `equations/simultaneous-eq` had 8 problems in a 2-column grid packed tightly at the top, leaving the bottom half of the page empty. Fixed by adding `print-spread` to distribute the 4 rows evenly across the full page.
- `geometry/scale` had 10 text-only problems as a dense block with single-line spacing and no room for answers.
- `data/data-analysis` asked students to compute mean/median/mode/range but had no scratch space for calculations.

## Verifying print layouts

Use the `take-screenshot` skill with `--media print --full-page` at A4 size:

```
take-screenshot --full-page --media print http://localhost:5173/100-math/<group>/<operator> /tmp/screenshot.png 794 1123
```

Then use the Read tool to visually inspect the resulting PNG.
