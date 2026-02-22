# Grade 8: Parallel Lines and Angles (平行線と角)

## Files
- Generator: `src/problems/grade8/parallel-angle.ts`
- Component: `src/problems/grade8/Grade8.tsx`

## Current State
Text-only: "2直線が平行のとき、∠a = 65° ならば同位角 ∠b = ?"

## Proposed Figures

### 1. Vertical Angles (~180×140)

```
        ╲ ╱
    ∠b   ╳   ∠a
        ╱ ╲
```

#### Elements
- **Two intersecting lines**: `<line>` elements crossing at a point
- **Angle arcs**: small arcs showing ∠a (given) and ∠b (unknown)
- **Labels**: "∠a = X°" near one angle, "∠b = ?" near the opposite angle

### 2. Corresponding Angles (~200×160)

```
         l₁  ╱
    ─────────╱──────  line 1
       ∠a   ╱
            ╱
           ╱  t (transversal)
          ╱
     ────╱──────────  line 2
    ∠b  ╱
       ╱
```

#### Elements
- **Two parallel lines**: `<line>` elements, horizontal
- **Parallel markers**: small arrows or ">" marks on each line
- **Transversal**: `<line>` crossing both parallel lines at an angle
- **Angle arc at line 1**: labeled "∠a = X°"
- **Angle arc at line 2**: labeled "∠b = ?"

### 3. Co-interior / Same-side Interior Angles (~200×160)

```
    ─────────╱──────  line 1
            ╱ ∠a
           ╱
          ╱
     ∠b ╱
    ────╱───────────  line 2
       ╱
```

#### Elements
- Same as corresponding, but ∠a and ∠b are on the same side of the transversal, between the parallel lines
- Labels: "∠a = X°", "∠b（同側内角）= ?"

### 4. Alternate Interior Angles (~200×160)

```
    ─────────╱──────  line 1
            ╱ ∠a
           ╱
          ╱
         ╱
    ────╱───────────  line 2
   ∠b ╱
```

#### Elements
- Same parallel lines + transversal layout
- ∠a and ∠b on opposite sides of transversal, between the lines
- Labels: "∠a = X°", "∠b = ?"

### Data Changes
Add to problem interface:
```typescript
figure: {
  type: "vertical" | "corresponding" | "co-interior" | "alternate";
  givenAngle: number;
}
```

### Notes
- Use consistent transversal angle (~60°) across all variants
- Parallel line markers: small ">" arrows on each line
- Color-code: given angle in blue, unknown in red
- Angle arcs should clearly show which angle is meant
- For vertical angles, no parallel lines needed — just two crossing lines
- Keep layout clean with adequate spacing between the two parallel lines
