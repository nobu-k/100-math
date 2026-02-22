import { mulberry32 } from "../random";

export interface AreaFigure {
  shape: "square" | "rect";
  width: number;
  height: number;
  unknown: "area" | "width" | "height";
}

export interface AreaProblem {
  question: string;
  answer: string;
  figure: AreaFigure;
}

export const generateArea = (
  seed: number,
  shape: "square" | "rect" | "mixed",
): AreaProblem[] => {
  const rng = mulberry32(seed);
  const problems: AreaProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const useSquare = shape === "square" ? true : shape === "rect" ? false : rng() < 0.4;
    const reverse = rng() < 0.3;

    if (useSquare) {
      const side = 2 + Math.floor(rng() * 18);
      const area = side * side;
      if (reverse) {
        problems.push({
          question: `面積が${area}cm²の正方形の一辺の長さは？`,
          answer: `${side}cm`,
          figure: { shape: "square", width: side, height: side, unknown: "width" },
        });
      } else {
        problems.push({
          question: `一辺${side}cmの正方形の面積は？`,
          answer: `${area}cm²`,
          figure: { shape: "square", width: side, height: side, unknown: "area" },
        });
      }
    } else {
      const w = 2 + Math.floor(rng() * 15);
      const h = 2 + Math.floor(rng() * 15);
      const area = w * h;
      if (reverse) {
        problems.push({
          question: `面積が${area}cm²、たて${h}cmの長方形のよこは？`,
          answer: `${w}cm`,
          figure: { shape: "rect", width: w, height: h, unknown: "width" },
        });
      } else {
        problems.push({
          question: `たて${h}cm、よこ${w}cmの長方形の面積は？`,
          answer: `${area}cm²`,
          figure: { shape: "rect", width: w, height: h, unknown: "area" },
        });
      }
    }
  }
  return problems;
};
