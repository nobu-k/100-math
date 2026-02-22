# Grade 9: Circle Angles (円周角・中心角)

## Files
- Generator: `src/problems/grade9/circle-angle.ts`
- Component: `src/problems/grade9/Grade9.tsx`

## Current State
Text-only: "弧ABに対する中心角が 80° のとき、円周角は？"

## Proposed Figures

### 1. Central ↔ Inscribed Angle (~180×180)

```
       ╭───A───╮
      ╱   ╱ ╲   ╲
     ╱   ╱   ╲   ╲
    │   ╱ θ°  ╲   │
    │  O───────   │
    │             │
     ╲           ╱
      ╲         ╱
       ╰───B───╯
           P (on circle)
```

#### Elements
- **Circle**: `<circle>` outline
- **Points A, B on circle**: two points defining the arc
- **Center O**: dot at circle center
- **Central angle**: two lines OA and OB with arc showing angle, labeled with value or "?"
- **Inscribed angle**: point P on the circle (on major arc), lines PA and PB with arc showing angle
- **Labels**: "中心角 = X°" or "?", "円周角 = X°" or "?"

### 2. Semicircle Inscribed Angle (~180×180)

```
       ╭───A───╮
      ╱    │    ╲
     ╱     │     ╲
    │      │  90° │
    B──────●──────C
           O
    (diameter BC)
```

#### Elements
- **Circle**: `<circle>` outline
- **Diameter**: horizontal line BC through center O
- **Point A**: on the semicircle (top half)
- **Lines**: BA and CA forming the inscribed angle
- **Right angle marker**: small square at A showing 90°
- **For indirect variant**: label one angle at B with value, "?" at C

### 3. Inscribed Quadrilateral (~180×180)

```
       ╭──A──╮
      ╱╱     ╲╲
     D         B
      ╲╲     ╱╱
       ╰──C──╯
```

#### Elements
- **Circle**: `<circle>` outline
- **Quadrilateral ABCD**: `<polygon>` inscribed in the circle
- **Four vertices on circle**: labeled A, B, C, D
- **Known angle**: arc with degree label at one vertex
- **Unknown angle**: arc with "?" at the opposite vertex
- **Visual cue**: highlight opposite angle pair

### Data Changes
Add to problem interface:
```typescript
figure: {
  type: "central-inscribed" | "semicircle" | "inscribed-quadrilateral";
  // For central-inscribed:
  centralAngle?: number;
  inscribedAngle?: number;
  findTarget?: "central" | "inscribed";
  // For semicircle:
  otherAngle?: number;  // null for direct "= 90°" question
  // For inscribed-quadrilateral:
  givenAngle?: number;
  givenVertex?: "A" | "B";
}
```

### Notes
- Place arc AB consistently (e.g., top of circle) with inscribed angle point P on the bottom
- Central angle and inscribed angle should visually share the same arc
- Color-code: given angle in blue, unknown in red
- Right angle marker at A for semicircle (small square symbol)
- For inscribed quadrilateral, emphasize that opposite angles are highlighted
- Inscribed angle point P should be on the major arc (opposite side from the arc AB)
