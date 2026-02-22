# Grade 6: Prism and Cylinder Volume (角柱・円柱の体積)

## Files
- Generator: `src/problems/grade6/prism-volume.ts`
- Component: `src/problems/grade6/Grade6.tsx`

## Current State
Text-only: "底面の半径3cm、高さ7cmの円柱の体積は？"

## Proposed Figures

### 1. Cylinder (~180×180)

```
       ╭─────╮
      ╱  r    ╲
     │────●────│
      ╲       ╱
    ┌──╰─────╯──┐
    │            │  h
    │            │
    └──╭─────╮──┘
      ╱       ╲
     │         │
      ╲       ╱
       ╰─────╯
```

#### Elements
- **Top ellipse**: `<ellipse>` for top face
- **Bottom ellipse**: `<ellipse>` for bottom face (partially hidden)
- **Side lines**: two vertical lines connecting ellipses
- **Radius line**: on top face, from center to edge, labeled "半径 = Xcm"
- **Height label**: along side, labeled "高さ = Ycm"

### 2. Triangular Prism (~200×160)

```
        △ (triangular face)
       ╱│╲
      ╱ │h ╲
     ╱──┴──╲────────┐
     ╲     ╱        │
      ╲   ╱    H    │
       ╲ ╱         │
        └──────────┘
     ←b→
```

#### Elements
- **Front triangle**: `<polygon>` with base and height labeled
- **Depth edges**: lines going into the prism
- **Back triangle**: dashed lines
- **Base label**: "底辺 = Xcm", **triangle height label**: "高さ = Ycm"
- **Prism height label**: "奥行き = Zcm"

### 3. Generic Prism (底面積 given) (~160×140)

```
    ┌──────────┐
    │ 底面積S  │
    │          │  h
    └──────────┘
```

Simplified box representation since the base shape is abstracted as an area value.

#### Elements
- Simple rectangular prism outline
- Base face labeled "底面積 = Xcm²"
- Height labeled "高さ = Ycm"

### Data Changes
Add to problem interface:
```typescript
figure: {
  shape: "cylinder" | "triangular-prism" | "generic-prism";
  // For cylinder:
  radius?: number;
  // For triangular prism:
  base?: number;
  triangleHeight?: number;
  // For generic:
  baseArea?: number;
  // Common:
  height: number;
}
```

### Notes
- Use isometric-style projection for 3D effect
- Cylinder ellipses: use `ry` about 30% of `rx` for natural perspective
- Dashed lines for hidden edges
- Light shading on visible faces for depth perception
