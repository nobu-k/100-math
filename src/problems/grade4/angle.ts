import { mulberry32 } from "../random";

export interface AngleFigure {
  type: "supplement" | "addition" | "full-rotation";
  angles: number[];
}

export interface AngleProblem {
  display: string;
  answer: number;
  figure: AngleFigure;
}

export const generateAngle = (seed: number): AngleProblem[] => {
  const rng = mulberry32(seed);
  const problems: AngleProblem[] = [];
  const baseAngles = [30, 45, 60, 90, 120, 135, 150];

  for (let i = 0; i < 6; i++) {
    const type = Math.floor(rng() * 3);
    switch (type) {
      case 0: {
        const x = baseAngles[Math.floor(rng() * baseAngles.length)];
        problems.push({
          display: `180° − ${x}°`,
          answer: 180 - x,
          figure: { type: "supplement", angles: [x] },
        });
        break;
      }
      case 1: {
        const x = baseAngles[Math.floor(rng() * baseAngles.length)];
        const y = baseAngles[Math.floor(rng() * baseAngles.length)];
        if (x + y <= 360) {
          problems.push({
            display: `${x}° ＋ ${y}°`,
            answer: x + y,
            figure: { type: "addition", angles: [x, y] },
          });
        } else {
          problems.push({
            display: `${x}° ＋ ${30}°`,
            answer: x + 30,
            figure: { type: "addition", angles: [x, 30] },
          });
        }
        break;
      }
      default: {
        const x = 90 + baseAngles[Math.floor(rng() * 4)];
        problems.push({
          display: `360° − ${x}°`,
          answer: 360 - x,
          figure: { type: "full-rotation", angles: [x] },
        });
        break;
      }
    }
  }
  return problems;
};
