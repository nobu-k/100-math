# Mobile Layout Fixes

The app is designed for desktop and print. On smartphones (~375px viewport), many worksheets are broken or hard to use. This plan addresses the issues while preserving existing desktop and print layouts.

**Core decision:** All multi-column layouts become single-column on mobile. Scrolling is natural on phones, so more rows is fine.

**Approach:** All fixes use `@media screen and (max-width: 768px)` (matching the existing mobile breakpoint). No changes to desktop or `@media print` rules.

---

## Issue 1: All multi-column grids → single column

**Severity: High**
**Affected:** Every multi-column layout class

### What's broken

- **`ws-cols-3`** (division, kuku-blank, comparison): 3 columns overflow 375px — content clipped at both edges.
- **`ws-cols-4`** (mental-math): 4 columns overflow badly, first/last columns clipped.
- **`ws-cols-2`** (fill-blank, linear-eq, factoring, pos-neg, etc.): 2 columns technically fit but problems are very cramped — equations wrap mid-expression, answer boxes crowd the text.
- **`dev-fig-page`** (geometry, coordinate): 2×1fr columns squeeze SVGs and question text into ~175px each.
- **`fraction-page`**: Fraction expressions tight in narrow columns.
- **`integer-page`**: Japanese text wraps to 3+ lines per problem.
- **`hissan-page`**: 3 columns of fixed-width cells clip at right edge.
- **`ws-clock-grid`**: 4 clocks shrunk to ~80px, hour numbers unreadable.

### Fix

One `@media` block in each CSS file to force single column:

**`src/problems/shared/worksheet.css`:**
```css
@media screen and (max-width: 768px) {
  .ws-cols-2,
  .ws-cols-3,
  .ws-cols-4 {
    grid-template-columns: 1fr;
  }
  .ws-page {
    gap: 14px 0;
  }
  .ws-clock-grid {
    grid-template-columns: repeat(2, 1fr);  /* 2 columns OK for clocks */
  }
}
```

**`src/problems/shared/dev.css`:**
```css
@media screen and (max-width: 768px) {
  .dev-fig-page {
    grid-template-columns: 1fr;
  }
}
```

**`src/problems/hissan/hissan.css`:**
```css
@media screen and (max-width: 768px) {
  .hissan-page {
    grid-template-columns: repeat(2, auto);  /* 2 OK here — cells are small */
  }
}
```

**`src/problems/fractions/fraction.css`:**
```css
@media screen and (max-width: 768px) {
  .fraction-page {
    grid-template-columns: 1fr;
  }
}
```

**`src/problems/integer/integer.css`:**
```css
@media screen and (max-width: 768px) {
  .integer-page {
    grid-template-columns: 1fr;
  }
}
```

### Notes

- Clock keeps 2 columns — clocks at ~160px each fit fine in 375px and 1 column would waste space.
- Hissan keeps 2 columns — each problem is a small fixed-width cell block (~120px) that fits two-across comfortably. Single column would leave too much empty space.

---

## Issue 2: KaTeX math font and UI elements too large

**Severity: Medium**
**Affected:** Most worksheet problems

### What's broken

- `.ws-problem .katex` is 32px. Even in single column, long expressions like `6(x + 2) = 12  x = ___` benefit from a smaller font to avoid wrapping.
- Answer boxes at 44px and problem numbers at 36px/18px are oversized for mobile.

### Fix

**`src/styles/katex.css`:**
```css
@media screen and (max-width: 768px) {
  .ws-problem .katex {
    font-size: 24px;
  }
  .fraction-problem .katex {
    font-size: 22px;
  }
}
```

**`src/problems/shared/worksheet.css`** (add to the same `@media` block):
```css
  .ws-box {
    width: 36px;
    height: 36px;
  }
  .ws-num {
    width: 28px;
    font-size: 15px;
  }
```

---

## Issue 3: Sequence cells overflow width

**Severity: Low**
**Affected:** `ws-seq-page` (Sequence)

### What's broken

- Each sequence has ~8 cells at 44px + arrows ≈ 450px total, overflowing 375px viewport.
- Cells wrap to a second line, breaking the visual chain.

### Fix

**`src/problems/shared/worksheet.css`** (add to the same `@media` block):
```css
  .ws-seq-cell {
    width: 36px;
    height: 36px;
    font-size: 20px;
  }
```

---

## Issue 4: SVGs with fixed dimensions don't scale

**Severity: Low**
**Affected:** Geometry figures, coordinate graphs, bar/line charts

### What's broken

- SVGs have fixed `width`/`height` attributes (160px, 200px, 300px). In single-column mobile they fit, but some (300px charts) leave little margin and don't center well.

### Fix

**`src/problems/shared/dev.css`** (add to the same `@media` block):
```css
  .dev-fig-page svg {
    max-width: 100%;
    height: auto;
  }
```

---

## Implementation Plan

All changes are CSS-only, screen-only media queries. No component/structural changes needed.

### Files to modify (5 files):

| File | Changes |
|------|---------|
| `src/problems/shared/worksheet.css` | ws-cols → 1fr, gap, ws-box, ws-num, clock grid, seq cells |
| `src/problems/shared/dev.css` | dev-fig-page → 1fr, SVG scaling |
| `src/styles/katex.css` | KaTeX font size reduction |
| `src/problems/hissan/hissan.css` | hissan-page → 2 columns |
| `src/problems/fractions/fraction.css` | fraction-page → 1fr |
| `src/problems/integer/integer.css` | integer-page → 1fr |

### Testing

Take mobile screenshots (375×812) of representative pages:
- `/computation/division` (was 3-col)
- `/computation/mental-math` (was 4-col)
- `/computation/fill-blank` (was 2-col)
- `/equations/linear-eq` (long expressions)
- `/equations/factoring` (long expressions)
- `/geometry/angle` (figures)
- `/relations/coordinate` (figures + text)
- `/hissan/addition` (column arithmetic)
- `/measurement/clock` (clock grid)
- `/fractions/addition` (fractions)
- `/fractions/frac-mul` (fractions)
- `/numbers/sequence` (sequence cells)
- `/integer/multiples` (text)
- `/data/data-analysis` (text + tables)

Also verify desktop (1280×800) and print (794×1123 `--media print`) screenshots are unchanged.
