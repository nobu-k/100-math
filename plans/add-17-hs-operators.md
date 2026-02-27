# Add 17 missing high school math operators

## Context

The plan file `plans/highschool-math.md` (based on 高等学校学習指導要領) specifies operators for all curriculum topics. Currently 40 operators are implemented across Math I/A/II/B/III/C. 17 operators from the plan are missing. This plan adds all 17.

## Current state: 40 operators

- **Math I (6):** irrational-calc, quadratic-factor, quadratic-func, linear-inequality, quadratic-eq-ineq, trig-ratio
- **Math A (4):** permutation-combination, probability, euclidean-gcd, base-conversion
- **Math II (16):** cubic-expand-factor, complex-number, exponent, log-calc, radian, general-angle, addition-formula, double-angle, trig-synthesis, derivative-poly, tangent-line, integral-poly, point-distance, section-point, line-equation, point-line-distance
- **Math B (5):** arithmetic-seq, geometric-seq, sigma-sum, binomial-dist, normal-dist
- **Math III (7):** seq-limit, product-quotient-diff, chain-rule-diff, basic-derivative, basic-integral, substitution-integral, by-parts-integral
- **Math C (2):** vector-calc, complex-plane

## 17 missing operators

### Math I (+3)

#### 1. `math1/sets-logic` — 集合と命題
- **Category:** hs-expr, **Subcategory:** 数と式
- **Problem types (isNL):**
  - Set operations: Given A={1,2,3,5,7}, B={2,4,5,6,8}, find A∩B, A∪B, complement
  - Inclusion-exclusion: |A∪B| = |A| + |B| − |A∩B|. Given |A|, |B|, |A∩B|, find |A∪B|
  - Necessary/sufficient: "x²=4 ⇒ x=2 は真か偽か" (true/false + counterexample)
- **No mode select** — mixed problems, no settings panel

#### 2. `math1/sine-cosine-law` — 正弦定理・余弦定理
- **Category:** hs-trig, **Subcategory:** 図形と計量
- **Problem types (isNL):**
  - Law of sines: a/sinA = 2R. Given a, A, find R or given A, B, a, find b
  - Law of cosines: c² = a²+b²−2ab·cosC. Given a, b, C, find c
  - Triangle area: S = ½ab·sinC
- **Mode select:** `"sine-law" | "cosine-law" | "area" | "mixed"`
- Use Pythagorean triples + standard angles (30°, 45°, 60°, 90°, 120°) for clean answers
- Import `STANDARD_ANGLES` from `../shared/trig-utils`

#### 3. `math1/variance-sd` — 分散・標準偏差
- **Category:** hs-data, **Subcategory:** データの分析
- **Problem types (isNL):**
  - Given 5-8 data values, compute: mean, variance, standard deviation
  - Given frequency table, compute weighted mean/variance
  - Correlation: given two datasets, determine if positively/negatively correlated (qualitative)
- **No mode select** — all problems compute statistics from data
- Generate small integer datasets where variance comes out clean (integer or simple fraction)

### Math A (+2)

#### 4. `mathA/triangle-properties` — 三角形の性質
- **Category:** hs-geometry, **Subcategory:** 図形の性質
- **Problem types (isNL):**
  - Angle bisector theorem: BD bisects ∠B, AB=m, BC=n → AD:DC = m:n
  - Menelaus' theorem: given 2 of 3 ratios on transversal, find the third
  - Centroid/incenter/circumcenter: given triangle vertices, find special point coordinates
- **No mode select**
- Keep problems numerical (given side lengths, compute ratios/coordinates)

#### 5. `mathA/circle-properties` — 円の性質
- **Category:** hs-geometry, **Subcategory:** 図形の性質
- **Problem types (isNL):**
  - Inscribed angle theorem: arc = 2×inscribed angle. Given arc, find angle (or vice versa)
  - Power of a point: PA·PB = PC·PD. Given 3 values, find the 4th
  - Tangent-chord angle: angle = ½ arc. Given arc, find angle
- **No mode select**
- All numeric, no diagrams needed

### Math II (+3)

#### 6. `math2/proof-ineq` — 等式・不等式の証明
- **Category:** hs-expr, **Subcategory:** 式と証明
- **Problem types (isNL):**
  - AM-GM application: "a>0, b>0, a+b=S のとき ab の最大値" → S²/4
  - Cauchy-Schwarz numerical: verify (a²+b²)(c²+d²) ≥ (ac+bd)² for given values
  - Verify identity: compute both sides of an equality for given values
  - Optimization: "x>0 のとき x + 1/x の最小値" → 2 (AM-GM)
- **No mode select**
- Frame as computation ("求めよ") rather than proof ("証明せよ")

#### 7. `math2/circle-eq` — 円の方程式
- **Category:** hs-geometry, **Subcategory:** 図形と方程式
- **Problem types (isNL):**
  - Standard form: center (a,b), radius r → write equation
  - General form → standard form: x²+y²+Dx+Ey+F=0 → find center and radius
  - Line-circle intersection: count intersection points (discriminant), find intersection coordinates
  - Tangent line to circle from external point
