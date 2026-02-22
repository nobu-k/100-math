# Grade 6: Circle Area (円の面積)

## Files
- Generator: `src/problems/grade6/circle-area.ts`
- Component: `src/problems/grade6/Grade6.tsx`

## Current State
Text-only: "半径6cmの円の面積は？（円周率3.14）"

## Proposed Figure

Circle or semicircle with radius labeled and shaded area.

### SVG Layout (~160×160)

```
Full circle:            Semicircle:

    ╭───────╮           ╭───────╮
   ╱░░░░░░░░░╲         ╱░░░░░░░░░╲
  │░░░░●──────│ r      │░░░░●──────│ r
   ╲░░░░░░░░░╱         └───────────┘
    ╰───────╯
```

### Elements
1. **Circle**: `<circle>` with light fill (shaded area)
2. **Radius line**: from center to edge, labeled "半径 = Xcm"
3. **Center dot**: small filled circle
4. **For semicircle**: clip the circle to half, show diameter line along the flat edge
5. **Shaded area**: light blue fill to indicate the area being calculated

### Variants
- **Full circle**: Complete circle with radius label
- **Semicircle**: Half circle with radius label and diameter base line

### Data Changes
Add to problem interface:
```typescript
figure: {
  type: "full" | "half";
  radius: number;
}
```

### Notes
- Use a visible fill color (light blue, `#e3f2fd`) to emphasize "area"
- Semicircle should clearly show the flat edge as a diameter
