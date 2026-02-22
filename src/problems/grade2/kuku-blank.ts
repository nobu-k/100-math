import { mulberry32 } from "../random";

export interface KukuBlankProblem {
  a: number;
  b: number;
  product: number;
  blankPos: "a" | "b" | "product";
  answer: number;
}

export const generateKukuBlank = (
  seed: number,
  blankMode: "any" | "product" | "factor",
): KukuBlankProblem[] => {
  const rng = mulberry32(seed);
  const problems: KukuBlankProblem[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < 15; i++) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const a = 1 + Math.floor(rng() * 9);
      const b = 1 + Math.floor(rng() * 9);
      const product = a * b;
      let blankPos: "a" | "b" | "product";
      if (blankMode === "product") {
        blankPos = "product";
      } else if (blankMode === "factor") {
        blankPos = rng() < 0.5 ? "a" : "b";
      } else {
        const r = rng();
        blankPos = r < 0.33 ? "a" : r < 0.66 ? "b" : "product";
      }
      const key = `${Math.min(a, b)}-${Math.max(a, b)}-${blankPos}`;
      if (!seen.has(key) || attempt === 19) {
        seen.add(key);
        const answer = blankPos === "a" ? a : blankPos === "b" ? b : product;
        problems.push({ a, b, product, blankPos, answer });
        break;
      }
    }
  }
  return problems;
};
