# High School Math Worksheet Implementation Plan

Based on the official 高等学校学習指導要領 (2018 revision), this plan maps each curriculum category to concrete problem generators for the 100-math app.

## Category Overview

| Category | Grade | Topics | Units |
|----------|-------|--------|-------|
| 数学I | 10 | Numbers & Expressions, Trigonometry, Quadratic Functions, Data Analysis | 3 (required) |
| 数学A | 10 | Figure Properties, Counting & Probability, Math & Human Activity | 2 (select 2/3) |
| 数学II | 11 | Various Expressions, Figures & Equations, Exp/Log, Trig Functions, Calculus Intro | 4 |
| 数学B | 11 | Sequences, Statistical Inference, Math & Social Life | 2 (select 2/3) |
| 数学III | 12 | Limits, Differentiation, Integration | 3 |
| 数学C | 12 | Vectors, Curves & Complex Plane, Mathematical Expression | 2 (select 2/3) |

---

## 数学I (Math I) — Grade 10, Required

### I-1. 数と式 (Numbers and Expressions)

#### `math1/irrational-calc` — 無理数の計算
- Simplify expressions with square roots: √12 = 2√3, √18 + √8 = 5√2
- Rationalize denominators: 1/(√3+√2), (√5-1)/√5
- Expand using identities: (√3+√2)², (√5+1)(√5-1)
- **Grade:** 10 | **Problems per page:** 10-12 | **Layout:** 2-column

#### `math1/quadratic-factor` — 展開と因数分解
- Expand: (ax+b)(cx+d) form
- Factor quadratic expressions: x²+5x+6, 2x²-5x-3, x²-9
- Factor by grouping / substitution for multi-variable expressions
- **Grade:** 10 | **Problems per page:** 10-12 | **Layout:** 2-column

#### `math1/linear-inequality` — 一次不等式
- Solve single linear inequalities: 2x-3 > 5, -3x+1 ≤ 7
- Solve systems of linear inequalities
- Word problems modeled with inequalities
- **Grade:** 10 | **Problems per page:** 8-10 | **Layout:** 2-column

#### `math1/sets-logic` — 集合と命題
- Set operations: A∩B, A∪B, complement
- Count elements using inclusion-exclusion
- Identify necessary/sufficient conditions
- True/false of propositions; find counterexamples
- **Grade:** 10 | **Problems per page:** 8-10 | **Layout:** 1-column (text-heavy)

### I-2. 図形と計量 (Figures and Measurement)

#### `math1/trig-ratio` — 三角比
- Compute sin, cos, tan for standard angles (30°, 45°, 60°, 90°, 120°, 135°, 150°)
- Given one ratio, find the others using sin²θ+cos²θ=1
- Extend to obtuse angles: sin(180°-θ), cos(180°-θ)
- **Grade:** 10 | **Problems per page:** 10-12 | **Layout:** 2-column

#### `math1/sine-cosine-law` — 正弦定理・余弦定理
- Apply law of sines: a/sinA = b/sinB = 2R
- Apply law of cosines: a² = b²+c²-2bc·cosA
- Find unknown sides/angles in triangles
- Triangle area: S = ½ab·sinC
- **Grade:** 10 | **Problems per page:** 6-8 | **Layout:** 1-column (diagrams needed)

### I-3. 二次関数 (Quadratic Functions)

#### `math1/quadratic-func` — 二次関数のグラフ
- Convert y=ax²+bx+c to vertex form y=a(x-p)²+q
- Identify vertex, axis of symmetry, direction of opening
- Find max/min on a closed interval [m, n]
- **Grade:** 10 | **Problems per page:** 8-10 | **Layout:** 2-column

#### `math1/quadratic-eq-ineq` — 二次方程式・二次不等式
- Solve quadratic equations (by factoring, completing the square, formula)
- Solve quadratic inequalities: ax²+bx+c > 0 (using graph reasoning)
- Determine number of real solutions (discriminant)
- **Grade:** 10 | **Problems per page:** 8-10 | **Layout:** 2-column

### I-4. データの分析 (Data Analysis)

