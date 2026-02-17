import { mulberry32 } from "../random";
import { lcm, simplify } from "../shared/math-utils";
import type { FracProblem } from "./types";

export function generateFracMixedCalc(seed: number): FracProblem[] {
  const rng = mulberry32(seed);
  const problems: FracProblem[] = [];

  for (let i = 0; i < 10; i++) {
    // Generate: a/b op1 c/d where op1 is +,-,*,/
    // Then combine with second op. For simplicity, generate 2-term mixed expressions.
    const aDen = 2 + Math.floor(rng() * 8);
    const aNum = 1 + Math.floor(rng() * (aDen * 2));
    const bDen = 2 + Math.floor(rng() * 8);
    const bNum = 1 + Math.floor(rng() * (bDen * 2));

    // For mixed calc, use multiply then add/sub with a simple fraction
    const cDen = 2 + Math.floor(rng() * 5);
    const cNum = 1 + Math.floor(rng() * (cDen - 1));

    // Compute aNum/aDen × bNum/bDen + cNum/cDen
    const mulNum = aNum * bNum;
    const mulDen = aDen * bDen;
    const [smNum, smDen] = simplify(mulNum, mulDen);

    const commonDen = lcm(smDen, cDen);
    const addResult = smNum * (commonDen / smDen) + cNum * (commonDen / cDen);
    const [sNum, sDen] = simplify(addResult, commonDen);

    const ansWhole = Math.floor(sNum / sDen);
    const ansPartNum = sNum % sDen;

    problems.push({
      aNum, aDen, bNum, bDen,
      ansNum: sNum, ansDen: sDen,
      ...(ansWhole > 0 && ansPartNum > 0 ? { ansWhole, ansPartNum } : {}),
    });
  }
  return problems;
}
