# Grade 5: Circle Circumference (円周)

## Files
- Generator: `src/problems/grade5/circumference.ts`
- Component: `src/problems/grade5/Grade5.tsx`

## Current State
Text-only: "直径8cmの円の円周は？（円周率3.14）"

## Proposed Figure

A circle with labeled diameter and an indication of the circumference.

### SVG Layout (~160×160)

```
        C = ? (circumference)
      ╭───────╮
     ╱         ╲
    │     ●──────│  d = 8cm
     ╲         ╱
      ╰───────╯
```

### Elements
1. **Circle**: `<circle>` with stroke, light fill
2. **Diameter line**: horizontal line through center, labeled "直径 = Xcm" (or "?")
3. **Center dot**: small filled circle
4. **Circumference indicator**: for forward problems, a small curved arrow along the circle edge with "?" label; for reverse, show the circumference value

### Variants
- **Forward (diameter → circumference)**: Diameter labeled with value, circumference is "?"
- **Reverse (circumference → diameter)**: Circumference given, diameter shows "?"

### Data Changes
Add to problem interface:
```typescript
figure: {
  diameter: number;
  mode: "forward" | "reverse";
}
```

### Notes
- Visually distinguish known vs unknown: solid line + value for known, dashed line + "?" for unknown
- Keep size consistent regardless of diameter value
