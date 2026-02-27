# Print Layout Fixes

Identified by visual inspection of all 104 worksheet screenshots (A4, 794x1123px at 96dpi, `--media print`).

**Date:** 2026-02-26

---

## Summary

| Category | Count | Worksheets |
|---|---|---|
| OK (no issues) | 37 | See "No Issues" section |
| Vertical spacing (needs `print-spread`) | 63 | See per-group tables below |
| Horizontal clipping | 3 | `decimals/decimal-comp`, `decimals/decimal-shift`, `geometry/sector` |
| Overflow / too dense | 1 | `data/data-analysis` |

---

## No Issues (37 worksheets)

These worksheets have good print layout -- no overflow, no clipping, good vertical distribution.

- `grid100/addition`, `grid100/subtraction`, `grid100/multiplication`
- `hissan/addition`, `hissan/subtraction`, `hissan/multiplication`
- `integer/lcm`, `integer/gcd`
- `numbers/even-odd`, `numbers/prime`, `numbers/square-root`
- `fractions/common-denominator`
- `equations/simultaneous-eq`, `equations/expansion`, `equations/factoring`, `equations/quadratic-eq`
- `geometry/circle-rd`, `geometry/area`, `geometry/angle`, `geometry/area-formula`, `geometry/volume`, `geometry/circumference`, `geometry/circle-area`, `geometry/prism-volume`, `geometry/solid-volume`, `geometry/polygon-angle`, `geometry/triangle-angle`, `geometry/parallel-angle`, `geometry/parallelogram`, `geometry/similarity`, `geometry/circle-angle`, `geometry/pythagorean`
- `relations/coordinate`
- `data/bar-graph`, `data/line-graph`, `data/freq-table`

---

## Vertical Spacing Issues (63 worksheets)

All of these share the same problem: problems are packed at the top of the page, leaving 40-80% of the page blank at the bottom.

**Fix:** Add the `print-spread` class to the problem grid container. This sets `min-height: 210mm` and `grid-auto-rows: 1fr`, distributing rows evenly across the full page height.

### hissan (1)

| Worksheet | Layout | Usage | Notes |
|---|---|---|---|
| `hissan/division` | 3-col, 2 rows | top ~35% | 6 problems; bottom 65% empty. Long division needs scratch space. |

### integer (2)

| Worksheet | Layout | Usage | Notes |
|---|---|---|---|
| `integer/multiples` | 2-col, 5 rows | top ~40% | Students need space to list multiples. |
| `integer/factors` | 2-col, 5 rows | top ~40% | Students need space to list factors. |

### computation (15)

| Worksheet | Layout | Usage | Notes |
|---|---|---|---|
| `computation/fill-blank` | 2-col, 6 rows | top ~35% | |
| `computation/kuku-blank` | 3-col, 5 rows | top ~30% | |
| `computation/mushikui` | 2-col, 6 rows | top ~35% | |
| `computation/division` | 3-col, 5 rows | top ~28% | |
| `computation/mental-math` | 4-col, 5 rows | top ~28% | |
| `computation/mixed-calc` | 2-col, 6 rows | top ~33% | |
| `computation/div-check` | 1-col | top ~28% | Worst offender -- single column, students need verification scratch space. |
| `computation/calc-trick` | 1-col | top ~25% | Multi-step problems need significant scratch space. |
| `computation/estimate` | 1-col | top ~28% | Students need space for rounding work. |
| `computation/frac-mixed-calc` | 2-col, 5 rows | top ~30% | Fraction simplification needs scratch space. |
| `computation/pos-neg-add-sub` | 2-col | top ~40% | |
| `computation/pos-neg-mul-div` | 2-col | top ~38% | |
| `computation/pos-neg-mixed` | 2-col, 5 rows | top ~25% | Multi-step order-of-operations problems. |
| `computation/poly-add-sub` | 2-col, 6 rows | top ~35% | Combining like terms needs work space. |
| `computation/mono-mul-div` | 2-col, 6 rows | top ~30% | |

### numbers (9)

| Worksheet | Layout | Usage | Notes |
|---|---|---|---|
| `numbers/decomposition` | 2-col | top ~33% | |
| `numbers/comparison` | 3-col, 5 rows | top ~25% | |
| `numbers/sequence` | 1-col | top ~40% | |
| `numbers/large-num` | 1-col | top ~20% | Kanji-to-digit conversion; very dense. |
| `numbers/large-num3` | 1-col | top ~25% | |
| `numbers/large-num4` | 1-col | top ~25% | |
| `numbers/rounding` | 1-col | top ~25% | Text-based problems. |
| `numbers/decimal-place` | 1-col | top ~20% | |
| `numbers/absolute-value` | 1-col | top ~25% | |

### fractions (8)

| Worksheet | Layout | Usage | Notes |
|---|---|---|---|
| `fractions/addition` | 2-col, 5 rows | top ~40% | |
| `fractions/frac-conv` | 1-col | top ~25% | Severe -- single column, very dense. |
| `fractions/reduction` | 2-col | top ~35% | |
| `fractions/frac-decimal` | 1-col | top ~25% | Severe -- single column, very dense. |
| `fractions/diff-frac` | 2-col, 6 rows | top ~30% | Needs scratch space for common denominators. |
| `fractions/frac-compare` | 2-col | top ~35% | |
| `fractions/frac-mul` | 2-col, 6 rows | top ~30% | |
| `fractions/frac-div` | 2-col, 6 rows | top ~30% | |

