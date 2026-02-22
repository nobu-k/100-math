# Grade 4: Angles — Basic Angle Arithmetic (角度)

## Files
- Generator: `src/problems/grade4/angle.ts`
- Component: `src/problems/grade4/Grade4.tsx`

## Current State
Text-only arithmetic: "180° − 60° = □" / "45° + 90° = □"

## Proposed Figure

An angle diagram showing the visual representation of the angle operation.

### SVG Layout (~160×120)

```
  For supplement (180° - x°):

        ╱  x°
  ─────●─────────
       (the angle formed)

  For addition (x° + y°):

      ╱  y°
     ╱
    ╱  x°
  ─●─────────
```

### Elements
1. **Base ray**: horizontal line from vertex to the right
2. **Second ray**: line from vertex at the given angle
3. **Arc**: circular arc between rays showing the angle measure
4. **Angle label**: text near the arc showing the known angle value
5. **For supplement**: show straight line (180°) and the angle being subtracted
6. **For 360° problems**: show full rotation with the subtracted angle marked

### Variants
- **Supplement (180° - x°)**: Straight angle with one part labeled x°, the other part is "?"
- **Addition (x° + y°)**: Two adjacent angles, each labeled, total is "?"
- **Full rotation (360° - x°)**: Full circle with one sector labeled x°, remainder is "?"

### Data Changes
Add to problem interface:
```typescript
figure: {
  type: "supplement" | "addition" | "full-rotation";
  angles: number[];  // known angles in degrees
}
```

### Notes
- Use standard math orientation: 0° along positive x-axis, counter-clockwise positive
- Arc radius: ~30px from vertex
- Vertex at bottom-left of SVG for natural reading
