import { mulberry32 } from "../random";

export type QuadraticFuncMode = "vertex-form" | "max-min" | "mixed";

export interface QuadraticFuncProblem {
  expr: string;
  answerExpr: string;
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
        : generateMaxMin(rng);

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

  const expr = `y = ${formatQuadratic(a, b, c)}`;
  const vertexForm = formatVertexForm(a, p, q);
  const answerExpr = `${vertexForm}　頂点 (${formatSigned(p)}, ${formatSigned(q)})`;

  return { expr, answerExpr };
};

/* ================================================================
   Max-min mode: find max/min on interval
   ================================================================ */

const generateMaxMin = (rng: () => number): QuadraticFuncProblem | null => {
  const aChoices = [-2, -1, 1, 2];
  const a = aChoices[Math.floor(rng() * aChoices.length)];
  const p = Math.floor(rng() * 7) - 3; // [-3..3]
  const q = Math.floor(rng() * 9) - 4; // [-4..4]

  // Pick interval [m, n] where m < n, length 2..5
  const m = Math.floor(rng() * 7) - 3; // [-3..3]
  const len = Math.floor(rng() * 4) + 2; // [2..5]
  const n = m + len;

  // Expand: y = ax² + bx + c
  const b = -2 * a * p;
  const c = a * p * p + q;

  // Evaluate y at endpoints and vertex
  const yAtM = a * m * m + b * m + c;
  const yAtN = a * n * n + b * n + c;

  const expr = `y = ${formatQuadratic(a, b, c)}（${formatSigned(m)} ≤ x ≤ ${formatSigned(n)}）の最大値と最小値`;

  const vertexInside = m <= p && p <= n;

  let maxVal: number;
  let maxX: number;
  let minVal: number;
  let minX: number;

  if (vertexInside) {
    // Vertex value is q
    if (a > 0) {
      // Opens up: min at vertex, max at farther endpoint
      minVal = q;
      minX = p;
      if (Math.abs(m - p) >= Math.abs(n - p)) {
        maxVal = yAtM;
        maxX = m;
      } else {
        maxVal = yAtN;
        maxX = n;
      }
    } else {
      // Opens down: max at vertex, min at farther endpoint
      maxVal = q;
      maxX = p;
      if (Math.abs(m - p) >= Math.abs(n - p)) {
        minVal = yAtM;
        minX = m;
      } else {
        minVal = yAtN;
        minX = n;
      }
    }
  } else {
    // Vertex outside interval: both extremes at endpoints
    if (yAtM >= yAtN) {
      maxVal = yAtM;
      maxX = m;
      minVal = yAtN;
      minX = n;
    } else {
      maxVal = yAtN;
      maxX = n;
      minVal = yAtM;
      minX = m;
    }
  }

  const answerExpr =
    `最大値 ${formatSigned(maxVal)}（x = ${formatSigned(maxX)}），最小値 ${formatSigned(minVal)}（x = ${formatSigned(minX)}）`;

  return { expr, answerExpr };
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
