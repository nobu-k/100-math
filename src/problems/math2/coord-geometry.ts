import { mulberry32 } from "../random";
import { simplifyRoot } from "../shared/latex-format";

export type CoordGeometryMode = "distance" | "division" | "line-eq" | "point-line-dist" | "mixed";

export interface CoordGeometryProblem {
  expr: string;
  answerExpr: string;
}

export const generateCoordGeometry = (
  seed: number,
  mode: CoordGeometryMode = "mixed",
  count = 10,
): CoordGeometryProblem[] => {
  const rng = mulberry32(seed);
  const problems: CoordGeometryProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: CoordGeometryProblem | null = null;
      if (pick === "distance") result = generateDistance(rng);
      else if (pick === "division") result = generateDivision(rng);
      else if (pick === "line-eq") result = generateLineEq(rng);
      else result = generatePointLineDist(rng);

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

const pickMode = (rng: () => number, mode: CoordGeometryMode): "distance" | "division" | "line-eq" | "point-line-dist" => {
  if (mode !== "mixed") return mode;
  const r = rng();
  if (r < 0.25) return "distance";
  if (r < 0.5) return "division";
  if (r < 0.75) return "line-eq";
  return "point-line-dist";
};

const generateDistance = (rng: () => number): CoordGeometryProblem | null => {
  const x1 = Math.floor(rng() * 9) - 4;
  const y1 = Math.floor(rng() * 9) - 4;
  const x2 = Math.floor(rng() * 9) - 4;
  const y2 = Math.floor(rng() * 9) - 4;

  if (x1 === x2 && y1 === y2) return null;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const d2 = dx * dx + dy * dy;

  const [outer, inner] = simplifyRoot(d2);
  let distStr: string;
  if (inner === 1) distStr = `${outer}`;
  else if (outer === 1) distStr = `√${inner}`;
  else distStr = `${outer}√${inner}`;

  const expr = `2点 (${fmt(x1)}, ${fmt(y1)}), (${fmt(x2)}, ${fmt(y2)}) 間の距離`;
  const answerExpr = distStr;
  return { expr, answerExpr };
};

const generateDivision = (rng: () => number): CoordGeometryProblem | null => {
  // Internal division point m:n with integer result
  const m = Math.floor(rng() * 3) + 1; // [1..3]
  const n = Math.floor(rng() * 3) + 1; // [1..3]

  // Pick points so that division gives integers
  // (mx2+nx1)/(m+n) must be integer
  const total = m + n;
  const x1 = Math.floor(rng() * 7) - 3;
  const y1 = Math.floor(rng() * 7) - 3;

  // x2 such that (m*x2 + n*x1) % total === 0
  const x2base = Math.floor(rng() * 7) - 3;
  // Adjust: find nearest x2 where it works
  let x2 = x2base;
  for (let d = 0; d <= total; d++) {
    if ((m * (x2base + d) + n * x1) % total === 0) { x2 = x2base + d; break; }
    if ((m * (x2base - d) + n * x1) % total === 0) { x2 = x2base - d; break; }
  }

  const y2base = Math.floor(rng() * 7) - 3;
  let y2 = y2base;
  for (let d = 0; d <= total; d++) {
    if ((m * (y2base + d) + n * y1) % total === 0) { y2 = y2base + d; break; }
    if ((m * (y2base - d) + n * y1) % total === 0) { y2 = y2base - d; break; }
  }

  if (x1 === x2 && y1 === y2) return null;

  const px = (m * x2 + n * x1) / total;
  const py = (m * y2 + n * y1) / total;

  const expr = `2点 (${fmt(x1)}, ${fmt(y1)}), (${fmt(x2)}, ${fmt(y2)}) を ${m}:${n} に内分する点`;
  const answerExpr = `(${fmt(px)}, ${fmt(py)})`;
  return { expr, answerExpr };
};

const generateLineEq = (rng: () => number): CoordGeometryProblem | null => {
  if (rng() < 0.5) {
    // From two points
    const x1 = Math.floor(rng() * 7) - 3;
    const y1 = Math.floor(rng() * 7) - 3;
    let x2 = Math.floor(rng() * 7) - 3;
    const y2 = Math.floor(rng() * 7) - 3;
    if (x1 === x2) x2 = x1 + 1;

    const dy = y2 - y1;
    const dx = x2 - x1;
    const g = gcd(Math.abs(dy), Math.abs(dx));
    let slopeNum = dy / g;
    let slopeDen = dx / g;
    if (slopeDen < 0) { slopeNum = -slopeNum; slopeDen = -slopeDen; }

    const expr = `2点 (${fmt(x1)}, ${fmt(y1)}), (${fmt(x2)}, ${fmt(y2)}) を通る直線の方程式`;

    // y - y1 = (slopeNum/slopeDen)(x - x1) → slopeDen·y = slopeNum·x + (slopeDen·y1 - slopeNum·x1)
    if (slopeDen === 1) {
      const b = y1 - slopeNum * x1;
      const answerExpr = formatLinear(slopeNum, b);
      return { expr, answerExpr };
    }
    // Express as fraction slope
    const slopeStr = `${fmt(slopeNum)}/${slopeDen}`;
    const b = y1 - (slopeNum / slopeDen) * x1;
    const bStr = Number.isInteger(b) ? (b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`) : "";
    const answerExpr = `y = (${slopeStr})x ${bStr}`;
    return { expr, answerExpr };
  }

  // From point and slope
  const slope = Math.floor(rng() * 7) - 3;
  const x0 = Math.floor(rng() * 7) - 3;
  const y0 = Math.floor(rng() * 7) - 3;

  const b = y0 - slope * x0;
  const expr = `点 (${fmt(x0)}, ${fmt(y0)}) を通り，傾き ${fmt(slope)} の直線の方程式`;
  const answerExpr = formatLinear(slope, b);
  return { expr, answerExpr };
};

const generatePointLineDist = (rng: () => number): CoordGeometryProblem | null => {
  // |ax₀ + by₀ + c| / √(a² + b²)
  const a = Math.floor(rng() * 5) + 1; // [1..5]
  const b = Math.floor(rng() * 5) + 1; // [1..5]
  const c = Math.floor(rng() * 11) - 5; // [-5..5]
  const x0 = Math.floor(rng() * 7) - 3;
  const y0 = Math.floor(rng() * 7) - 3;

  const num = Math.abs(a * x0 + b * y0 + c);
  const den2 = a * a + b * b;

  const [outer, inner] = simplifyRoot(den2);

  // distance = num / (outer√inner) = num√inner / (outer·inner)  (rationalized)
  let distStr: string;
  if (inner === 1) {
    // distance = num / outer
    const g = gcd(num, outer);
    if (outer / g === 1) {
      distStr = `${num / g}`;
    } else {
      distStr = `${num / g}/${outer / g}`;
    }
  } else if (num === 0) {
    distStr = "0";
  } else {
    // num / (outer√inner) — rationalize: num√inner / (outer·inner)
    const rationalDen = outer * inner;
    const g = gcd(num, rationalDen);
    const rn = num / g;
    const rd = rationalDen / g;
    if (rd === 1) {
      distStr = rn === 1 ? `√${inner}` : `${rn}√${inner}`;
    } else {
      distStr = rn === 1 ? `√${inner}/${rd}` : `${rn}√${inner}/${rd}`;
    }
  }

  const lineStr = formatLineStd(a, b, c);
  const expr = `点 (${fmt(x0)}, ${fmt(y0)}) と直線 ${lineStr} の距離`;
  const answerExpr = distStr;
  return { expr, answerExpr };
};

const fmt = (n: number): string => n < 0 ? `−${Math.abs(n)}` : `${n}`;

const formatLinear = (m: number, b: number): string => {
  const mStr = m === 0 ? "" : m === 1 ? "x" : m === -1 ? "−x" : `${m}x`;
  if (m === 0) return `y = ${fmt(b)}`;
  if (b === 0) return `y = ${mStr}`;
  return b > 0 ? `y = ${mStr} + ${b}` : `y = ${mStr} − ${Math.abs(b)}`;
};

const formatLineStd = (a: number, b: number, c: number): string => {
  const parts: string[] = [];
  if (a === 1) parts.push("x");
  else parts.push(`${a}x`);
  if (b === 1) parts.push("+ y");
  else if (b === -1) parts.push("− y");
  else if (b > 0) parts.push(`+ ${b}y`);
  else parts.push(`− ${Math.abs(b)}y`);
  if (c > 0) parts.push(`+ ${c}`);
  else if (c < 0) parts.push(`− ${Math.abs(c)}`);
  return `${parts.join(" ")} = 0`;
};

const gcd = (a: number, b: number): number => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
};
