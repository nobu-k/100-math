import { mulberry32 } from "../random";

export type CoordinateMode = "quadrant" | "on-graph" | "mixed";

export interface CoordinateProblem {
  type: "quadrant" | "on-graph";
  /** Point coordinates */
  x: number;
  y: number;
  /** For "quadrant": which quadrant (1-4), 0 for on axis */
  quadrant?: number;
  /** For "on-graph": the formula y = ax, test if point is on it */
  formula?: string;
  formulaA?: number;
  /** Whether the point is on the graph */
  isOnGraph?: boolean;
  /** Answer display */
  answerDisplay: string;
}

export const generateCoordinate = (
  seed: number,
  mode: CoordinateMode = "mixed",
): CoordinateProblem[] => {
  const rng = mulberry32(seed);
  const problems: CoordinateProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < 10; i++) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const type: "quadrant" | "on-graph" =
        mode === "mixed"
          ? rng() < 0.5
            ? "quadrant"
            : "on-graph"
          : (mode as "quadrant" | "on-graph");

      if (type === "quadrant") {
        const x = Math.floor(rng() * 17) - 8; // -8 to 8
        const y = Math.floor(rng() * 17) - 8;
        if (x === 0 && y === 0) continue;

        let quadrant: number;
        if (x === 0 || y === 0) {
          quadrant = 0; // on axis
        } else if (x > 0 && y > 0) {
          quadrant = 1;
        } else if (x < 0 && y > 0) {
          quadrant = 2;
        } else if (x < 0 && y < 0) {
          quadrant = 3;
        } else {
          quadrant = 4;
        }

        const key = `q-${x}-${y}`;
        if (!seen.has(key) || attempt === 29) {
          seen.add(key);
          const answerDisplay =
            quadrant === 0
              ? "軸上"
              : `第${quadrant}象限`;
          problems.push({
            type: "quadrant",
            x,
            y,
            quadrant,
            answerDisplay,
          });
          break;
        }
      } else {
        // on-graph: is point (x, y) on y = ax?
        let a = Math.floor(rng() * 11) - 5; // -5 to 5
        if (a === 0) a = 1;
        const x = Math.floor(rng() * 11) - 5;
        if (x === 0) continue;

        const isOn = rng() < 0.5;
        let y: number;
        if (isOn) {
          y = a * x;
        } else {
          y = a * x + (rng() < 0.5 ? 1 : -1) * (Math.floor(rng() * 3) + 1);
        }

        const formula = `y = ${a === 1 ? "" : a === -1 ? "−" : a}x`;
        const key = `g-${a}-${x}-${y}`;
        if (!seen.has(key) || attempt === 29) {
          seen.add(key);
          problems.push({
            type: "on-graph",
            x,
            y,
            formula,
            formulaA: a,
            isOnGraph: isOn,
            answerDisplay: isOn ? "通る" : "通らない",
          });
          break;
        }
      }
    }
  }
  return problems;
};
