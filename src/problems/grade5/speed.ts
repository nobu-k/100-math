import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export function generateSpeed(
  seed: number,
  find: "speed" | "time" | "distance" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const type = find === "mixed"
      ? (["speed", "time", "distance"] as const)[Math.floor(rng() * 3)]
      : find;

    const speed = (3 + Math.floor(rng() * 18)) * 10;
    const time = 1 + Math.floor(rng() * 8);
    const distance = speed * time;

    switch (type) {
      case "distance":
        problems.push({ question: `時速${speed}kmで${time}時間走ると何km？`, answer: `${distance}km` });
        break;
      case "time":
        problems.push({ question: `${distance}kmを時速${speed}kmで走ると何時間？`, answer: `${time}時間` });
        break;
      case "speed":
        problems.push({ question: `${distance}kmを${time}時間で走ったときの時速は？`, answer: `時速${speed}km` });
        break;
    }
  }
  return problems;
}
