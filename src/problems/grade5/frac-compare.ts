import { mulberry32 } from "../random";

export interface FracCompareProblem {
  aNum: number; aDen: number;
  bNum: number; bDen: number;
  answer: "＞" | "＜" | "＝";
}

/* ---- frac-compare ---- */
export const generateFracCompare = (seed: number): FracCompareProblem[] => {
  const rng = mulberry32(seed);
  const problems: FracCompareProblem[] = [];

  // Balanced: 5 each of ＞, ＜, ＝
  const types: ("＞" | "＜" | "＝")[] = [];
  for (let j = 0; j < 5; j++) types.push("＞");
  for (let j = 0; j < 5; j++) types.push("＜");
  for (let j = 0; j < 5; j++) types.push("＝");
  // Shuffle
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }

  for (const type of types) {
    let aNum: number, aDen: number, bNum: number, bDen: number;

    if (type === "＝") {
      aDen = 2 + Math.floor(rng() * 9);
      aNum = 1 + Math.floor(rng() * (aDen - 1));
      const mult = 2 + Math.floor(rng() * 3);
      bDen = aDen * mult;
      bNum = aNum * mult;
    } else {
      // Generate two distinct fractions; retry if accidentally equal
      for (let attempt = 0; ; attempt++) {
        aDen = 2 + Math.floor(rng() * 9);
        aNum = 1 + Math.floor(rng() * (aDen - 1));
        bDen = 2 + Math.floor(rng() * 9);
        bNum = 1 + Math.floor(rng() * (bDen - 1));
        if (Math.abs(aNum / aDen - bNum / bDen) > 1e-10) break;
        if (attempt >= 20) break;
      }
      // Swap fractions so a > b, then flip for ＜
      if (aNum / aDen < bNum / bDen) {
        [aNum, aDen, bNum, bDen] = [bNum, bDen, aNum, aDen];
      }
      if (type === "＜") {
        [aNum, aDen, bNum, bDen] = [bNum, bDen, aNum, aDen];
      }
    }

    const aVal = aNum / aDen;
    const bVal = bNum / bDen;
    const answer: "＞" | "＜" | "＝" =
      Math.abs(aVal - bVal) < 1e-10 ? "＝" : aVal > bVal ? "＞" : "＜";

    problems.push({ aNum, aDen, bNum, bDen, answer });
  }
  return problems;
};
