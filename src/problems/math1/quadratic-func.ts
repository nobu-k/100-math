import { mulberry32 } from "../random";

export type QuadraticFuncMode = "vertex-form" | "max-min" | "mixed";

export interface QuadraticFuncProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateQuadraticFunc = (
  seed: number,
  mode: QuadraticFuncMode = "mixed",
  count = 8,
): QuadraticFuncProblem[] => {
  const rng = mulberry32(seed);
  const problems: QuadraticFuncProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      const result = pick === "vertex-form"
        ? generateVertexForm(rng)
        : generateMaxMinGeneral(rng);

      if (!result) continue;

      const key = result.expr;
      if (!seen.has(key) || attempt === 39) {
        seen.add(key);
        problems.push(result);
        break;
      }
    }
  }
  return problems;
};

/* ================================================================
   Mode selection
   ================================================================ */

const pickMode = (
  rng: () => number,
  mode: QuadraticFuncMode,
): "vertex-form" | "max-min" => {
  if (mode !== "mixed") return mode;
  return rng() < 0.55 ? "vertex-form" : "max-min";
};

/* ================================================================
   Vertex-form mode: convert y=ax²+bx+c to y=a(x−p)²+q
   ================================================================ */

const generateVertexForm = (rng: () => number): QuadraticFuncProblem | null => {
  const aChoices = [-3, -2, -1, 1, 2, 3];
  const a = aChoices[Math.floor(rng() * aChoices.length)];
  const p = Math.floor(rng() * 9) - 4; // [-4..4]
  const q = Math.floor(rng() * 13) - 6; // [-6..6]

  // Expand: y = a(x-p)² + q = ax² - 2apx + ap² + q
  const b = -2 * a * p;
  const c = a * p * p + q;

  const expr = `y = ${formatQuadratic(a, b, c)} を平方完成し，頂点を求めよ`;
  const vertexForm = formatVertexForm(a, p, q);
  const answerExpr = `${vertexForm}　頂点 (${formatSigned(p)}, ${formatSigned(q)})`;

  return { expr, answerExpr, isNL: true };
};

/* ================================================================
   Max-min mode: find max/min on a domain (bounded or unbounded)
   ================================================================ */

type DomainType = "closed" | "open" | "closedOpen" | "openClosed" | "unbounded";

const DOMAIN_TYPES: DomainType[] = ["closed", "open", "closedOpen", "openClosed", "unbounded"];

interface Extrema {
  hasMax: boolean;
  maxVal: number;
  maxX?: number;
  hasMin: boolean;
  minVal: number;
  minX?: number;
}

const generateMaxMinGeneral = (rng: () => number): QuadraticFuncProblem | null => {
  const aChoices = [-2, -1, 1, 2];
  const a = aChoices[Math.floor(rng() * aChoices.length)];
  const p = Math.floor(rng() * 7) - 3; // [-3..3]
  const q = Math.floor(rng() * 9) - 4; // [-4..4]

  const domainType = DOMAIN_TYPES[Math.floor(rng() * DOMAIN_TYPES.length)];

  const b = -2 * a * p;
  const c = a * p * p + q;

  if (domainType === "unbounded") {
    const expr = `y = ${formatQuadratic(a, b, c)} の最大値と最小値`;
    const answerExpr = a > 0
      ? `最小値 ${formatSigned(q)}（x = ${formatSigned(p)}），最大値はなし`
      : `最大値 ${formatSigned(q)}（x = ${formatSigned(p)}），最小値はなし`;
    return { expr, answerExpr, isNL: true };
  }

  const leftClosed = domainType === "closed" || domainType === "closedOpen";
  const rightClosed = domainType === "closed" || domainType === "openClosed";
  const { m, n } = pickDomainEndpoints(rng, p, leftClosed, rightClosed);

  const extrema = computeExtrema(a, p, q, m, n, leftClosed, rightClosed);

  const domainStr = formatDomain(m, n, leftClosed, rightClosed);
  const expr = `y = ${formatQuadratic(a, b, c)}（${domainStr}）の最大値と最小値`;
  const answerExpr = formatExtremaAnswer(extrema);

  return { expr, answerExpr, isNL: true };
};

const pickDomainEndpoints = (
  rng: () => number,
  p: number,
  leftClosed: boolean,
  rightClosed: boolean,
): { m: number; n: number } => {
  const bothClosed = leftClosed && rightClosed;
  // For non-closed domains, bias toward "inside" (50%) since that's where
  // interesting cases occur (both extrema can exist on half-open intervals).
  const posType = !bothClosed && rng() < 0.5
    ? 2
    : Math.floor(rng() * 5);
  const len = Math.floor(rng() * 4) + 2; // [2..5]

  switch (posType) {
    case 0: { // left: p < m
      const m = p + 1 + Math.floor(rng() * 3);
      return { m, n: m + len };
    }
    case 1: { // at_m: p = m
      return { m: p, n: p + len };
    }
    case 2: { // inside: m < p < n
      const offset = pickInsideOffset(rng, len, leftClosed, rightClosed);
      const m = p - offset;
      return { m, n: m + len };
    }
    case 3: { // at_n: p = n
      return { m: p - len, n: p };
    }
    default: { // right: p > n
      const n = p - 1 - Math.floor(rng() * 3);
      return { m: n - len, n };
    }
  }
};

