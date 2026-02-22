# Grade 7: Coordinate Geometry (座標)

## Files
- Generator: `src/problems/grade7/coordinate.ts`
- Component: `src/problems/grade7/Grade7.tsx`

## Current State
Text-only: "点(3, 5)は第何象限？" / "y = 2x のグラフは点(3, 6)を通る？"

## Proposed Figures

### 1. Quadrant Identification (~200×200)

```
        y
        │
   II   │   I
        │
  ──────●──────→ x
        │
   III  │   IV
        │
        ↓

   • (3, 5) ← plotted point
```

#### Elements
- **Axes**: `<line>` elements for x and y axes with arrows
- **Grid lines**: light gray lines at integer intervals
- **Axis labels**: "x" and "y" at axis ends
- **Origin**: labeled "O"
- **Quadrant labels**: "I", "II", "III", "IV" in each quadrant (faded)
- **Point**: colored dot at the given coordinates
- **Point label**: "(x, y)" near the point

### 2. Graph Line Verification (~200×200)

```
        y
        │   ╱
        │  ╱  y = 2x
        │ ╱
  ──────●──────→ x
       ╱│
      ╱ │
        │

   • (3, 6) ← is it on the line?
```

#### Elements
- **Axes**: same as above
- **Line**: `<line>` representing y = ax through origin
- **Line label**: formula "y = ax"
- **Point**: colored dot at the test point
- **Point label**: "(x, y)"

### Data Changes
Add to problem interface:
```typescript
figure: {
  type: "quadrant" | "on-graph";
  point: { x: number; y: number };
  // For on-graph:
  slope?: number;  // coefficient 'a' in y = ax
}
```

### Notes
- Coordinate range: show -8 to 8 on both axes
- Grid spacing: every 2 units
- Point should be clearly visible (larger dot, contrasting color)
- For "on-graph" type, draw the line extending across the visible area
- Tick marks with numbers at each integer
