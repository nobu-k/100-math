import { mulberry32 } from "../random";
import { numberToKanji } from "../shared/math-utils";
import type { TextProblem } from "../shared/types";

export function generateLargeNum3(
  seed: number,
  mode: "read" | "count" | "multiply" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const r = rng();
    const subMode = mode === "mixed"
      ? (r < 0.33 ? "read" : r < 0.66 ? "count" : "multiply")
      : mode;

    if (subMode === "read") {
      // read/write large numbers up to 1億
      const n = (1 + Math.floor(rng() * 9999)) * 10000; // multiples of 10000
      const kanji = numberToKanji(n);
      if (rng() < 0.5) {
        problems.push({ question: String(n), answer: kanji });
      } else {
        problems.push({ question: kanji, answer: String(n) });
      }
    } else if (subMode === "count") {
      // "45000は1000が□個"
      const units = [10, 100, 1000, 10000];
      const unit = units[Math.floor(rng() * units.length)];
      const count = 1 + Math.floor(rng() * 99);
      const n = count * unit;
      const unitKanji = numberToKanji(unit);
      problems.push({ question: `${n}は${unitKanji}が□個`, answer: `${count}` });
    } else {
      // "3200の10倍は□" or "3200の1/10は□"
      const base = (1 + Math.floor(rng() * 99)) * 100;
      if (rng() < 0.5) {
        const mul = [10, 100, 1000][Math.floor(rng() * 3)];
        problems.push({ question: `${base}の${mul}倍は？`, answer: `${base * mul}` });
      } else {
        // ensure divisible
        const divisors = base >= 1000 ? [10, 100] : [10];
        const div = divisors[Math.floor(rng() * divisors.length)];
        problems.push({ question: `${base}の1/${div}は？`, answer: `${base / div}` });
      }
    }
  }
  return problems;
}