#### `math1/variance-sd` — 分散・標準偏差
- Compute variance and standard deviation from small datasets
- Interpret scatter plots and correlation coefficients
- Distinguish correlation from causation
- **Grade:** 10 | **Problems per page:** 4-6 | **Layout:** 1-column (tables/charts)

---

## 数学A (Math A) — Grade 10, Elective (pick 2 of 3)

### A-1. 図形の性質 (Properties of Figures)

#### `mathA/triangle-properties` — 三角形の性質
- Angle bisector theorem: internal and external division ratios
- Ceva's theorem and Menelaus' theorem calculations
- Find centroid, incenter, circumcenter given coordinates or lengths
- **Grade:** 10 | **Problems per page:** 6-8 | **Layout:** 1-column (diagrams)

#### `mathA/circle-properties` — 円の性質
- Cyclic quadrilateral angle problems (inscribed angle theorem)
- Tangent-chord angle (alternate segment theorem)
- Power of a point theorem calculations
- **Grade:** 10 | **Problems per page:** 6-8 | **Layout:** 1-column (diagrams)

### A-2. 場合の数と確率 (Counting and Probability)

#### `mathA/permutation-combination` — 順列・組合せ
- Compute nPr and nCr
- Circular permutations, permutations with repetition
- Permutations with identical objects
- Inclusion-exclusion counting
- **Grade:** 10 | **Problems per page:** 10-12 | **Layout:** 2-column

#### `mathA/probability` — 確率
- Basic probability using counting (equally-likely outcomes)
- Complementary events: P(A̅) = 1 - P(A)
- Independent trials (repeated experiments)
- Conditional probability
- Expected value calculations
- **Grade:** 10 | **Problems per page:** 8-10 | **Layout:** 1-column

### A-3. 数学と人間の活動 (Math and Human Activity)

#### `mathA/euclidean-gcd` — ユークリッドの互除法
- Find GCD using the Euclidean algorithm (step-by-step)
- Solve linear Diophantine equations: ax + by = c
- **Grade:** 10 | **Problems per page:** 6-8 | **Layout:** 1-column

#### `mathA/base-conversion` — n進法
- Convert decimal ↔ binary, decimal ↔ other bases
- Arithmetic in binary
- **Grade:** 10 | **Problems per page:** 10-12 | **Layout:** 2-column

---

## 数学II (Math II) — Grade 11

### II-1. いろいろな式 (Various Expressions)

#### `math2/cubic-expand-factor` — 三次式の展開・因数分解
- Cubic expansion: (a+b)³, (a-b)³
- Cubic factoring: a³+b³, a³-b³
- Binomial theorem: find specific coefficients using nCr
- **Grade:** 11 | **Problems per page:** 10-12 | **Layout:** 2-column

