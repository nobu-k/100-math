import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export const generateScale = (seed: number): TextProblem[] => {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const scales = [1000, 2000, 5000, 10000, 25000, 50000];

  for (let i = 0; i < 10; i++) {
    const scale = scales[Math.floor(rng() * scales.length)];

    if (rng() < 0.5) {
      // map → real
      const mapCm = 1 + Math.floor(rng() * 20);
      const realCm = mapCm * scale;
      const realM = realCm / 100;
      if (realM >= 1000) {
        problems.push({
          question: `縮尺1/${scale}の地図で${mapCm}cmは実際には何km？`,
          answer: `${realM / 1000}km`,
        });
      } else {
        problems.push({
          question: `縮尺1/${scale}の地図で${mapCm}cmは実際には何m？`,
          answer: `${realM}m`,
        });
      }
    } else {
      // real → map
      const realM = (1 + Math.floor(rng() * 20)) * (scale >= 10000 ? 100 : 10);
      const mapCm = (realM * 100) / scale;
      const mapStr = Number.isInteger(mapCm) ? String(mapCm) : Number(mapCm.toFixed(1)).toString();
      problems.push({
        question: `実際の距離${realM}mを縮尺1/${scale}の地図に描くと何cm？`,
        answer: `${mapStr}cm`,
      });
    }
  }
  return problems;
};
