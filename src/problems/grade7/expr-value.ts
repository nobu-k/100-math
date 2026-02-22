import { mulberry32 } from "../random";

export type ExprValueVars = "one" | "two";

export interface ExprValueProblem {
  /** Display expression, e.g. "2x + 5" */
  expr: string;
  /** Variable assignments, e.g. { x: -3 } */
  vars: Record<string, number>;
  /** Display string for assignments, e.g. "x = −3" */
  varDisplay: string;
  /** The answer */
  answer: number;
}

interface ExprTemplate {
  vars: string[];
  build: (
    coeffs: number[],
    vals: Record<string, number>,
  ) => { expr: string; answer: number };
}

const oneVarTemplates: ExprTemplate[] = [
  {
    // ax + b
    vars: ["x"],
    build: ([a, b], v) => ({
      expr: `${fmtCoeff(a)}x + ${fmtNum(b)}`,
      answer: a * v.x + b,
    }),
  },
  {
    // ax - b
    vars: ["x"],
    build: ([a, b], v) => ({
      expr: `${fmtCoeff(a)}x − ${fmtNum(Math.abs(b))}`,
      answer: a * v.x - Math.abs(b),
    }),
  },
  {
    // ax² + b
    vars: ["x"],
    build: ([a, b], v) => ({
      expr: `${fmtCoeff(a)}x² + ${fmtNum(b)}`,
      answer: a * v.x * v.x + b,
    }),
  },
  {
    // a(x + b)
    vars: ["x"],
    build: ([a, b], v) => ({
      expr: `${fmtNum(a)}(x + ${fmtNum(b)})`,
      answer: a * (v.x + b),
    }),
  },
];

const twoVarTemplates: ExprTemplate[] = [
  {
    // ax + by
    vars: ["a", "b"],
    build: ([ca, cb], v) => ({
      expr: `${fmtCoeff(ca)}a + ${fmtCoeff(cb)}b`,
      answer: ca * v.a + cb * v.b,
    }),
  },
  {
    // ax - by + c
    vars: ["a", "b"],
    build: ([ca, cb, c], v) => ({
      expr: `${fmtCoeff(ca)}a − ${fmtCoeff(Math.abs(cb))}b + ${fmtNum(c)}`,
      answer: ca * v.a - Math.abs(cb) * v.b + c,
    }),
  },
  {
    // ax × by (= ab × xy)
    vars: ["x", "y"],
    build: ([ca, cb], v) => ({
      expr: `${fmtCoeff(ca)}x × ${fmtCoeff(cb)}y`,
      answer: ca * v.x * cb * v.y,
    }),
  },
];

function fmtCoeff(n: number): string {
  if (n === 1) return "";
  if (n === -1) return "−";
  if (n < 0) return `${n}`;
  return `${n}`;
}

function fmtNum(n: number): string {
  if (n < 0) return `(${n})`;
  return `${n}`;
}

function fmtVar(name: string, val: number): string {
  return `${name} = ${val}`;
}

export function generateExprValue(
  seed: number,
  vars: ExprValueVars = "one",
): ExprValueProblem[] {
  const rng = mulberry32(seed);
  const problems: ExprValueProblem[] = [];
  const seen = new Set<string>();
  const tmpls = vars === "one" ? oneVarTemplates : twoVarTemplates;

  for (let i = 0; i < 10; i++) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const tmpl = tmpls[Math.floor(rng() * tmpls.length)];
      const coeffs: number[] = [];
      for (let c = 0; c < 3; c++) {
        let v = Math.floor(rng() * 9) - 4; // -4 to 4
        if (v === 0) v = 1;
        coeffs.push(v);
      }
      const varVals: Record<string, number> = {};
      for (const vName of tmpl.vars) {
        let v = Math.floor(rng() * 11) - 5; // -5 to 5
        if (v === 0) v = rng() < 0.5 ? 1 : -1;
        varVals[vName] = v;
      }
      const result = tmpl.build(coeffs, varVals);
      if (Math.abs(result.answer) > 50) continue;

      const varDisplay = tmpl.vars.map((v) => fmtVar(v, varVals[v])).join(", ");
      const key = `${result.expr}|${varDisplay}`;
      if (!seen.has(key) || attempt === 29) {
        seen.add(key);
        problems.push({
          expr: result.expr,
          vars: varVals,
          varDisplay,
          answer: result.answer,
        });
        break;
      }
    }
  }
  return problems;
}
