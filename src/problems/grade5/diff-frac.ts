import { mulberry32 } from "../random";
import { lcm, simplify } from "../shared/math-utils";

export interface FracCalcProblem {
  aNum: number; aDen: number;
  bNum: number; bDen: number;
  ansNum: number; ansDen: number;
  ansWhole?: number; ansPartNum?: number;
  op: "+" | "−";
}

/* ---- diff-frac (異分母分数の加減) ---- */
export const generateDiffFrac = (
  seed: number,
  op: "add" | "sub" | "mixed",
): FracCalcProblem[] => {
  const rng = mulberry32(seed);
  const problems: FracCalcProblem[] = [];

  for (let i = 0; i < 12; i++) {
    const useAdd = op === "add" ? true : op === "sub" ? false : rng() < 0.5;
    const aDen = 2 + Math.floor(rng() * 9); // 2-10
    let bDen = 2 + Math.floor(rng() * 9);
    // ensure different denominators
    while (bDen === aDen) bDen = 2 + Math.floor(rng() * 9);

    const aNum = 1 + Math.floor(rng() * (aDen - 1)); // proper fraction
    let bNum = 1 + Math.floor(rng() * (bDen - 1));

    const commonDen = lcm(aDen, bDen);
    const aConverted = aNum * (commonDen / aDen);
    const bConverted = bNum * (commonDen / bDen);

    let rawNum: number;
    const opSym: "+" | "−" = useAdd ? "+" : "−";
    if (useAdd) {
      rawNum = aConverted + bConverted;
    } else {
      // ensure positive result
      if (aConverted <= bConverted) {
        bNum = 1 + Math.floor(rng() * Math.max(1, Math.floor(aConverted * bDen / commonDen) - 1));
        const bConv2 = bNum * (commonDen / bDen);
        rawNum = aConverted - bConv2;
        if (rawNum <= 0) {
          // fallback to add
          rawNum = aConverted + bConverted;
        }
      } else {
        rawNum = aConverted - bConverted;
      }
    }

    if (rawNum <= 0) rawNum = aConverted + bConverted;

    const [sNum, sDen] = simplify(rawNum, commonDen);
    const ansWhole = Math.floor(sNum / sDen);
    const ansPartNum = sNum % sDen;

    problems.push({
      aNum, aDen, bNum, bDen,
      ansNum: sNum, ansDen: sDen,
      op: opSym,
      ...(ansWhole > 0 && ansPartNum > 0 ? { ansWhole, ansPartNum } : {}),
    });
  }
  return problems;
};