/** Pick offset for vertex-inside position.
 *  For half-open domains, bias so the closed endpoint is farther from vertex
 *  ~60% of the time — this guarantees both max and min exist (the closed
 *  endpoint achieves the sup/inf while the vertex achieves the other). */
const pickInsideOffset = (
  rng: () => number,
  len: number,
  leftClosed: boolean,
  rightClosed: boolean,
): number => {
  const maxOff = Math.min(3, len - 1);
  const halfOpen = leftClosed !== rightClosed;
  if (halfOpen && rng() < 0.6) {
    // offset = distance from vertex to left endpoint m
    // len - offset = distance from vertex to right endpoint n
    // leftClosed: want offset > len/2  (m is farther → f(m) is the extreme)
    // rightClosed: want offset < len/2  (n is farther → f(n) is the extreme)
    if (leftClosed) {
      // Large offset: ceil(len/2) .. maxOff
      const lo = Math.ceil(len / 2);
      if (lo <= maxOff) return lo + Math.floor(rng() * (maxOff - lo + 1));
    } else {
      // Small offset: 1 .. floor(len/2 - 1), at least 1
      const hi = Math.max(1, Math.floor(len / 2) - 1);
      return 1 + Math.floor(rng() * hi);
    }
  }
  return 1 + Math.floor(rng() * maxOff);
};

export const computeExtrema = (
  a: number,
  p: number,
  q: number,
  m: number,
  n: number,
  leftClosed: boolean,
  rightClosed: boolean,
): Extrema => {
  const f = (x: number) => a * (x - p) * (x - p) + q;
  const fm = f(m);
  const fn = f(n);

  // Candidate values for sup/inf
  const vertexInClosure = m <= p && p <= n;
  const candidates = [fm, fn];
  if (vertexInClosure) candidates.push(q);
  const sup = Math.max(...candidates);
  const inf = Math.min(...candidates);

  // Attainable points
  const attainable: { x: number; y: number }[] = [];
  if (leftClosed) attainable.push({ x: m, y: fm });
  if (rightClosed) attainable.push({ x: n, y: fn });
  const vertexAttainable =
    (m < p && p < n) ||
    (p === m && leftClosed) ||
    (p === n && rightClosed);
  if (vertexAttainable) attainable.push({ x: p, y: q });

  const maxMatch = attainable.find((pt) => pt.y === sup);
  const minMatch = attainable.find((pt) => pt.y === inf);

  return {
    hasMax: !!maxMatch,
    maxVal: sup,
    maxX: maxMatch?.x,
    hasMin: !!minMatch,
    minVal: inf,
    minX: minMatch?.x,
  };
};

const formatDomain = (
  m: number,
  n: number,
  leftClosed: boolean,
  rightClosed: boolean,
): string => {
  const leftOp = leftClosed ? "≤" : "<";
  const rightOp = rightClosed ? "≤" : "<";
  return `${formatSigned(m)} ${leftOp} x ${rightOp} ${formatSigned(n)}`;
};

const formatExtremaAnswer = (e: Extrema): string => {
  const parts: string[] = [];
  if (e.hasMax) {
    parts.push(`最大値 ${formatSigned(e.maxVal)}（x = ${formatSigned(e.maxX!)}）`);
  } else {
    parts.push("最大値はなし");
  }
  if (e.hasMin) {
    parts.push(`最小値 ${formatSigned(e.minVal)}（x = ${formatSigned(e.minX!)}）`);
  } else {
    parts.push("最小値はなし");
  }
  return parts.join("，");
};

/* ================================================================
   Formatting helpers
   ================================================================ */

/** Format ax² + bx + c as Unicode string */
const formatQuadratic = (a: number, b: number, c: number): string => {
  const parts: string[] = [];

  // x² term
  if (a !== 0) {
    if (a === 1) parts.push("x²");
    else if (a === -1) parts.push("−x²");
    else parts.push(`${a}x²`);
  }

  // x term
  if (b !== 0) {
    if (parts.length === 0) {
      if (b === 1) parts.push("x");
      else if (b === -1) parts.push("−x");
      else parts.push(`${b}x`);
    } else {
      if (b === 1) parts.push("+ x");
      else if (b === -1) parts.push("− x");
      else if (b > 0) parts.push(`+ ${b}x`);
      else parts.push(`− ${Math.abs(b)}x`);
    }
  }

  // constant term
  if (c !== 0) {
    if (parts.length === 0) parts.push(`${c}`);
    else if (c > 0) parts.push(`+ ${c}`);
    else parts.push(`− ${Math.abs(c)}`);
  }

  if (parts.length === 0) return "0";
  return parts.join(" ");
};

/** Format a(x − p)² + q as Unicode string */
const formatVertexForm = (a: number, p: number, q: number): string => {
  // a(x − p)² part
  let aStr: string;
  if (a === 1) aStr = "";
  else if (a === -1) aStr = "−";
  else aStr = `${a}`;

  let inner: string;
  if (p === 0) inner = "x";
  else if (p > 0) inner = `x − ${p}`;
  else inner = `x + ${Math.abs(p)}`;

  let base = `${aStr}(${inner})²`;

  // + q part
  if (q === 0) return `y = ${base}`;
  if (q > 0) return `y = ${base} + ${q}`;
  return `y = ${base} − ${Math.abs(q)}`;
};

/** Format a number for display, showing negative sign with − */
const formatSigned = (n: number): string => {
  if (n < 0) return `−${Math.abs(n)}`;
  return `${n}`;
};
