import { mulberry32 } from "../random";

export interface VolumeFigure {
  shape: "cube" | "rect";
  width: number;
  height: number;
  depth: number;
}

export interface VolumeProblem {
  question: string;
  answer: string;
  figure: VolumeFigure;
}

export const generateVolume = (
  seed: number,
  shape: "cube" | "rect" | "mixed",
): VolumeProblem[] => {
  const rng = mulberry32(seed);
  const problems: VolumeProblem[] = [];

  for (let i = 0; i < 6; i++) {
    const useCube = shape === "cube" ? true : shape === "rect" ? false : rng() < 0.4;

    if (useCube) {
      const side = 1 + Math.floor(rng() * 10);
      const vol = side * side * side;
      problems.push({
        question: `一辺${side}cmの立方体の体積は？`,
        answer: `${vol}cm³`,
        figure: { shape: "cube", width: side, height: side, depth: side },
      });
    } else {
      const a = 2 + Math.floor(rng() * 10);
      const b = 2 + Math.floor(rng() * 10);
      const c = 2 + Math.floor(rng() * 10);
      const vol = a * b * c;
      problems.push({
        question: `たて${a}cm、よこ${b}cm、高さ${c}cmの直方体の体積は？`,
        answer: `${vol}cm³`,
        figure: { shape: "rect", width: b, height: c, depth: a },
      });
    }
  }
  return problems;
};
