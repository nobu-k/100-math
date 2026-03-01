import { mulberry32 } from "../random";

export interface ClockProblem {
  hour: number;   // 1‑12
  minute: number; // 0‑59
}

export const generateClock = (
  seed: number,
  precision: "hour" | "half" | "5min" | "1min",
): ClockProblem[] => {
  const rng = mulberry32(seed);
  const problems: ClockProblem[] = [];
  for (let i = 0; i < 9; i++) {
    const hour = 1 + Math.floor(rng() * 12);
    let minute: number;
    switch (precision) {
      case "hour":
        minute = 0;
        break;
      case "half":
        minute = rng() < 0.5 ? 0 : 30;
        break;
      case "5min":
        minute = Math.floor(rng() * 12) * 5;
        break;
      case "1min":
        minute = Math.floor(rng() * 60);
        break;
    }
    problems.push({ hour, minute });
  }
  return problems;
};
