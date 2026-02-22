# Grade 7: Solid Volume and Surface Area (立体の体積と表面積)

## Files
- Generator: `src/problems/grade7/solid-volume.ts`
- Component: `src/problems/grade7/Grade7.tsx`

## Current State
Text-only: component constructs question from `solidType`, dimensions.

## Proposed Figures

### 1. Cylinder (~160×180)

```
       ╭─────╮
      ╱       ╲
     │────●────│  ← r
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
- **Bottom ellipse**: `<ellipse>` for bottom face (front half solid, back half dashed)
- **Side lines**: two vertical lines connecting ellipses
- **Radius line**: on top face, labeled "r = Xcm"
- **Height label**: along side, "h = Ycm"

### 2. Cone (~160×180)

```
         ╲
          ╲
           ●  ← apex
          ╱ ╲
         ╱   ╲  l (slant, for SA)
        ╱     ╲
       ╱   h   ╲
      ╱    │    ╲
     ╭─────┼─────╮
    ╱   r  │      ╲
   │───────●───────│
    ╲             ╱
     ╰───────────╯
```

#### Elements
- **Base ellipse**: `<ellipse>` at bottom
- **Apex point**: dot at top center
- **Side lines**: two lines from apex to ellipse edges
- **Height line**: dashed vertical from apex to center of base, labeled "h = Xcm"
- **Radius line**: horizontal on base, labeled "r = Ycm"
- **Slant height**: (surface area only) along side edge, labeled "l = Zcm"

### 3. Sphere (~140×140)

```
       ╭───────╮
      ╱    r    ╲
     │─────●─────│
      ╲         ╱
       ╰───────╯
       - - - -    ← equator dashed ellipse
```

#### Elements
- **Circle**: `<circle>` for the outline
- **Equator ellipse**: dashed `<ellipse>` for 3D effect
- **Radius line**: from center to edge, labeled "r = Xcm"
- **Center dot**: small filled circle

### 4. Prism (~180×160)

```
Triangular prism:          Square prism:

      △                    ┌──────────┐
     ╱│╲                  ╱│         ╱│
    ╱ │ ╲────────┐       ╱ │        ╱ │
   ╱──┴──╲      │      ┌──────────┐  │
   ╲     ╱  h   │      │  └──────│───┘
    ╲   ╱       │      │ ╱   h   │ ╱
     ╲ ╱       │      │╱        │╱
      └────────┘      └──────────┘
```

#### Elements
- **Front face**: polygon (triangle or square)
- **Depth edges**: lines extending into the prism
- **Back face**: dashed lines
- **Dimension labels**: edge lengths and height

### Data Changes
Add to problem interface:
```typescript
figure: {
  solidType: "cylinder" | "cone" | "sphere" | "prism";
  radius?: number;       // cylinder, cone, sphere
  height?: number;       // cylinder, cone, prism
  slantHeight?: number;  // cone (surface area only)
  sides?: number;        // prism (3 or 4)
  edge?: number;         // prism edge length
  edgeH?: number;        // triangular prism base height
}
```

### Notes
- Use isometric-style projection for 3D shapes
- Dashed lines for hidden edges
- Light shading on visible faces for depth perception
- Cylinder ellipses: `ry` about 25-30% of `rx`
- Sphere equator ellipse adds 3D depth cue
- For surface area problems, label all relevant dimensions including slant height
