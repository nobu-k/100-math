import { mulberry32 } from "../random";
import { simplify } from "../shared/math-utils";
import type { FracProblem } from "./types";

export const generateFracMul = (seed: number): FracProblem[] => {
  const rng = mulberry32(seed);
  const problems: FracProblem[] = [];

  for (let i = 0; i < 12; i++) {
    const aDen = 2 + Math.floor(rng() * 9);
    const aNum = 1 + Math.floor(rng() * (aDen * 2));
    const bDen = 2 + Math.floor(rng() * 9);
    const bNum = 1 + Math.floor(rng() * (bDen * 2));

    const rawNum = aNum * bNum;
    const rawDen = aDen * bDen;
    const [sNum, sDen] = simplify(rawNum, rawDen);

    const ansWhole = Math.floor(sNum / sDen);
    const ansPartNum = sNum % sDen;

    problems.push({
      aNum, aDen, bNum, bDen,
      ansNum: sNum, ansDen: sDen,
      ...(ansWhole > 0 && ansPartNum > 0 ? { ansWhole, ansPartNum } : {}),
    });
  }
  return problems;
};
