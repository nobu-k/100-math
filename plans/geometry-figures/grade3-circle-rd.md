# Grade 3: Circle Radius/Diameter (円の半径と直径)

## Files
- Generator: `src/problems/grade3/circle-rd.ts`
- Component: `src/problems/grade3/Grade3.tsx`

## Current State
Text-only: "半径5cmの円の直径は？" / "直径24cmの円の半径は？"

## Proposed Figure

A simple circle diagram shown per problem, with labeled radius and/or diameter.

### SVG Layout (~160×160)

```
         d (diameter label)
    ←─────────────────→
        ┌─────────┐
       ╱           ╲
      │      ●──────│──→ r (radius label)
       ╲           ╱
        └─────────┘
```

### Elements
1. **Circle**: `<circle>` centered in SVG, radius ~60px
2. **Radius line**: horizontal line from center to edge, with label "r = Xcm"
3. **Diameter line**: horizontal line across full circle, with label "d = Xcm" (or "?")
4. **Center dot**: small filled circle at center
5. **Dimension labels**: text showing known value; "?" for the unknown

### Variants
- **Radius → Diameter**: Show radius line with value, diameter line with "?"
- **Diameter → Radius**: Show diameter line with value, radius line with "?"
- **Conceptual ("何倍")**: Show both lines with values, no "?"

### Data Changes
Add to the `CircleRDProblem` interface:
```typescript
figure: {
  type: "radius-to-diameter" | "diameter-to-radius" | "conceptual";
  radius: number;    // in cm
  diameter: number;  // in cm
}
```

### Notes
- Keep colors simple: black circle outline, blue for known dimension, red or dashed for unknown
- Use `viewBox="0 0 160 160"` for consistent scaling