### decimals (2)

| Worksheet | Layout | Usage | Notes |
|---|---|---|---|
| `decimals/decimal-comp` | 3-col, 5 rows | top ~20% | Also has left-edge title clipping (see below). |
| `decimals/decimal-shift` | 1-col | top ~25% | Also has left-edge title clipping (see below). |

### equations (6)

| Worksheet | Layout | Usage | Notes |
|---|---|---|---|
| `equations/box-eq` | 2-col, 6 rows | top ~30% | |
| `equations/pattern-eq` | 1-col | top ~35% | Text-heavy pattern problems need scratch space. |
| `equations/literal-expr` | 1-col | top ~30% | |
| `equations/expr-value` | 1-col | top ~30% | Multi-step evaluation with negatives/exponents. |
| `equations/linear-expr` | 2-col, 6 rows | top ~30% | |
| `equations/linear-eq` | 2-col, 6 rows | top ~30% | Multi-step solving needs work space. |

### geometry (2)

| Worksheet | Layout | Usage | Notes |
|---|---|---|---|
| `geometry/area-unit` | 1-col | top ~25% | Simple unit conversions, but very unbalanced. |
| `geometry/scale` | 1-col | top ~20% | Text-only, multi-step scale conversions need scratch space. |

### measurement (8)

| Worksheet | Layout | Usage | Notes |
|---|---|---|---|
| `measurement/clock` | 4-col, 2 rows | top ~33% | Clock faces bunched at top; students need space to write times. |
| `measurement/unit-conv` | 1-col | top ~25% | |
| `measurement/time-calc` | 1-col | top ~25% | Time calculations need scratch space. |
| `measurement/unit-conv3` | 1-col | top ~25% | |
| `measurement/time-calc3` | 1-col | top ~25% | |
| `measurement/speed` | 1-col | top ~33% | Speed/time/distance calculations need significant scratch space. |
| `measurement/unit-amount` | 1-col | top ~33% | Word problems with division. |
| `measurement/average` | 1-col | top ~33% | Summing and dividing needs scratch space. |

### relations (7)

| Worksheet | Layout | Usage | Notes |
|---|---|---|---|
| `relations/pattern-table` | 1-col | top ~60% | 6 tables with minimal gap; students need space to write rules. |
| `relations/percent` | 1-col | top ~25% | Percentage calculations need scratch space. |
| `relations/ratio` | 1-col | top ~30% | |
| `relations/proportion-table` | 1-col | top ~60% | Tables closely stacked. |
| `relations/proportion-eq` | 1-col | top ~28% | Multi-step proportionality work. |
| `relations/linear-func` | 1-col | top ~30% | 12 problems may be too many; consider reducing to 8-10. |
| `relations/quadratic-func` | 1-col | top ~25% | Quadratic computations need scratch space. |

### data (6)

| Worksheet | Layout | Usage | Notes |
|---|---|---|---|
| `data/table-read` | 1-col | top ~60% | 3 tables with sub-questions; needs room for answers. |
| `data/cross-table` | 1-col | top ~55% | 4 tables closely stacked. |
| `data/representative` | 1-col | top ~65% | 8 problems; may need reduction to 6 + print-spread. |
| `data/counting` | 1-col | top ~25% | Students need space for tree diagrams / lists. |
| `data/probability` | 1-col | top ~30% | Dice problems need outcome tables. |
| `data/sampling` | 1-col | top ~25% | Proportion setup + written explanations. |

---

## Horizontal Clipping (3 worksheets)

| Worksheet | Issue | Fix |
|---|---|---|
| `decimals/decimal-comp` | Title's first character clipped at left edge. | Increase left padding on page container. |
| `decimals/decimal-shift` | Title's first character clipped at left edge. | Increase left padding on page container. |
| `geometry/sector` | Angle labels ("0°") on problems (1) and (2) partially clipped at left edge. | Increase left padding or adjust diagram positioning. |

---

## Overflow / Too Dense (1 worksheet)

| Worksheet | Issue | Fix |
|---|---|---|
| `data/data-analysis` | Two large frequency tables + 3 calculation problems fill the entire page with zero scratch space. Problem (6) is at the very bottom edge, risking overflow. | Reduce from 6 to 4-5 problems, or split frequency tables and calculation questions into alternating blocks with more spacing. |

---

## Implementation Priority

### Phase 1: Batch `print-spread` fix (63 worksheets)

Most worksheets need only the `print-spread` class added to their problem grid container. This is a mechanical change -- find the grid container in each component and add the class.

Before applying, verify that each component's container is a CSS grid (not flexbox), since `print-spread` relies on `grid-auto-rows: 1fr`.

### Phase 2: Horizontal clipping fixes (3 worksheets)

- `decimals/decimal-comp` and `decimals/decimal-shift`: Check and fix left padding on page container.
- `geometry/sector`: Adjust sector diagram positioning or add left padding.

### Phase 3: Content density fix (1 worksheet)

- `data/data-analysis`: Reduce problem count or restructure layout to provide scratch space.
