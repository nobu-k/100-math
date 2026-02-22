# Grade 8: Polygon Angles (多角形の角)

## Files
- Generator: `src/problems/grade8/polygon-angle.ts`
- Component: `src/problems/grade8/Grade8.tsx`

## Current State
Text-only: "五角形の内角の和は何度？" / "正六角形の1つの内角は何度？"

## Proposed Figures

### SVG Layout (~180×160)

```
Pentagon:              Hexagon:             Octagon:

    ╱╲                  __                ╱──╲
   ╱  ╲               ╱    ╲            ╱    ╲
  ╱    ╲             ╱      ╲          │      │
  ╲    ╱             │      │          │      │
   ╲  ╱              ╲      ╱           ╲    ╱
    ╲╱                ╲____╱             ╲──╱
```

### Elements

#### For interior-sum type
- **Regular polygon**: `<polygon>` with n vertices evenly distributed on a circle
- **Diagonal lines**: dashed lines from one vertex to all non-adjacent vertices, showing triangulation
- **Triangle count label**: "(n−2) triangles" or similar visual cue

#### For regular polygon (single interior angle)
- **Regular polygon**: `<polygon>` with n vertices
- **One angle highlighted**: arc at one vertex with "?" label
- **Equal marks**: small tick marks on all sides indicating equal lengths

#### For exterior angle sum
- **Polygon** with extended sides at each vertex
- **Exterior angles**: arcs showing the exterior angle at each vertex
- **Label**: "?" for the sum

#### For find-n type
- **Generic polygon** outline (could use the answer n-gon)
- **Interior angle sum label**: "内角の和 = X°" inside the polygon

### Data Changes
Add to problem interface:
```typescript
figure: {
  type: "interior-sum" | "regular" | "exterior" | "find-n";
  sides: number;  // number of sides of the polygon
}
```

### Notes
- Draw regular polygons using vertices at `(cx + r*cos(θ), cy + r*sin(θ))` for each vertex
- Rotate so that the bottom edge is horizontal (start angle offset)
- Polygon names (n=3..12) map to: 三角形, 四角形, ..., 十二角形
- For interior-sum, showing diagonal triangulation helps visualize `(n-2)×180`
- For regular polygon, show one highlighted angle with the arc
- Equal-length tick marks on sides reinforce "regular" polygon concept