#### `math2/complex-number` — 複素数と方程式
- Complex number arithmetic: (2+3i)(1-i), etc.
- Discriminant: classify roots of quadratic equations
- Root-coefficient relationships (Vieta's formulas): sum and product of roots
- Factor theorem → solve cubic/quartic equations
- **Grade:** 11 | **Problems per page:** 8-10 | **Layout:** 2-column

#### `math2/proof-ineq` — 等式・不等式の証明
- Prove equalities using identity methods
- Prove inequalities using AM-GM: (a+b)/2 ≥ √(ab)
- Absolute value inequalities
- **Grade:** 11 | **Problems per page:** 6-8 | **Layout:** 1-column

### II-2. 図形と方程式 (Figures and Equations)

#### `math2/coord-geometry` — 座標幾何
- Internal/external division points
- Distance between two points
- Equations of lines (slope-intercept, general form)
- Distance from a point to a line
- Parallel/perpendicular line conditions
- **Grade:** 11 | **Problems per page:** 8-10 | **Layout:** 2-column

#### `math2/circle-eq` — 円の方程式
- Write equation of a circle (center, radius)
- Positional relationship: circle and line (intersect, tangent, separate)
- Find intersection points
- **Grade:** 11 | **Problems per page:** 8-10 | **Layout:** 2-column

#### `math2/region-ineq` — 領域と不等式
- Shade regions defined by linear inequalities
- Systems of inequalities
- Linear programming (maximize/minimize objective function)
- **Grade:** 11 | **Problems per page:** 4-6 | **Layout:** 1-column (graphs)

### II-3. 指数関数・対数関数 (Exponential and Logarithmic Functions)

#### `math2/exponent` — 指数の拡張
- Simplify expressions with rational exponents: 8^(2/3), 27^(-1/3)
- Compute n-th roots: ³√8, ⁴√16
- Index laws with rational exponents
- **Grade:** 11 | **Problems per page:** 10-12 | **Layout:** 2-column

#### `math2/log-calc` — 対数の計算
- Convert between exponential and logarithmic form
- Apply log properties: log(XY), log(X/Y), log(X^n)
- Solve exponential and logarithmic equations
- Common logarithm calculations (e.g., how many digits in 2^100?)
- **Grade:** 11 | **Problems per page:** 10-12 | **Layout:** 2-column

### II-4. 三角関数 (Trigonometric Functions)

#### `math2/radian` — 弧度法
- Convert degrees ↔ radians
- Arc length and sector area using radians
- **Grade:** 11 | **Problems per page:** 10-12 | **Layout:** 2-column

#### `math2/trig-func` — 三角関数
- Evaluate trig functions at general angles (negative, >360°)
- Addition formulas: sin(α±β), cos(α±β)
- Double angle formulas: sin2θ, cos2θ
- Trig synthesis: a·sinθ + b·cosθ = R·sin(θ+α)
- Solve trigonometric equations
- **Grade:** 11 | **Problems per page:** 8-10 | **Layout:** 2-column

### II-5. 微分・積分の考え (Introduction to Calculus)

#### `math2/derivative-poly` — 多項式の微分
- Differentiate polynomials (up to degree 3)
- Find tangent line equations
- Find intervals of increase/decrease, local max/min
- **Grade:** 11 | **Problems per page:** 8-10 | **Layout:** 2-column

#### `math2/integral-poly` — 多項式の積分
- Compute indefinite integrals of polynomials
- Compute definite integrals
- Area between curve and x-axis, area between two curves
- **Grade:** 11 | **Problems per page:** 8-10 | **Layout:** 2-column

---

## 数学B (Math B) — Grade 11, Elective (pick 2 of 3)

### B-1. 数列 (Sequences)

#### `mathB/arith-geo-seq` — 等差・等比数列
- Find general terms: a_n = a₁ + (n-1)d, a_n = a₁·r^(n-1)
- Compute sums: Sₙ for arithmetic and geometric sequences
- Sigma notation: Σk, Σk², Σ(arithmetic expression)
- **Grade:** 11 | **Problems per page:** 8-10 | **Layout:** 2-column

#### `mathB/recurrence` — 漸化式
- Solve first-order linear recurrences: a_{n+1} = pa_n + q
- Difference sequences: find general term from differences
- **Grade:** 11 | **Problems per page:** 6-8 | **Layout:** 1-column

#### `mathB/math-induction` — 数学的帰納法
- Prove equalities involving n (e.g., 1+2+...+n = n(n+1)/2)
- Prove divisibility properties (e.g., n⁵-n is a multiple of 5)
- **Grade:** 11 | **Problems per page:** 4-6 | **Layout:** 1-column (proof-heavy)

### B-2. 統計的な推測 (Statistical Inference)

#### `mathB/binomial-dist` — 二項分布
- Compute P(X=k) for X~B(n,p)
- Mean np, variance npq, standard deviation √(npq)
- **Grade:** 11 | **Problems per page:** 6-8 | **Layout:** 1-column

#### `mathB/normal-dist` — 正規分布
- Standardize: Z = (X-μ)/σ
- Use standard normal table to find probabilities
- Normal approximation of binomial distribution
- **Grade:** 11 | **Problems per page:** 6-8 | **Layout:** 1-column (tables provided)

#### `mathB/confidence-hypothesis` — 区間推定・仮説検定
- Construct 95%/99% confidence intervals for population mean
- Hypothesis testing: set up H₀/H₁, compute test statistic, compare with significance level
- **Grade:** 11 | **Problems per page:** 4-6 | **Layout:** 1-column

---

## 数学III (Math III) — Grade 12

### III-1. 極限 (Limits)

#### `math3/seq-limit` — 数列の極限
- Compute limits of sequences: lim(n→∞) of rational expressions in n
- Convergence of geometric sequences {r^n}
- Sum of infinite geometric series
- Express repeating decimals as fractions
- **Grade:** 12 | **Problems per page:** 8-10 | **Layout:** 2-column

#### `math3/func-limit` — 関数の極限
- Limits of rational/irrational functions
- Key limit: lim(θ→0) sinθ/θ = 1
- Composite and inverse functions
- **Grade:** 12 | **Problems per page:** 8-10 | **Layout:** 2-column

### III-2. 微分法 (Differentiation)

#### `math3/differentiation` — 微分法
- Product rule, quotient rule, chain rule
- Derivatives of sin, cos, tan, eˣ, ln(x)
- Find tangent lines to various curves
- Increase/decrease, local extrema, inflection points
- **Grade:** 12 | **Problems per page:** 8-10 | **Layout:** 2-column

#### `math3/diff-application` — 微分の応用
- Graph sketching (using first and second derivatives)
- Optimization problems (minimize surface area, maximize volume, etc.)
- Velocity and acceleration from position functions
- **Grade:** 12 | **Problems per page:** 4-6 | **Layout:** 1-column

### III-3. 積分法 (Integration)

#### `math3/integration` — 積分法
- Integrate trig, exponential, logarithmic functions
- Substitution: ax+b=t, x=a·sinθ
- Integration by parts (single application)
- **Grade:** 12 | **Problems per page:** 8-10 | **Layout:** 2-column

#### `math3/integral-application` — 積分の応用
- Area between curves (including parametric curves)
- Volume of revolution: V = π∫{f(x)}²dx
- Arc length of parametric curves
- **Grade:** 12 | **Problems per page:** 4-6 | **Layout:** 1-column

---

## 数学C (Math C) — Grade 12, Elective (pick 2 of 3)

### C-1. ベクトル (Vectors)

#### `mathC/vector-calc` — ベクトルの演算
- Vector addition, subtraction, scalar multiplication (2D)
- Component representation and calculations
- Inner product: a⃗·b⃗ = |a⃗||b⃗|cosθ = a₁b₁+a₂b₂
- Find angle between vectors
- **Grade:** 12 | **Problems per page:** 8-10 | **Layout:** 2-column

#### `mathC/vector-geometry` — ベクトルと図形
- Position vectors: division points, centroids
- Prove geometric properties using vectors
- Extend to 3D space vectors and coordinates
- **Grade:** 12 | **Problems per page:** 6-8 | **Layout:** 1-column

### C-2. 平面上の曲線と複素数平面 (Curves and Complex Plane)

#### `mathC/conic-sections` — 二次曲線
- Equations of parabola (y²=4px), ellipse (x²/a²+y²/b²=1), hyperbola (x²/a²-y²/b²=1)
- Find foci, directrix, asymptotes
- **Grade:** 12 | **Problems per page:** 6-8 | **Layout:** 1-column (graphs)

#### `mathC/complex-plane` — 複素数平面
- Plot complex numbers; modulus and argument
- Polar form arithmetic: multiplication = rotate + scale
- De Moivre's theorem: (cosθ+i·sinθ)^n = cos(nθ)+i·sin(nθ)
- Find nth roots of unity
- **Grade:** 12 | **Problems per page:** 8-10 | **Layout:** 2-column

#### `mathC/parametric-polar` — 媒介変数・極座標
- Parametric representations of curves (cycloid, etc.)
- Convert Cartesian ↔ polar coordinates
- Polar equations of curves
- **Grade:** 12 | **Problems per page:** 6-8 | **Layout:** 1-column

### C-3. 数学的な表現の工夫 (Mathematical Expression)

This topic is primarily project-based (Pareto charts, bubble charts, discrete graphs, matrices) and less suited for auto-generated drill worksheets. **Deprioritize for implementation.**

---

## Implementation Priority

Prioritize topics that are:
1. **Computation-heavy** (can auto-generate and auto-check)
2. **High exam relevance** (commonly tested in university entrance exams)
3. **Applicable to many students** (required courses first)

### Phase 1 — Core (数学I, required for all)
1. `math1/quadratic-factor` — 展開と因数分解
2. `math1/irrational-calc` — 無理数の計算
3. `math1/linear-inequality` — 一次不等式
4. `math1/trig-ratio` — 三角比
5. `math1/quadratic-func` — 二次関数
6. `math1/quadratic-eq-ineq` — 二次方程式・二次不等式

### Phase 2 — Common Electives (数学A)
7. `mathA/permutation-combination` — 順列・組合せ
8. `mathA/probability` — 確率
9. `mathA/euclidean-gcd` — ユークリッドの互除法
10. `mathA/base-conversion` — n進法

### Phase 3 — Advanced Required (数学II core)
11. `math2/cubic-expand-factor` — 三次式の展開・因数分解
12. `math2/complex-number` — 複素数と方程式
13. `math2/exponent` — 指数の拡張
14. `math2/log-calc` — 対数の計算
15. `math2/radian` — 弧度法
16. `math2/trig-func` — 三角関数
17. `math2/derivative-poly` — 多項式の微分
18. `math2/integral-poly` — 多項式の積分
19. `math2/coord-geometry` — 座標幾何

### Phase 4 — Sequences & Statistics (数学B)
20. `mathB/arith-geo-seq` — 等差・等比数列
21. `mathB/binomial-dist` — 二項分布
22. `mathB/normal-dist` — 正規分布

### Phase 5 — Advanced (数学III, 数学C)
23. `math3/seq-limit` — 数列の極限
24. `math3/differentiation` — 微分法
25. `math3/integration` — 積分法
26. `mathC/vector-calc` — ベクトルの演算
27. `mathC/complex-plane` — 複素数平面

### Deprioritized (proof-heavy, diagram-heavy, or project-based)
- `math1/sets-logic` — hard to auto-grade proofs
- `math1/sine-cosine-law` — requires triangle diagrams
- `math1/variance-sd` — needs data tables
- `mathA/triangle-properties` — needs geometric diagrams
- `mathA/circle-properties` — needs geometric diagrams
- `math2/proof-ineq` — proof-based
- `math2/region-ineq` — needs graphing
- `math2/circle-eq` — needs diagrams
- `mathB/recurrence` — moderate; could do fill-in-the-blank
- `mathB/math-induction` — proof-based
- `mathB/confidence-hypothesis` — needs normal tables
- `math3/diff-application` — word problems
- `math3/integral-application` — needs diagrams
- `mathC/vector-geometry` — proof-based
- `mathC/conic-sections` — needs graphs
- `mathC/parametric-polar` — needs graphs
- `mathC/C-3` — project-based

---

## App Structure

### Group and Route Layout

```
src/problems/
  math1/           # 数学I group
  mathA/           # 数学A group
  math2/           # 数学II group
  mathB/           # 数学B group
  math3/           # 数学III group
  mathC/           # 数学C group
```

### Sidebar Categories

Add a new grade range for high school:

| Sidebar Label | Grade | Category |
|---|---|---|
| 高1 (数I) | 10 | math1/* |
| 高1 (数A) | 10 | mathA/* |
| 高2 (数II) | 11 | math2/* |
| 高2 (数B) | 11 | mathB/* |
| 高3 (数III) | 12 | math3/* |
| 高3 (数C) | 12 | mathC/* |

### KaTeX Requirements

High school math heavily uses KaTeX for rendering. The existing `<M>` component should suffice, but verify support for:
- Fractions: `\frac{a}{b}`
- Square roots: `\sqrt{x}`, `\sqrt[3]{x}`
- Subscripts/superscripts: `a_n`, `x^2`
- Greek letters: `\alpha`, `\beta`, `\theta`
- Summation: `\sum_{k=1}^{n}`
- Integrals: `\int_a^b f(x)\,dx`
- Limits: `\lim_{x \to 0}`
- Matrices: `\begin{pmatrix} a & b \\ c & d \end{pmatrix}`
- Vectors: `\vec{a}`
