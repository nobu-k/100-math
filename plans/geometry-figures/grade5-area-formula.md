# Grade 5: Area Formula — Triangle, Parallelogram, Trapezoid (面積の公式)

## Files
- Generator: `src/problems/grade5/area-formula.ts`
- Component: `src/problems/grade5/Grade5.tsx`

## Current State
Text-only: "底辺8cm、高さ12cmの三角形の面積は？"

## Proposed Figures

Each shape needs a distinct diagram showing base, height, and the shape itself.

### 1. Triangle (~180×140)

```
        △
       ╱│╲
      ╱ │ ╲     h = 高さ
     ╱  │  ╲
    ╱   │   ╲
   ╱────┴────╲
   ← 底辺 b →
```

#### Elements
- **Triangle**: `<polygon>` with three vertices
- **Base line**: bottom edge, labeled "底辺 = Xcm"
- **Height line**: dashed vertical from apex to base, labeled "高さ = Ycm"
- **Right angle mark**: small square where height meets base

### 2. Parallelogram (~200×120)

```
      ┌──────────────┐
     ╱│             ╱
    ╱ │ h          ╱
   ╱  │           ╱
  └───┴──────────┘
  ←── 底辺 b ──→
```

#### Elements
- **Parallelogram**: `<polygon>` with 4 vertices (slanted)
- **Base line**: bottom edge, labeled "底辺 = Xcm"
- **Height line**: dashed vertical, labeled "高さ = Ycm"
- **Right angle mark**: where height meets base

### 3. Trapezoid (~200×130)

```
     ←上底 a→
     ┌──────┐
    ╱│      ╲
   ╱ │ h     ╲
  ╱  │        ╲
  └──┴─────────┘
  ←── 下底 b ──→
```

#### Elements
- **Trapezoid**: `<polygon>` with 4 vertices
- **Upper base**: top edge, labeled "上底 = Xcm"
- **Lower base**: bottom edge, labeled "下底 = Ycm"
- **Height line**: dashed vertical, labeled "高さ = Zcm"
- **Right angle mark**: where height meets base

### Data Changes
Add to problem interface:
```typescript
figure: {
  shape: "triangle" | "parallelogram" | "trapezoid";
  base: number;         // bottom base in cm
  height: number;       // height in cm
  upperBase?: number;   // for trapezoid only
}
```

### Notes
- Vary the shape slightly per problem (different lean angles for parallelogram, different proportions for trapezoid) so figures don't all look identical
- Height line should always be dashed with a right-angle mark
- Use a light fill (e.g., pale blue) to make the shape area visible
- This is CRITICAL priority: students must see the height is perpendicular to the base, especially for parallelograms and trapezoids
