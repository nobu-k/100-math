# Grade 8: Triangle Angles (三角形の角)

## Files
- Generator: `src/problems/grade8/triangle-angle.ts`
- Component: `src/problems/grade8/Grade8.tsx`

## Current State
Text-only: "三角形の2つの角が 50° と 70° のとき、残りの角は？"

## Proposed Figures

### 1. Interior Angle (~200×140)

```
         A
        ╱╲
       ╱  ╲
  a1° ╱    ╲ ?°
     ╱      ╲
    ╱___a2°__╲
   B          C
```

#### Elements
- **Triangle**: `<polygon>` with three vertices
- **Known angles**: arc indicators at two vertices with degree labels
- **Unknown angle**: arc indicator with "?" at the third vertex
- **Vertex labels**: "A", "B", "C" near each vertex

### 2. Exterior Angle (~220×140)

```
         A
        ╱╲
       ╱  ╲
  a1° ╱    ╲ a3°╲
     ╱      ╲    ╲ ?° (exterior)
    ╱___a2°__╲────→
   B          C    D
```

#### Elements
- **Triangle**: `<polygon>` with three vertices
- **Extended side**: `<line>` extending BC past C to point D
- **Two known interior angles**: arc indicators with degree labels at A and B
- **Interior angle at C**: small arc labeled "a3°"
- **Exterior angle**: arc between CD and CA, labeled "?"
- **Vertex labels**: "A", "B", "C"

### Data Changes
Add to problem interface:
```typescript
figure: {
  type: "interior" | "exterior";
  angles: [number, number, number];  // all three interior angles
  unknownVertex: number;             // 0=A, 1=B, 2=C
}
```

### Notes
- Angle arcs: small `<path>` arcs (12-18px radius) near each vertex
- Triangle shape should roughly reflect actual angles (acute/obtuse visible)
- For exterior angle, extend one side clearly past the vertex with an arrow
- Color the unknown angle differently (e.g., red arc with "?")
- Known angles labeled in black, unknown in a highlight color
