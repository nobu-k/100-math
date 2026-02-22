# Grade 9: Similarity (相似)

## Files
- Generator: `src/problems/grade9/similarity.ts`
- Component: `src/problems/grade9/Grade9.tsx`

## Current State
Text-only: "△ABC ∽ △DEF で相似比が 2:3。AB = 6cm のとき DE = ?"

## Proposed Figures

### 1. Similar Triangles — Side/Perimeter/Area (~260×140)

```
    A                    D
   ╱╲                  ╱  ╲
  ╱  ╲               ╱    ╲
 ╱    ╲             ╱      ╲
B──────C           E────────F

  small               large
  ratio a             ratio b
```

#### Elements
- **Two triangles**: `<polygon>` elements, same shape but different sizes
- **Size ratio**: visual sizes reflect the similarity ratio
- **Vertex labels**: "A", "B", "C" on smaller; "D", "E", "F" on larger
- **Known side label**: e.g., "AB = Xcm" on the corresponding side
- **Unknown label**: "DE = ?" on the corresponding side of the other triangle
- **Ratio label**: "相似比 a:b" between the two triangles
- **Corresponding marks**: small tick marks or color matching on corresponding sides

#### Variants
- **Find side**: label one side with value, corresponding side with "?"
- **Find perimeter**: label "周 = Xcm" below small triangle, "周 = ?" below large
- **Find area**: shaded fill with "面積 = Xcm²" and "面積 = ?"

### 2. Parallel Line in Triangle (~200×160)

```
        A
       ╱ ╲
      ╱   ╲
   D ╱─────╲ E     ← DE // BC
    ╱       ╲
   ╱         ╲
  B───────────C
```

#### Elements
- **Triangle ABC**: `<polygon>`
- **Line DE parallel to BC**: `<line>` connecting points on AB and AC
- **Parallel marks**: ">>" marks on DE and BC
- **Segment labels**: "AD = m", "DB = n" along AB; "AE = X" along AC; "EC = ?" along AC
- **Vertex labels**: A, B, C, D, E

### 3. Midpoint Theorem (~200×160)

```
        A
       ╱ ╲
      ╱   ╲
   M ●─────● N     ← M, N are midpoints
    ╱       ╲
   ╱         ╲
  B───────────C
```

#### Elements
- **Triangle ABC**: `<polygon>`
- **Midpoints M and N**: dots on AB and AC respectively
- **Line MN**: `<line>` connecting midpoints
- **Midpoint marks**: equal-length tick marks on AM=MB and AN=NC
- **Labels**: "BC = Xcm", "MN = ?"
- **Vertex labels**: A, B, C, M, N

### Data Changes
Add to problem interface:
```typescript
figure: {
  type: "similar-triangles" | "parallel-line" | "midpoint";
  // For similar-triangles:
  ratioA?: number;
  ratioB?: number;
  knownValue?: number;
  findTarget?: "side" | "perimeter" | "area";
  // For parallel-line:
  m?: number;  // AD ratio part
  n?: number;  // DB ratio part
  ae?: number;
  // For midpoint:
  bc?: number;
}
```

### Notes
- Similar triangles should be drawn with the same angles but different scale
- Place small triangle on left, large on right with some spacing
- Parallel line marks (">>" arrows) on DE and BC to show DE∥BC
- Midpoint marks (equal tick marks) on both halves of each side
- For area problems, use shaded fill to indicate area
- Keep both triangles oriented the same way to emphasize correspondence
