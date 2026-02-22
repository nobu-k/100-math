import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export const generateAreaUnit = (
  seed: number,
  unitType: "cm-m" | "m-ha" | "mixed",
): TextProblem[] => {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const sub = unitType === "mixed"
      ? (rng() < 0.5 ? "cm-m" : "m-ha")
      : unitType;

    if (sub === "cm-m") {
      const type = Math.floor(rng() * 2);
      if (type === 0) {
        const m2 = 1 + Math.floor(rng() * 9);
        problems.push({ question: `${m2}m² ＝ □cm²`, answer: `${m2 * 10000}` });
      } else {
        const cm2 = (1 + Math.floor(rng() * 9)) * 10000;
        problems.push({ question: `${cm2}cm² ＝ □m²`, answer: `${cm2 / 10000}` });
      }
    } else {
      const type = Math.floor(rng() * 4);
      switch (type) {
        case 0: {
          const ha = 1 + Math.floor(rng() * 9);
          problems.push({ question: `${ha}ha ＝ □m²`, answer: `${ha * 10000}` });
          break;
        }
        case 1: {
          const m2 = (1 + Math.floor(rng() * 9)) * 10000;
          problems.push({ question: `${m2}m² ＝ □ha`, answer: `${m2 / 10000}` });
          break;
        }
        case 2: {
          const a = (1 + Math.floor(rng() * 9)) * 10;
          problems.push({ question: `${a}a ＝ □m²`, answer: `${a * 100}` });
          break;
        }
        default: {
          const km2 = 1 + Math.floor(rng() * 5);
          problems.push({ question: `${km2}km² ＝ □ha`, answer: `${km2 * 100}` });
          break;
        }
      }
    }
  }
  return problems;
};
