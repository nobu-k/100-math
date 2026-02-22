# Geometry Figure Plans

Plans for adding SVG figures to geometry problems. Each file describes what figures to add for a specific problem type.

## Implementation Pattern

Follow existing SVG figure patterns in the codebase. Reference implementations:
- Bar graph: `src/problems/grade3/bar-graph.ts` + `Grade3.tsx` (`renderBarChart`)
- Line graph: `src/problems/grade4/line-graph.ts` + `Grade4.tsx`
- Clock: `src/problems/grade1/clock.ts` + `Grade1.tsx`

### Data flow
1. **Generator** returns pure data objects (not SVG). Add a `figure` field to the problem interface with shape-specific properties (dimensions, labels, type variant).
2. **React component** renders inline `<svg>` elements using a helper function (e.g., `renderBarChart(bp)`).

### Rendering structure
```tsx
// In the component's renderProblems() switch case:
case "problem-type":
  return (
    <div className="dev-text-page">
      {problems.map((p, idx) => (
        <div key={idx} className="dev-prop-block">
          <div className="dev-prop-label">({idx + 1}) ...</div>
          {renderFigure(p)}              {/* SVG goes here */}
          <div style={{ marginTop: 8 }}>
            {/* question + answer rows */}
            <div className="dev-text-row">
              <span className="dev-text-q">{p.question}</span>
              <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                {p.answer}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
```

### SVG conventions
- Use `<svg width={W} height={H} viewBox="0 0 W H" style={{ display: "block", margin: "8px 0" }}>`
- Axis/outline strokes: `#333`, grid lines: `#ddd`
- Font sizes: 9-10px for labels
- Dashed hidden edges: `strokeDasharray="4 3"`
- Known values in black, unknowns highlighted (red or dashed)

## Problems by Priority

### Critical (figures essential for understanding)
- [grade5-area-formula.md](grade5-area-formula.md) — Triangle, parallelogram, trapezoid
- [grade6-prism-volume.md](grade6-prism-volume.md) — Triangular prism, cylinder
- [grade7-coordinate.md](grade7-coordinate.md) — Coordinate plane, quadrants
- [grade7-sector.md](grade7-sector.md) — Arc length and sector area
- [grade7-solid-volume.md](grade7-solid-volume.md) — Cylinder, cone, sphere, prism
- [grade8-parallel-angle.md](grade8-parallel-angle.md) — Parallel lines with transversal
- [grade9-circle-angle.md](grade9-circle-angle.md) — Central and inscribed angles
- [grade9-pythagorean.md](grade9-pythagorean.md) — Right triangles
- [grade9-similarity.md](grade9-similarity.md) — Similar triangles, parallel lines in triangles

### High (figures significantly improve comprehension)
- [grade3-circle-rd.md](grade3-circle-rd.md) — Circle with radius/diameter
- [grade4-area.md](grade4-area.md) — Rectangle and square areas
- [grade5-circumference.md](grade5-circumference.md) — Circle circumference
- [grade5-volume.md](grade5-volume.md) — Cube and rectangular prism
- [grade6-circle-area.md](grade6-circle-area.md) — Circle and semicircle area

### Medium (figures helpful but problems are understandable without them)
- [grade4-angle.md](grade4-angle.md) — Basic angle arithmetic
- [grade8-triangle-angle.md](grade8-triangle-angle.md) — Triangle interior/exterior angles
- [grade8-polygon-angle.md](grade8-polygon-angle.md) — Polygon angle sums
- [grade8-parallelogram.md](grade8-parallelogram.md) — Parallelogram properties
