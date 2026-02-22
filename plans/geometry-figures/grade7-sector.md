# Grade 7: Sector — Arc Length and Area (おうぎ形)

## Files
- Generator: `src/problems/grade7/sector.ts`
- Component: `src/problems/grade7/Grade7.tsx`

## Current State
Text-only: component constructs question from `type`, `radius`, `angle` fields.

## Proposed Figure

### SVG Layout (~160×160)

```
Arc Length:                    Area:

        ╭─ ─ ─╮                   ╭─ ─ ─╮
       ╱  arc?  ╲                ╱░░░░░░░░╲
      ╱    θ°    ╲              ╱░░░θ°░░░░░╲
     ●─────────────            ●─────────────
         r                         r
```

### Elements
1. **Arc**: `<path>` using SVG arc command for the curved portion
2. **Two radii**: `<line>` elements from center to arc endpoints
3. **Angle arc**: small arc near center showing the angle, labeled "θ°"
4. **Radius label**: along one radius, "r = Xcm"
5. **For arc type**: the arc itself highlighted/thickened with "?" label
6. **For area type**: shaded fill (`<path>` with fill) between the two radii and arc

### Variants
- **Arc length**: Arc is drawn with a thicker/colored stroke, "?" near the arc
- **Area**: Sector region is shaded (light blue), "?" inside the shaded area

### Data Changes
Add to problem interface:
```typescript
figure: {
  type: "arc" | "area";
  radius: number;
  angle: number;  // degrees
}
```

### Notes
- Center the sector with vertex at a consistent position (e.g., center-left)
- Angle arc should be small (15-20px radius) to not clutter
- For large angles (>180°), the sector wraps around — use SVG large-arc flag
- Scale radius visually (don't make it proportional to actual value)
