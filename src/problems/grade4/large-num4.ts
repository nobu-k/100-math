import { mulberry32 } from "../random";
import { numberToKanji } from "../shared/math-utils";
import type { TextProblem } from "../shared/types";

export function generateLargeNum4(
  seed: number,
  mode: "read" | "position" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const sub = mode === "mixed" ? (rng() < 0.5 ? "read" : "position") : mode;

    if (sub === "read") {
      // Large numbers with 億・兆
      const scale = rng() < 0.5 ? 1e8 : 1e12; // 億 or 兆
      const n = (1 + Math.floor(rng() * 9)) * scale
        + Math.floor(rng() * 10000) * (scale / 10000);
      const rounded = Math.round(n / 10000) * 10000;
      const kanji = numberToKanji(rounded);
      if (rng() < 0.5) {
        problems.push({ question: kanji, answer: String(rounded) });
      } else {
        problems.push({ question: String(rounded), answer: kanji });
      }
    } else {
      // Position questions: "5億は1億が□個"
      const units = [
        { val: 1e8, name: "一億" },
        { val: 1e4, name: "一万" },
        { val: 1e12, name: "一兆" },
      ];
      const u = units[Math.floor(rng() * units.length)];
      const count = 1 + Math.floor(rng() * 9);
      const n = count * u.val;
      const nKanji = numberToKanji(n);
      problems.push({ question: `${nKanji}は${u.name}が□個`, answer: `${count}` });
    }
  }
  return problems;
}
