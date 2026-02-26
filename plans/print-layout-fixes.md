# Print Layout Fixes

Identified by visual inspection of all 104 worksheet screenshots (A4, 794x1123px at 96dpi, captured with 2x scale).

## Overflow / Content Cut Off

### `data/line-graph`
- 3 large graphs + questions fill the entire page height.
- Problem (3) questions are at the very bottom edge and may be cut off when printed.
- QR code overlaps with the third graph area.

### `data/data-analysis`
- 8 problems fill the entire A4 page.
- Problem (8) is squeezed to the very bottom edge.
- QR code overlaps with problem (7)'s table, obscuring some cumulative frequency cells.

### `equations/simultaneous-eq`
- 12 simultaneous equation systems in a single column consume the full page.
- Problem (12) sits with near-zero bottom margin, risking overflow.

## Insufficient Space for Student Work

### `equations/simultaneous-eq`
- No blank space at all for students to show work.
- Solving simultaneous equations requires multiple steps (substitution/elimination), but there's nowhere to write them.
- Fix idea: reduce to 6-8 problems, or use a two-column layout, or split across two pages.

### `geometry/scale`
- All 10 problems are a dense block of text with only single-line spacing.
- Unlike other worksheets (which use diagrams that create natural whitespace), this text-only sheet provides no blank area between problems for answers or calculations.

### `data/line-graph`
- No blank space next to questions for students to write answers.
- Questions are sandwiched between graphs with no writing room.

### `data/data-analysis`
- Questions ask students to compute mean/median/mode/range but there's no scratch space for showing work (summing numbers, dividing, etc.).

## Minor Issues

### `computation/division`
- Left column's first digits appear slightly cut off at the left edge of the page.
- The leftmost problems (1), (4), (7), (10), (13) may lose their first digit in print.

### `geometry/angle`
- Some angle diagrams on the left side (problems 1, 3, 5, 7) are slightly clipped at the left edge.
- Vertex dots and arc labels are very close to or partially beyond the left margin.

### `data/bar-graph`
- No explicit answer blanks next to questions (minor usability issue).

### `equations/pattern-eq`
- Problems (1) and (2) have identical data sets — likely a problem generation bug, not a layout issue.
