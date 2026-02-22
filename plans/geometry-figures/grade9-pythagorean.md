# Grade 9: Pythagorean Theorem (三平方の定理)

## Files
- Generator: `src/problems/grade9/pythagorean.ts`
- Component: `src/problems/grade9/Grade9.tsx`

## Current State
Text-only: "直角三角形の2辺が 3cm と 4cm のとき斜辺は？"

## Proposed Figures

### 1. Basic Right Triangle (~200×150)

```
    A
    │╲
    │  ╲
  b │    ╲  c (hypotenuse)
    │      ╲
    │________╲
    B    a    C
```

#### Elements
- **Right triangle**: `<polygon>` with right angle at B
- **Right angle marker**: small square at vertex B
- **Side labels**: two known sides with values, unknown side with "?"
- **Vertex labels**: optional A, B, C

### 2. Special Triangles

#### 45-45-90 (~180×150)

```
    A
    │╲
    │  ╲
  a │ 45°╲  a√2
    │      ╲
    │__45°__╲
    B    a    C
```

#### 30-60-90 (~200×150)

```
    A
    │╲
    │  ╲
    │    ╲
  b │ 60° ╲  2a (hypotenuse)
    │       ╲
    │___30°__╲
    B    a    C
```

#### Equilateral Triangle Height (~180×160)

```
        A
       ╱ ╲
      ╱   ╲
   a ╱  h  ╲ a
    ╱   │    ╲
   ╱    │     ╲
  B─────M──────C
      a/2   a/2
```

#### Elements for special triangles
- **Triangle**: `<polygon>` with appropriate shape
- **Angle labels**: degree values (45°, 30°, 60°) at relevant vertices
- **Right angle marker**: small square
- **Height line**: dashed vertical for equilateral triangle
- **Side labels**: known values and "?"
- **Equal marks**: tick marks on equal sides

### 3. Coordinate Distance (~180×180)

```
        y
        │
        │     B(x₂,y₂)
        │    ╱
        │   ╱
        │  ╱  ?
        │ ╱
    A(x₁,y₁)
        │
  ──────┼──────→ x
        │
```

#### Elements
- **Coordinate axes**: x and y with arrows and labels
- **Points A and B**: dots with coordinate labels
- **Distance line**: line segment from A to B, labeled "?"
- **Right triangle**: dashed horizontal and vertical lines forming the legs

### 4. Cuboid Diagonal (~200×160)

```
    ┌──────────┐
   ╱│         ╱│
  ╱ │        ╱ │
 ╱  │   ?   ╱  │  c
┌──────────┐   │
│   └──────│───┘
│  ╱       │  ╱  b
│ ╱        │ ╱
│╱         │╱
└──────────┘
      a
```

#### Elements
- **Rectangular prism**: isometric 3D box
- **Space diagonal**: dashed line from one corner to opposite corner, labeled "?"
- **Three edge labels**: a, b, c with values
- **Hidden edges**: dashed lines

### Data Changes
Add to problem interface:
```typescript
figure: {
  type: "basic" | "special-45" | "special-30-60" | "equilateral-height"
       | "coordinate" | "cuboid";
  // For basic:
  sides?: { a: number; b: number; c: number };
  unknownSide?: "a" | "b" | "c";  // which side is "?"
  // For special-45:
  leg?: number;
  findHypotenuse?: boolean;
  // For special-30-60:
  shortSide?: number;
  findTarget?: "hypotenuse" | "long-leg" | "short-leg";
  // For equilateral-height:
  side?: number;
  // For coordinate:
  pointA?: { x: number; y: number };
  pointB?: { x: number; y: number };
  // For cuboid:
  dims?: { a: number; b: number; c: number };
}
```

### Notes
- Right angle marker (small square) is essential for all right triangles
- For special triangles, angle labels help identify the type (45°, 30°, 60°)
- Triangle proportions should roughly reflect actual angles
- For coordinate problems, show a simple grid with axes
- For cuboid, use isometric projection matching grade5-volume style
- Dashed line for the space diagonal to distinguish from edges
