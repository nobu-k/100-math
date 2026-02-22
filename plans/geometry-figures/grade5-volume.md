# Grade 5: Volume — Cube and Rectangular Prism (体積)

## Files
- Generator: `src/problems/grade5/volume.ts`
- Component: `src/problems/grade5/Grade5.tsx`

## Current State
Text-only: "たて3cm、よこ7cm、高さ4cmの直方体の体積は？"

## Proposed Figure

Isometric 3D views of cube and rectangular prism with labeled edges.

### SVG Layout (~200×160)

```
Rectangular Prism (isometric):

        ┌──────────┐
       ╱│         ╱│
      ╱ │ h      ╱ │
     ╱  │       ╱  │
    ┌──────────┐   │
    │   └──────│───┘
    │  ╱  w    │  ╱
    │ ╱        │ ╱  d
    │╱         │╱
    └──────────┘
```

### Elements
1. **3D box**: 6 edges visible in isometric projection using `<line>` or `<path>`
2. **Front face**: slightly shaded to show depth
3. **Width label**: along bottom front edge, "よこ = Xcm"
4. **Height label**: along left front edge, "高さ = Ycm"
5. **Depth label**: along bottom side edge, "たて = Zcm"
6. **Hidden edges**: dashed lines for the 3 back edges

### Variants
- **Cube**: All three labels show same value, label "一辺 = Xcm"
- **Rectangular prism**: Three different dimension labels

### Isometric Projection
Use 30° angles for isometric projection:
- Front face: rectangle with width and height
- Side face: parallelogram going back-right at 30°
- Top face: parallelogram going back at 30°

### Data Changes
Add to problem interface:
```typescript
figure: {
  shape: "cube" | "rect";
  width: number;
  height: number;
  depth: number;
}
```

### Notes
- Use different fill shades for the three visible faces (e.g., white, light gray, medium gray)
- Scale proportionally but ensure minimum visible dimension
- For cubes, all dimensions are equal — make it visually obvious
