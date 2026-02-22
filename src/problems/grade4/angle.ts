import { mulberry32 } from "../random";

export interface AngleProblem {
  display: string;
  answer: number;
}

export const generateAngle = (seed: number): AngleProblem[] => {
  const rng = mulberry32(seed);
  const problems: AngleProblem[] = [];
  const baseAngles = [30, 45, 60, 90, 120, 135, 150];

  for (let i = 0; i < 10; i++) {
    const type = Math.floor(rng() * 3);
    switch (type) {
      case 0: {
        const x = baseAngles[Math.floor(rng() * baseAngles.length)];
        problems.push({ display: `180° − ${x}°`, answer: 180 - x });
        break;
      }
      case 1: {
        const x = baseAngles[Math.floor(rng() * baseAngles.length)];
        const y = baseAngles[Math.floor(rng() * baseAngles.length)];
        if (x + y <= 360) {
          problems.push({ display: `${x}° ＋ ${y}°`, answer: x + y });
        } else {
          problems.push({ display: `${x}° ＋ ${30}°`, answer: x + 30 });
        }
        break;
      }
      default: {
        const x = 90 + baseAngles[Math.floor(rng() * 4)];
        problems.push({ display: `360° − ${x}°`, answer: 360 - x });
        break;
      }
    }
  }
  return problems;
};
