import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export const generateUnitConv3 = (
  seed: number,
  unitType: "length" | "weight" | "mixed",
): TextProblem[] => {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const makeLengthProblem = (): TextProblem => {
    const type = Math.floor(rng() * 4);
    switch (type) {
      case 0: {
        const km = 1 + Math.floor(rng() * 9);
        const m = (1 + Math.floor(rng() * 9)) * 100;
        return { question: `${km}km ${m}m ＝ □m`, answer: `${km * 1000 + m}` };
      }
      case 1: {
        const km = 1 + Math.floor(rng() * 9);
        const m = (1 + Math.floor(rng() * 9)) * 100;
        const total = km * 1000 + m;
        return { question: `${total}m ＝ □km □m`, answer: `${km}km ${m}m` };
      }
      case 2: {
        const m = 1 + Math.floor(rng() * 9);
        const cm = 1 + Math.floor(rng() * 99);
        return { question: `${m}m ${cm}cm ＝ □cm`, answer: `${m * 100 + cm}` };
      }
      default: {
        const m = 1 + Math.floor(rng() * 9);
        const cm = 1 + Math.floor(rng() * 99);
        const total = m * 100 + cm;
        return { question: `${total}cm ＝ □m □cm`, answer: `${m}m ${cm}cm` };
      }
    }
  };

  const makeWeightProblem = (): TextProblem => {
    const type = Math.floor(rng() * 4);
    switch (type) {
      case 0: {
        const kg = 1 + Math.floor(rng() * 9);
        const g = (1 + Math.floor(rng() * 9)) * 100;
        return { question: `${kg}kg ${g}g ＝ □g`, answer: `${kg * 1000 + g}` };
      }
      case 1: {
        const kg = 1 + Math.floor(rng() * 9);
        const g = (1 + Math.floor(rng() * 9)) * 100;
        const total = kg * 1000 + g;
        return { question: `${total}g ＝ □kg □g`, answer: `${kg}kg ${g}g` };
      }
      case 2: {
        const t = 1 + Math.floor(rng() * 5);
        const kg = (1 + Math.floor(rng() * 9)) * 100;
        return { question: `${t}t ${kg}kg ＝ □kg`, answer: `${t * 1000 + kg}` };
      }
      default: {
        const t = 1 + Math.floor(rng() * 5);
        const kg = (1 + Math.floor(rng() * 9)) * 100;
        const total = t * 1000 + kg;
        return { question: `${total}kg ＝ □t □kg`, answer: `${t}t ${kg}kg` };
      }
    }
  };

  for (let i = 0; i < 10; i++) {
    if (unitType === "length") {
      problems.push(makeLengthProblem());
    } else if (unitType === "weight") {
      problems.push(makeWeightProblem());
    } else {
      problems.push(rng() < 0.5 ? makeLengthProblem() : makeWeightProblem());
    }
  }
  return problems;
};
