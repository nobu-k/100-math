import { mulberry32 } from "../random";

export interface CircleRDFigure {
  type: "radius-to-diameter" | "diameter-to-radius" | "conceptual";
  radius: number;
  diameter: number;
}

export interface CircleRDProblem {
  question: string;
  answer: string;
  figure: CircleRDFigure;
}

export const generateCircleRD = (seed: number): CircleRDProblem[] => {
  const rng = mulberry32(seed);
  const problems: CircleRDProblem[] = [];

  for (let i = 0; i < 6; i++) {
    const type = Math.floor(rng() * 3);
    switch (type) {
      case 0: {
        const r = 1 + Math.floor(rng() * 20);
        problems.push({
          question: `半径${r}cmの円の直径は？`,
          answer: `${r * 2}cm`,
          figure: { type: "radius-to-diameter", radius: r, diameter: r * 2 },
        });
        break;
      }
      case 1: {
        const d = 2 + Math.floor(rng() * 10) * 2;
        problems.push({
          question: `直径${d}cmの円の半径は？`,
          answer: `${d / 2}cm`,
          figure: { type: "diameter-to-radius", radius: d / 2, diameter: d },
        });
        break;
      }
      default: {
        const r = 1 + Math.floor(rng() * 15);
        problems.push({
          question: `半径が${r}cmの円があります。直径は半径の何倍ですか？`,
          answer: `2倍`,
          figure: { type: "conceptual", radius: r, diameter: r * 2 },
        });
        break;
      }
    }
  }
  return problems;
};
