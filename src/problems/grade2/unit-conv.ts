import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export const generateUnitConv = (
  seed: number,
  unitType: "length" | "volume" | "mixed",
): TextProblem[] => {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const makeLengthProblem = (): TextProblem => {
    const type = Math.floor(rng() * 4);
    switch (type) {
      case 0: {
        const cm = 1 + Math.floor(rng() * 9);
        const mm = 1 + Math.floor(rng() * 9);
        return { question: `${cm}cm ${mm}mm ＝ □mm`, answer: `${cm * 10 + mm}` };
      }
      case 1: {
        const cm = 1 + Math.floor(rng() * 9);
        const mm = 1 + Math.floor(rng() * 9);
        const total = cm * 10 + mm;
        return { question: `${total}mm ＝ □cm □mm`, answer: `${cm}cm ${mm}mm` };
      }
      case 2: {
        const m = 1 + Math.floor(rng() * 5);
        const cm = 1 + Math.floor(rng() * 99);
        return { question: `${m}m ${cm}cm ＝ □cm`, answer: `${m * 100 + cm}` };
      }
      default: {
        const m = 1 + Math.floor(rng() * 5);
        const cm = 1 + Math.floor(rng() * 99);
        const total = m * 100 + cm;
        return { question: `${total}cm ＝ □m □cm`, answer: `${m}m ${cm}cm` };
      }
    }
  };

  const makeVolumeProblem = (): TextProblem => {
    const type = Math.floor(rng() * 4);
    switch (type) {
      case 0: {
        const l = 1 + Math.floor(rng() * 5);
        const dl = 1 + Math.floor(rng() * 9);
        return { question: `${l}L ${dl}dL ＝ □dL`, answer: `${l * 10 + dl}` };
      }
      case 1: {
        const l = 1 + Math.floor(rng() * 5);
        const dl = 1 + Math.floor(rng() * 9);
        const total = l * 10 + dl;
        return { question: `${total}dL ＝ □L □dL`, answer: `${l}L ${dl}dL` };
      }
      case 2: {
        const l = 1 + Math.floor(rng() * 3);
        const ml = (1 + Math.floor(rng() * 9)) * 100;
        return { question: `${l}L ${ml}mL ＝ □mL`, answer: `${l * 1000 + ml}` };
      }
      default: {
        const l = 1 + Math.floor(rng() * 3);
        const ml = (1 + Math.floor(rng() * 9)) * 100;
        const total = l * 1000 + ml;
        return { question: `${total}mL ＝ □L □mL`, answer: `${l}L ${ml}mL` };
      }
    }
  };

  for (let i = 0; i < 10; i++) {
    if (unitType === "length") {
      problems.push(makeLengthProblem());
    } else if (unitType === "volume") {
      problems.push(makeVolumeProblem());
    } else {
      problems.push(rng() < 0.5 ? makeLengthProblem() : makeVolumeProblem());
    }
  }
  return problems;
};
