import { mulberry32 } from "../random";

export type MonoMulDivMode = "mul" | "div" | "mixed";

export interface MonoMulDivProblem {
  expr: string;
  answerExpr: string;
}

export const generateMonoMulDiv = (
  seed: number,
  mode: MonoMulDivMode = "mixed",
): MonoMulDivProblem[] => {
  const rng = mulberry32(seed);
  const problems: MonoMulDivProblem[] = [];
  const seen = new Set<string>();
  const varNames = ["a", "b", "x", "y"];

  for (let i = 0; i < 12; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const isMul =
        mode === "mixed" ? rng() < 0.5 : mode === "mul";

      if (isMul) {
        // monomial × monomial
        const c1 = Math.floor(rng() * 9) - 4;
        const c2 = Math.floor(rng() * 9) - 4;
        if (c1 === 0 || c2 === 0) continue;

        const vars1: Record<string, number> = {};
        const vars2: Record<string, number> = {};
        const vCount = 1 + Math.floor(rng() * 2); // 1-2 variables
        const used = new Set<string>();
        for (let v = 0; v < vCount; v++) {
          const vn = varNames[Math.floor(rng() * varNames.length)];
          if (used.has(vn)) continue;
          used.add(vn);
          const e1 = rng() < 0.7 ? 1 : 2;
          const e2 = rng() < 0.7 ? 1 : 0;
          if (e1 > 0) vars1[vn] = e1;
          if (e2 > 0) vars2[vn] = e2;
        }
        // Ensure at least one var in each term
        if (Object.keys(vars1).length === 0) vars1["x"] = 1;
        if (Object.keys(vars2).length === 0) vars2["y"] = 1;

        const resultCoeff = c1 * c2;
        const resultVars: Record<string, number> = { ...vars1 };
        for (const [v, e] of Object.entries(vars2)) {
          resultVars[v] = (resultVars[v] || 0) + e;
        }

        const term1 = formatMono(c1, vars1);
        const term2 = formatMono(c2, vars2);
        const expr = `${term1} × ${term2}`;
        const answerExpr = formatMono(resultCoeff, resultVars);

        const key = expr;
        if (!seen.has(key) || attempt === 39) {
          seen.add(key);
          problems.push({ expr, answerExpr });
          break;
        }
      } else {
        // monomial ÷ monomial (ensure divisible)
        const quotientCoeff = Math.floor(rng() * 9) - 4;
        if (quotientCoeff === 0) continue;
        const divisorCoeff = Math.floor(rng() * 7) - 3;
        if (divisorCoeff === 0) continue;
        const dividendCoeff = quotientCoeff * divisorCoeff;
        if (Math.abs(dividendCoeff) > 36) continue;

        const vn = varNames[Math.floor(rng() * 2)]; // pick a or x
        const vn2 = varNames[Math.floor(rng() * 2) + 2]; // pick x or y
        const qExp = 1 + Math.floor(rng() * 2); // 1-2
        const dExp = Math.floor(rng() * (qExp + 1)); // 0-qExp
        const nExp = qExp + dExp;

        const dividendVars: Record<string, number> = {};
        if (nExp > 0) dividendVars[vn] = nExp;
        // Sometimes add a second variable
        if (rng() < 0.3) {
          dividendVars[vn2] = 1;
        }

        const divisorVars: Record<string, number> = {};
        if (dExp > 0) divisorVars[vn] = dExp;

        const resultVars: Record<string, number> = {};
        for (const [v, e] of Object.entries(dividendVars)) {
          const re = e - (divisorVars[v] || 0);
          if (re > 0) resultVars[v] = re;
        }

        const expr = `${formatMono(dividendCoeff, dividendVars)} ÷ ${formatMono(divisorCoeff, divisorVars)}`;
        const answerExpr = formatMono(quotientCoeff, resultVars);

        const key = expr;
        if (!seen.has(key) || attempt === 39) {
          seen.add(key);
          problems.push({ expr, answerExpr });
          break;
        }
      }
    }
  }
  return problems;
};

const formatMono = (coeff: number, vars: Record<string, number>): string => {
  if (coeff === 0) return "0";
  let result = "";
  if (coeff === 1 && Object.keys(vars).length > 0) result = "";
  else if (coeff === -1 && Object.keys(vars).length > 0) result = "−";
  else result = `${coeff}`;

  for (const [v, exp] of Object.entries(vars).sort()) {
    if (exp === 1) result += v;
    else if (exp > 1) result += `${v}${exp === 2 ? "²" : "³"}`;
  }
  if (result === "" || result === "−") result = result + "1";
  return result;
};
