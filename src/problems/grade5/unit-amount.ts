import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

/* ---- unit-amount ---- */
export function generateUnitAmount(seed: number): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const themes = [
    // [area, people, label for area, label for people]
    { area: "m²", people: "人", q: "1m²あたり何人？" },
    { area: "km²", people: "人", q: "人口密度（1km²あたりの人数）は？" },
  ];

  for (let i = 0; i < 8; i++) {
    const theme = themes[Math.floor(rng() * themes.length)];
    const unitArea = 5 + Math.floor(rng() * 20);
    const perUnit = 2 + Math.floor(rng() * 8);
    const total = unitArea * perUnit;

    if (rng() < 0.5) {
      // find per unit
      problems.push({
        question: `面積${unitArea}${theme.area}に${total}${theme.people}います。${theme.q}`,
        answer: `${perUnit}${theme.people}`,
      });
    } else {
      // find total
      problems.push({
        question: `1${theme.area}あたり${perUnit}${theme.people}で、面積が${unitArea}${theme.area}のとき、全部で何${theme.people}？`,
        answer: `${total}${theme.people}`,
      });
    }
  }
  return problems;
}
