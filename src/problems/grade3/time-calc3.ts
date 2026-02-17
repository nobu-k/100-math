import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export function generateTimeCalc3(
  seed: number,
  mode: "after" | "duration" | "seconds" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 8; i++) {
    const r = rng();
    const subMode = mode === "mixed"
      ? (r < 0.33 ? "after" : r < 0.66 ? "duration" : "seconds")
      : mode;

    if (subMode === "seconds") {
      // seconds conversion / arithmetic
      const min = 1 + Math.floor(rng() * 5);
      const sec = Math.floor(rng() * 60);
      const totalSec = min * 60 + sec;
      if (rng() < 0.5) {
        problems.push({ question: `${min}分${sec}秒 ＝ □秒`, answer: `${totalSec}` });
      } else {
        const m2 = Math.floor(totalSec / 60);
        const s2 = totalSec % 60;
        problems.push({ question: `${totalSec}秒 ＝ □分□秒`, answer: `${m2}分${s2}秒` });
      }
    } else if (subMode === "after") {
      const hour = 1 + Math.floor(rng() * 10);
      const minute = Math.floor(rng() * 4) * 15;
      const addMin = 5 + Math.floor(rng() * 55);
      let newHour = hour;
      let newMin = minute + addMin;
      if (newMin >= 60) {
        newHour += Math.floor(newMin / 60);
        newMin = newMin % 60;
      }
      const timeStr = minute === 0 ? `${hour}時` : `${hour}時${minute}分`;
      const ansStr = newMin === 0 ? `${newHour}時` : `${newHour}時${newMin}分`;
      problems.push({ question: `${timeStr}の${addMin}分後は何時何分？`, answer: ansStr });
    } else {
      // duration
      const startHour = 1 + Math.floor(rng() * 9);
      const startMin = Math.floor(rng() * 12) * 5;
      const durH = Math.floor(rng() * 3);
      const durM = 5 + Math.floor(rng() * 11) * 5;
      const endTotalMin = startHour * 60 + startMin + durH * 60 + durM;
      const endH = Math.floor(endTotalMin / 60);
      const endM = endTotalMin % 60;
      const startStr = startMin === 0 ? `${startHour}時` : `${startHour}時${startMin}分`;
      const endStr = endM === 0 ? `${endH}時` : `${endH}時${endM}分`;
      let ansStr: string;
      if (durH === 0) ansStr = `${durM}分`;
      else if (durM === 0) ansStr = `${durH}時間`;
      else ansStr = `${durH}時間${durM}分`;
      problems.push({ question: `${startStr}から${endStr}まで何時間何分？`, answer: ansStr });
    }
  }
  return problems;
}
