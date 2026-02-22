import { mulberry32 } from "../random";

export type SimEqMode = "addition" | "substitution" | "mixed";

export interface SimEqProblem {
  /** First equation display */
  eq1: string;
  /** Second equation display */
  eq2: string;
  /** Solution x */
  answerX: number;
  /** Solution y */
  answerY: number;
}

function formatLinearEq(
  xCoeff: number,
  yCoeff: number,
  constant: number,
): string {
  const parts: string[] = [];
  if (xCoeff !== 0) {
    if (xCoeff === 1) parts.push("x");
    else if (xCoeff === -1) parts.push("−x");
    else parts.push(`${xCoeff}x`);
  }
  if (yCoeff !== 0) {
    if (parts.length === 0) {
      if (yCoeff === 1) parts.push("y");
      else if (yCoeff === -1) parts.push("−y");
      else parts.push(`${yCoeff}y`);
    } else {
      if (yCoeff === 1) parts.push("+ y");
      else if (yCoeff === -1) parts.push("− y");
      else if (yCoeff > 0) parts.push(`+ ${yCoeff}y`);
      else parts.push(`− ${Math.abs(yCoeff)}y`);
    }
  }
  return `${parts.join(" ")} = ${constant}`;
}

export function generateSimEq(
  seed: number,
  mode: SimEqMode = "mixed",
): SimEqProblem[] {
  const rng = mulberry32(seed);
  const problems: SimEqProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < 12; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick =
        mode === "mixed"
          ? rng() < 0.6
            ? "addition"
            : "substitution"
          : mode;

      const x = Math.floor(rng() * 11) - 5; // -5 to 5
      const y = Math.floor(rng() * 11) - 5;

      let eq1: string;
      let eq2: string;

      if (pick === "substitution") {
        // y = ax + b form for first equation
        let a1 = Math.floor(rng() * 7) - 3;
        if (a1 === 0) a1 = 1;
        const b1 = y - a1 * x;
        if (Math.abs(b1) > 15) continue;

        // ax + by = c form for second
        let a2 = Math.floor(rng() * 7) - 3;
        if (a2 === 0) a2 = 1;
        let b2 = Math.floor(rng() * 7) - 3;
        if (b2 === 0) b2 = 1;
        const c2 = a2 * x + b2 * y;
        if (Math.abs(c2) > 20) continue;

        const bSign = b1 >= 0 ? `+ ${b1}` : `− ${Math.abs(b1)}`;
        const aStr = a1 === 1 ? "" : a1 === -1 ? "−" : `${a1}`;
        eq1 = b1 === 0 ? `y = ${aStr}x` : `y = ${aStr}x ${bSign}`;
        eq2 = formatLinearEq(a2, b2, c2);
      } else {
        // Two standard form equations
        let a1 = Math.floor(rng() * 7) - 3;
        let b1 = Math.floor(rng() * 7) - 3;
        let a2 = Math.floor(rng() * 7) - 3;
        let b2 = Math.floor(rng() * 7) - 3;
        if (a1 === 0) a1 = 1;
        if (b1 === 0) b1 = 1;
        if (a2 === 0) a2 = 1;
        if (b2 === 0) b2 = 1;

        // Check not parallel (determinant != 0)
        if (a1 * b2 - a2 * b1 === 0) continue;

        const c1 = a1 * x + b1 * y;
        const c2 = a2 * x + b2 * y;
        if (Math.abs(c1) > 20 || Math.abs(c2) > 20) continue;

        eq1 = formatLinearEq(a1, b1, c1);
        eq2 = formatLinearEq(a2, b2, c2);
      }

      const key = `${eq1}|${eq2}`;
      if (!seen.has(key) || attempt === 39) {
        seen.add(key);
        problems.push({ eq1, eq2, answerX: x, answerY: y });
        break;
      }
    }
  }
  return problems;
}