- **Mode select:** `"standard" | "general" | "intersection" | "mixed"`

#### 8. `math2/region-ineq` — 領域と不等式
- **Category:** hs-geometry, **Subcategory:** 図形と方程式
- **Problem types (isNL):**
  - Point membership: "点 (2,3) は y > 2x − 1 を満たすか"
  - Linear programming: maximize/minimize ax+by subject to linear constraints
  - Region description: "x²+y²≤4 かつ y≥0 を満たす領域の面積"
- **No mode select**

### Math B (+3)

#### 9. `mathB/recurrence` — 漸化式
- **Category:** hs-sequence, **Subcategory:** 数列
- **Problem types (isNL):**
  - Compute terms: a₁=2, aₙ₊₁=3aₙ−1. Find a₂, a₃, a₄
  - Find general term: aₙ₊₁=paₙ+q type (characteristic equation method)
  - Fibonacci-type: aₙ₊₂=aₙ₊₁+aₙ, compute specific terms
- **No mode select**
- Helpers: `fmt()`, `subscript()` duplicated from arith-geo-seq

#### 10. `mathB/math-induction` — 数学的帰納法
- **Category:** hs-sequence, **Subcategory:** 数列
- **Problem types (isNL):**
  - Fill-in base case: "n=1 のとき，左辺 = ?, 右辺 = ?"
  - Fill-in inductive step: "n=k で成立を仮定. n=k+1 のとき左辺 − 右辺 = ?"
  - Divisibility: "5ⁿ−1 は 4 の倍数. n=1 → ?, n=k+1 → 5^(k+1)−1 = 5·(5ᵏ−1)+?"
- **No mode select**
- Structured as computation fill-in, not full proofs

#### 11. `mathB/confidence-hypothesis` — 区間推定・仮説検定
- **Category:** hs-statistics, **Subcategory:** 統計的な推測
- **Problem types (isNL):**
  - Confidence interval: n, x̄, σ given + z-value provided → compute interval
  - Hypothesis test: compute z-statistic, compare with critical value
  - Sample size: determine minimum n for given margin of error
- **Mode select:** `"confidence" | "hypothesis" | "mixed"`
- Provide z-values in problem text (z₀.₀₂₅=1.96, z₀.₀₀₅=2.576)

### Math III (+3)

#### 12. `math3/func-limit` — 関数の極限
- **Category:** hs-sequence, **Subcategory:** 極限
- **Problem types:**
  - Rational: lim(x→a) (x²−a²)/(x−a) (factor and cancel)
  - Indeterminate: lim(x→∞) (polynomial)/(polynomial) (divide by highest power)
  - Special: lim(x→0) sin(ax)/bx = a/b, lim(x→0) (eˣ−1)/x = 1
- **No mode select**
- Similar structure to seq-limit but for functions of x

#### 13. `math3/diff-application` — 微分の応用
- **Category:** hs-diff, **Subcategory:** 微分法
- **Problem types (isNL):**
  - Graph analysis: f(x)=polynomial → find intervals of increase/decrease, inflection points
  - Optimization: "Surface area S fixed. Maximize volume of open-top box"
  - Velocity/acceleration: x(t)=t³−6t²+9t → find v(2), a(2)
- **No mode select**
- Uses `polyDeriv`, `polyEval`, `formatPoly` from `../shared/poly-utils`

#### 14. `math3/integral-application` — 積分の応用
- **Category:** hs-integral, **Subcategory:** 積分法
- **Problem types (isNL):**
  - Area between curves: ∫(f(x)−g(x))dx for polynomial/trig curves
  - Volume of revolution: V = π∫f(x)²dx (rotate around x-axis)
  - Volume with known cross-section
- **Mode select:** `"area" | "volume" | "mixed"`
- Use polynomials that integrate to clean values. For volume, use functions like y=x², y=√x.

### Math C (+3)

#### 15. `mathC/vector-geometry` — ベクトルと図形
- **Category:** hs-geometry, **Subcategory:** ベクトル
- **Problem types (isNL):**
  - Position vectors: centroid G = (A+B+C)/3
  - Internal division: P = (nA+mB)/(m+n)
  - 3D vectors: dot product, cross product magnitude, distance
  - Collinearity: show three points are collinear using vectors
- **No mode select**
- Uses `fmt()` helper for negative numbers

#### 16. `mathC/conic-sections` — 二次曲線
- **Category:** hs-geometry, **Subcategory:** 平面上の曲線
- **Problem types (isNL):**
  - Parabola: y²=4px → find focus (p,0), directrix x=−p
  - Ellipse: x²/a²+y²/b²=1 → find foci (±c,0) where c²=a²−b²
  - Hyperbola: x²/a²−y²/b²=1 → find foci, asymptotes y=±(b/a)x
  - Eccentricity: e=c/a
