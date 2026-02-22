# Grade 4: Area — Rectangle and Square (面積)

## Files
- Generator: `src/problems/grade4/area.ts`
- Component: `src/problems/grade4/Grade4.tsx`

## Current State
Text-only: "たて8cm、よこ11cmの長方形の面積は？"

## Proposed Figure

A labeled rectangle or square drawn per problem.

### SVG Layout (~200×150)

```
     よこ = 11cm
  ←──────────────→
  ┌──────────────┐ ↑
  │              │ │ たて = 8cm
  │              │ │
  └──────────────┘ ↓
```

### Elements
1. **Rectangle**: `<rect>` with aspect ratio matching the actual dimensions (scaled proportionally)
2. **Width label**: centered above or below, "よこ = Xcm" (or "?cm")
3. **Height label**: centered to the right or left, "たて = Ycm" (or "?cm")
4. **For squares**: equal sides, label "一辺 = Xcm"
5. **Right angle marks**: small square in corner to indicate right angles

### Variants
- **Forward (area = ?)**: Both dimensions labeled, area is the question
- **Reverse (side = ?)**: Area given as text, one dimension labeled, other dimension shows "?"

### Data Changes
Add to problem interface:
```typescript
figure: {
  shape: "square" | "rect";
  width: number;
  height: number;
  unknown: "area" | "width" | "height";
}
```

### Notes
- Scale proportionally but clamp aspect ratio (don't let very thin rectangles look like lines)
- Min rendered dimension: 40px, max: 160px
- For squares, render as visually square
