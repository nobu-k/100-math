import { mulberry32 } from "../random";

export type ProportionMode = "direct" | "inverse" | "mixed";
export type ProportionTask = "find-formula" | "find-value" | "mixed";

export interface ProportionProblem {
  /** "direct" (y = ax) or "inverse" (y = a/x) */
  type: "direct" | "inverse";
  /** "find-formula" or "find-value" */
  task: "find-formula" | "find-value";
  /** The proportionality constant a */
  constant: number;
  /** Given x value */
  givenX?: number;
  /** Given y value */
  givenY?: number;
  /** For find-value: the x to evaluate at */
  evalX?: number;
  /** The answer (a for find-formula, y for find-value) */
  answer: number;
  /** Display string for the question */
  question: string;
  /** Display string for the answer */
  answerDisplay: string;
}

export function generateProportion(
  seed: number,
  mode: ProportionMode = "mixed",
  task: ProportionTask = "mixed",
): ProportionProblem[] {
  const rng = mulberry32(seed);
  const problems: ProportionProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < 10; i++) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const type: "direct" | "inverse" =
        mode === "mixed"
          ? rng() < 0.5
            ? "direct"
            : "inverse"
          : (mode as "direct" | "inverse");
      const taskType: "find-formula" | "find-value" =
        task === "mixed"
          ? rng() < 0.5
            ? "find-formula"
            : "find-value"
          : (task as "find-formula" | "find-value");

      // Generate constant a (nonzero integer, -10 to 10)
      let a = Math.floor(rng() * 19) - 9; // -9 to 9
      if (a === 0) a = rng() < 0.5 ? 1 : -1;

      if (type === "direct") {
        // y = ax
        const givenX = Math.floor(rng() * 9) + 1; // 1-9
        const signX = rng() < 0.3 ? -1 : 1;
        const x = signX * givenX;
        const y = a * x;

        if (taskType === "find-formula") {
          const question = `y は x に比例し、x = ${x} のとき y = ${y}。y を x の式で表しなさい`;
          const key = `d-f-${a}`;
          if (!seen.has(key) || attempt === 29) {
            seen.add(key);
            problems.push({
              type: "direct",
              task: "find-formula",
              constant: a,
              givenX: x,
              givenY: y,
              answer: a,
              question,
              answerDisplay: `y = ${a === 1 ? "" : a === -1 ? "−" : a}x`,
            });
            break;
          }
        } else {
          const evalX = Math.floor(rng() * 9) + 1;
          const signEval = rng() < 0.4 ? -1 : 1;
          const ex = signEval * evalX;
          const evalY = a * ex;
          const question = `y = ${a === 1 ? "" : a === -1 ? "−" : a}x のとき、x = ${ex} なら y = □`;
          const key = `d-v-${a}-${ex}`;
          if (!seen.has(key) || attempt === 29) {
            seen.add(key);
            problems.push({
              type: "direct",
              task: "find-value",
              constant: a,
              evalX: ex,
              answer: evalY,
              question,
              answerDisplay: `${evalY}`,
            });
            break;
          }
        }
      } else {
        // y = a/x (inverse proportion)
        // Need x to divide a evenly
        const absA = Math.abs(a);
        if (absA === 0) continue;

        if (taskType === "find-formula") {
          // Pick x that divides a
          const divisors: number[] = [];
          for (let d = 1; d <= Math.abs(a); d++) {
            if (Math.abs(a) % d === 0) divisors.push(d);
          }
          if (divisors.length === 0) continue;
          const givenX =
            divisors[Math.floor(rng() * divisors.length)] *
            (rng() < 0.3 ? -1 : 1);
          if (givenX === 0) continue;
          const givenY = a / givenX;
          const question = `y は x に反比例し、x = ${givenX} のとき y = ${givenY}。y を x の式で表しなさい`;
          const key = `i-f-${a}`;
          if (!seen.has(key) || attempt === 29) {
            seen.add(key);
            problems.push({
              type: "inverse",
              task: "find-formula",
              constant: a,
              givenX,
              givenY: givenY,
              answer: a,
              question,
              answerDisplay: `y = ${a}/x`,
            });
            break;
          }
        } else {
          // Adjust a to have enough divisors
          const niceA = [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, -2, -3, -4, -5, -6, -8, -9, -10, -12];
          const actualA = niceA[Math.floor(rng() * niceA.length)];
          const divisors: number[] = [];
          for (let d = 1; d <= Math.abs(actualA); d++) {
            if (Math.abs(actualA) % d === 0) divisors.push(d);
          }
          const evalX =
            divisors[Math.floor(rng() * divisors.length)] *
            (rng() < 0.3 ? -1 : 1);
          if (evalX === 0) continue;
          const evalY = actualA / evalX;
          const question = `y = ${actualA}/x のとき、x = ${evalX} なら y = □`;
          const key = `i-v-${actualA}-${evalX}`;
          if (!seen.has(key) || attempt === 29) {
            seen.add(key);
            problems.push({
              type: "inverse",
              task: "find-value",
              constant: actualA,
              evalX,
              answer: evalY,
              question,
              answerDisplay: `${evalY}`,
            });
            break;
          }
        }
      }
    }
  }
  return problems;
}