- **Mode select:** `"parabola" | "ellipse" | "hyperbola" | "mixed"`

#### 17. `mathC/parametric-polar` — 媒介変数・極座標
- **Category:** hs-geometry, **Subcategory:** 平面上の曲線
- **Problem types:**
  - Cartesian → polar: (x,y) → (r,θ) using r=√(x²+y²), θ=atan2(y,x)
  - Polar → Cartesian: (r,θ) → (r·cosθ, r·sinθ)
  - Parametric → Cartesian: eliminate parameter t from x=f(t), y=g(t)
  - Polar equation identification: r=2cosθ → circle
- **No mode select**
- Use standard angles for clean answers. Import `STANDARD_ANGLES`.

---

## File changes summary

### Create: 34 files (17 generators + 17 components)

| # | Generator | Component | Group file |
|---|-----------|-----------|------------|
| 1 | `math1/sets-logic.ts` | `math1/SetsLogic.tsx` | Math1.tsx |
| 2 | `math1/sine-cosine-law.ts` | `math1/SineCosineLaw.tsx` | Math1.tsx |
| 3 | `math1/variance-sd.ts` | `math1/VarianceSd.tsx` | Math1.tsx |
| 4 | `mathA/triangle-properties.ts` | `mathA/TriangleProperties.tsx` | MathA.tsx |
| 5 | `mathA/circle-properties.ts` | `mathA/CircleProperties.tsx` | MathA.tsx |
| 6 | `math2/proof-ineq.ts` | `math2/ProofIneq.tsx` | Math2.tsx |
| 7 | `math2/circle-eq.ts` | `math2/CircleEq.tsx` | Math2.tsx |
| 8 | `math2/region-ineq.ts` | `math2/RegionIneq.tsx` | Math2.tsx |
| 9 | `mathB/recurrence.ts` | `mathB/Recurrence.tsx` | MathB.tsx |
| 10 | `mathB/math-induction.ts` | `mathB/MathInduction.tsx` | MathB.tsx |
| 11 | `mathB/confidence-hypothesis.ts` | `mathB/ConfidenceHypothesis.tsx` | MathB.tsx |
| 12 | `math3/func-limit.ts` | `math3/FuncLimit.tsx` | Math3.tsx |
| 13 | `math3/diff-application.ts` | `math3/DiffApplication.tsx` | Math3.tsx |
| 14 | `math3/integral-application.ts` | `math3/IntegralApplication.tsx` | Math3.tsx |
| 15 | `mathC/vector-geometry.ts` | `mathC/VectorGeometry.tsx` | MathC.tsx |
| 16 | `mathC/conic-sections.ts` | `mathC/ConicSections.tsx` | MathC.tsx |
| 17 | `mathC/parametric-polar.ts` | `mathC/ParametricPolar.tsx` | MathC.tsx |

### Modify: 6 group files

- `src/problems/Math1.tsx` — add 3 operators (sets-logic, sine-cosine-law, variance-sd)
- `src/problems/MathA.tsx` — add 2 operators (triangle-properties, circle-properties)
- `src/problems/Math2.tsx` — add 3 operators (proof-ineq, circle-eq, region-ineq)
- `src/problems/MathB.tsx` — add 3 operators (recurrence, math-induction, confidence-hypothesis)
- `src/problems/Math3.tsx` — add 3 operators (func-limit, diff-application, integral-application)
- `src/problems/MathC.tsx` — add 3 operators (vector-geometry, conic-sections, parametric-polar)

---

## Component patterns

**Operators with mode select (5):** sine-cosine-law, circle-eq, confidence-hypothesis, conic-sections, integral-application
→ Use standard mode select pattern with `parseEnum`, `useState`, `regen()`

**Operators without mode select (12):** All others
→ Use simple pattern: `useProblemPage([], () => ({}))`, `settingsPanel={null}`

**All generators** follow the standard pattern:
- `generate(seed, [mode,] count=10)` → `Problem[]`
- `mulberry32(seed)` PRNG
- 40-attempt retry loop with `Set<string>` deduplication
- Return `{ expr, answerExpr, isNL? }` interface

---

## Implementation order

1. **Math I** — sets-logic, sine-cosine-law, variance-sd (3 operators, 6 files)
2. **Math A** — triangle-properties, circle-properties (2 operators, 4 files)
3. **Math II** — proof-ineq, circle-eq, region-ineq (3 operators, 6 files)
4. **Math B** — recurrence, math-induction, confidence-hypothesis (3 operators, 6 files)
5. **Math III** — func-limit, diff-application, integral-application (3 operators, 6 files)
6. **Math C** — vector-geometry, conic-sections, parametric-polar (3 operators, 6 files)
7. **Update group files** — Math1.tsx, MathA.tsx, Math2.tsx, MathB.tsx, Math3.tsx, MathC.tsx

## Verification

1. `npm run check` — TypeScript compiles
2. `npm test` — all tests pass
3. Verify each new operator appears in navigation and renders problems
