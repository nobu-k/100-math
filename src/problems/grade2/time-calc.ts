import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export function generateTimeCalc(
  seed: number,
  calcType: "after" | "duration" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 8; i++) {
    const useAfter =
      calcType === "after" ? true : calcType === "duration" ? false : rng() < 0.5;

    if (useAfter) {
      const hour = 1 + Math.floor(rng() * 10);
      const minute = Math.floor(rng() * 6) * 10;
      const addMin = (1 + Math.floor(rng() * 5)) * 10;
      let newHour = hour;
      let newMin = minute + addMin;
      if (newMin >= 60) {
        newHour += Math.floor(newMin / 60);
        newMin = newMin % 60;
      }
      const timeStr = minute === 0 ? `${hour}時` : `${hour}時${minute}分`;
      const ansStr = newMin === 0 ? `${newHour}時` : `${newHour}時${newMin}分`;
      problems.push({
        question: `${timeStr}の${addMin}分後は何時何分？`,
        answer: ansStr,
      });
    } else {
      const startHour = 1 + Math.floor(rng() * 9);
      const startMin = Math.floor(rng() * 4) * 15;
      const endHour = startHour + 1 + Math.floor(rng() * 2);
      const endMin = Math.floor(rng() * 4) * 15;
      let diffH = endHour - startHour;
      let diffM = endMin - startMin;
      if (diffM < 0) { diffH -= 1; diffM += 60; }
      const startStr = startMin === 0 ? `${startHour}時` : `${startHour}時${startMin}分`;
      const endStr = endMin === 0 ? `${endHour}時` : `${endHour}時${endMin}分`;
      let ansStr: string;
      if (diffH === 0) ansStr = `${diffM}分`;
      else if (diffM === 0) ansStr = `${diffH}時間`;
      else ansStr = `${diffH}時間${diffM}分`;
      problems.push({ question: `${startStr}から${endStr}まで何時間何分？`, answer: ansStr });
    }
  }
  return problems;
}
