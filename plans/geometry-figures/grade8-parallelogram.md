# Grade 8: Parallelogram Properties (平行四辺形)

## Files
- Generator: `src/problems/grade8/parallelogram.ts`
- Component: `src/problems/grade8/Grade8.tsx`

## Current State
Text-only: "平行四辺形ABCDで AB = 8cm のとき CD = ?"

## Proposed Figures

### 1. Side Properties (~220×140)

```
    A ─────────────── D
   ╱                 ╱
  ╱    AB = Xcm     ╱
 ╱                 ╱
B ─────────────── C
```

#### Elements
- **Parallelogram**: `<polygon>` with 4 vertices (slight lean for parallelogram look)
- **Vertex labels**: "A", "B", "C", "D" at corners
- **Side labels**: known side labeled with value, unknown with "?"
- **Equal marks**: tick marks on opposite sides to show equality
- **Parallel marks**: arrows on parallel sides

### 2. Angle Properties (~220×140)

```
    A ─────────────── D
   ╱ ∠A              ╱
  ╱                  ╱
 ╱              ∠C  ╱
B ─────────────── C
```

#### Elements
- **Parallelogram**: same shape as above
- **Angle arcs**: at relevant vertices
- **Known angle**: arc with degree label
- **Unknown angle**: arc with "?"
- **Vertex labels**: "A", "B", "C", "D"

### 3. Diagonal Properties (~220×140)

```
    A ─────────────── D
   ╱ ╲             ╱ ╱
  ╱   ╲    O      ╱ ╱
 ╱     ╲  ●     ╱  ╱
╱       ╲     ╱   ╱
B ─────────────── C
```

#### Elements
- **Parallelogram**: same shape
- **Both diagonals**: `<line>` elements AC and BD
- **Intersection point**: dot labeled "O"
- **Known segment**: e.g., "AO = Xcm" with label
- **Unknown segment**: "AC = ?" with label
- **Equal marks**: tick marks on AO=OC and BO=OD halves

### Data Changes
Add to problem interface:
```typescript
figure: {
  type: "sides" | "angles" | "diagonals";
  // For sides:
  ab?: number;
  bc?: number;
  // For angles:
  angleA?: number;
  targetVertex?: "B" | "C" | "D";
  // For diagonals:
  ao?: number;
  bo?: number;
  targetDiagonal?: "AC" | "BD";
}
```

### Notes
- Consistent parallelogram shape: slant ~20° from vertical
- Vertex order ABCD counterclockwise: A=top-left, B=bottom-left, C=bottom-right, D=top-right
- Parallel marks (">>" arrows) on AB∥CD and AD∥BC
- Equal-length marks (tick marks) on known equal sides/segments
- For perimeter problems, label both AB and BC with values
