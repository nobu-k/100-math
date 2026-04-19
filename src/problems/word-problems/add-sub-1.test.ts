import { describe, it, expect } from "vitest";
import { generateAddSub1 } from "./add-sub-1";

const seeds = [1, 2, 42, 100, 999];

const extractNumbers = (s: string): number[] =>
  [...s.matchAll(/\d+/g)].map((m) => Number(m[0]));

const parseAnswer = (s: string): number => Number(s.match(/=(\d+)/)![1]);

describe("generateAddSub1", () => {
  it("returns 8 problems", () => {
    expect(generateAddSub1(42, 10, "mixed")).toHaveLength(8);
  });

  it("every problem has a non-empty question and answer", () => {
    for (const seed of seeds) {
      for (const p of generateAddSub1(seed, 10, "mixed")) {
        expect(p.question.length).toBeGreaterThan(0);
        expect(p.answer.length).toBeGreaterThan(0);
      }
    }
  });

  it("add mode: answer equals sum of first two numbers", () => {
    for (const seed of seeds) {
      for (const p of generateAddSub1(seed, 10, "add")) {
        const [a, b] = extractNumbers(p.question);
        expect(parseAnswer(p.answer)).toBe(a + b);
      }
    }
  });

  it("sub mode: answer equals difference of first two numbers and is positive", () => {
    for (const seed of seeds) {
      for (const p of generateAddSub1(seed, 10, "sub")) {
        const [a, b] = extractNumbers(p.question);
        expect(a).toBeGreaterThan(b);
        expect(parseAnswer(p.answer)).toBe(a - b);
        expect(parseAnswer(p.answer)).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("mixed mode: every problem is either a sum or a difference", () => {
    for (const seed of seeds) {
      for (const p of generateAddSub1(seed, 10, "mixed")) {
        const [a, b] = extractNumbers(p.question);
        const ans = parseAnswer(p.answer);
        const isAdd = ans === a + b;
        const isSub = a >= b && ans === a - b;
        expect(isAdd || isSub).toBe(true);
      }
    }
  });

  it("mixed mode: produces both addition and subtraction across seeds", () => {
    let hasAdd = false;
    let hasSub = false;
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      for (const p of generateAddSub1(seed, 10, "mixed")) {
        const [a, b] = extractNumbers(p.question);
        const ans = parseAnswer(p.answer);
        if (ans === a + b && a + b !== a - b) hasAdd = true;
        if (ans === a - b && a + b !== a - b) hasSub = true;
      }
    }
    expect(hasAdd).toBe(true);
    expect(hasSub).toBe(true);
  });

  it("respects max bound: all input numbers <= max", () => {
    for (const seed of seeds) {
      for (const p of generateAddSub1(seed, 10, "mixed")) {
        for (const n of extractNumbers(p.question)) {
          expect(n).toBeLessThanOrEqual(10);
          expect(n).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });

  it("max=20 still keeps numbers within bound", () => {
    for (const seed of seeds) {
      for (const p of generateAddSub1(seed, 20, "mixed")) {
        const [a, b] = extractNumbers(p.question);
        const ans = parseAnswer(p.answer);
        expect(Math.max(a, b, ans)).toBeLessThanOrEqual(20);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    expect(generateAddSub1(42, 10, "mixed")).toEqual(generateAddSub1(42, 10, "mixed"));
  });

  it("produces different results with different seeds", () => {
    const a = generateAddSub1(1, 10, "mixed").map((p) => p.question);
    const b = generateAddSub1(2, 10, "mixed").map((p) => p.question);
    expect(a).not.toEqual(b);
  });

  it("uses varied verbs/phrases (not just object swapping)", () => {
    const cues = [
      "あわせて", "ぜんぶで", "みんなで",
      "もらいました", "きました", "とんできました", "かいました",
      "のこり", "のこっているのは",
      "たべました", "つかいました", "あげました",
      "とんでいきました", "われてしまいました",
      "よりなん",
      "そのうち",
    ];
    const seen = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      for (const p of generateAddSub1(seed, 10, "mixed")) {
        for (const cue of cues) {
          if (p.question.includes(cue)) seen.add(cue);
        }
      }
    }
    expect(seen.size).toBeGreaterThanOrEqual(10);
  });

  it("difference template always has a > b (no negative answers)", () => {
    for (const seed of seeds) {
      for (const p of generateAddSub1(seed, 20, "sub")) {
        if (p.question.includes("よりなん")) {
          const [a, b] = extractNumbers(p.question);
          expect(a).toBeGreaterThan(b);
        }
      }
    }
  });

  it("missing-part template: the answer is total minus the known part", () => {
    for (const seed of seeds) {
      for (const p of generateAddSub1(seed, 20, "sub")) {
        if (p.question.includes("そのうち")) {
          const [total, known] = extractNumbers(p.question);
          expect(parseAnswer(p.answer)).toBe(total - known);
        }
      }
    }
  });

  it("hiragana script: questions and answers contain no CJK kanji", () => {
    const hasKanji = (s: string) => /[\u4e00-\u9fff]/.test(s);
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 42, 100]) {
      for (const p of generateAddSub1(seed, 20, "mixed", "hiragana")) {
        expect(hasKanji(p.question), `question: ${p.question}`).toBe(false);
        expect(hasKanji(p.answer), `answer: ${p.answer}`).toBe(false);
      }
    }
  });

  it("hiragana script preserves math correctness", () => {
    for (const seed of seeds) {
      for (const p of generateAddSub1(seed, 10, "mixed", "hiragana")) {
        const [a, b] = extractNumbers(p.question);
        const ans = parseAnswer(p.answer);
        const isAdd = ans === a + b;
        const isSub = a >= b && ans === a - b;
        expect(isAdd || isSub).toBe(true);
      }
    }
  });

  it("hiragana script is the default (unchanged from omitted arg)", () => {
    expect(generateAddSub1(42, 10, "mixed")).toEqual(generateAddSub1(42, 10, "mixed", "hiragana"));
  });

  // -------------------------------------------------------------------------
  // Two-operator (three-operand) problems
  // -------------------------------------------------------------------------

  it("ops=two with mode=mixed produces all four patterns across seeds", () => {
    const found = new Set<string>();
    for (let seed = 1; seed <= 40; seed++) {
      for (const p of generateAddSub1(seed, 20, "mixed", "kanji", "two")) {
        const [a, b, c] = extractNumbers(p.question);
        const ans = parseAnswer(p.answer);
        if (ans === a + b + c) found.add("++");
        else if (ans === a + b - c) found.add("+-");
        else if (ans === a - b + c) found.add("-+");
        else if (ans === a - b - c) found.add("--");
      }
    }
    expect(found.has("++")).toBe(true);
    expect(found.has("+-")).toBe(true);
    expect(found.has("-+")).toBe(true);
    expect(found.has("--")).toBe(true);
  });

  it("ops=two with mode=add produces only ++ pattern", () => {
    for (const seed of seeds) {
      for (const p of generateAddSub1(seed, 20, "add", "kanji", "two")) {
        const [a, b, c] = extractNumbers(p.question);
        expect(parseAnswer(p.answer)).toBe(a + b + c);
      }
    }
  });

  it("ops=two with mode=sub produces only -- pattern", () => {
    for (const seed of seeds) {
      for (const p of generateAddSub1(seed, 20, "sub", "kanji", "two")) {
        const [a, b, c] = extractNumbers(p.question);
        expect(parseAnswer(p.answer)).toBe(a - b - c);
      }
    }
  });

  it("ops=two: every intermediate value stays >= 1 (no negatives mid-problem)", () => {
    for (const seed of seeds) {
      for (const p of generateAddSub1(seed, 20, "mixed", "kanji", "two")) {
        const [a, b, c] = extractNumbers(p.question);
        const ans = parseAnswer(p.answer);
        if (ans === a + b - c) {
          // a+b is the intermediate; must be >= c and result >= 1
          expect(a + b - c).toBeGreaterThanOrEqual(1);
        } else if (ans === a - b + c) {
          expect(a - b).toBeGreaterThanOrEqual(1);
          expect(a - b + c).toBeGreaterThanOrEqual(1);
        } else if (ans === a - b - c) {
          expect(a - b).toBeGreaterThanOrEqual(1);
          expect(a - b - c).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });

  it("ops=two: operands and result respect max bound", () => {
    for (const seed of seeds) {
      for (const p of generateAddSub1(seed, 20, "mixed", "kanji", "two")) {
        const nums = extractNumbers(p.question);
        const ans = parseAnswer(p.answer);
        for (const n of nums) expect(n).toBeLessThanOrEqual(20);
        expect(ans).toBeLessThanOrEqual(20);
        expect(ans).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("ops=two works with hiragana script (no kanji)", () => {
    const hasKanji = (s: string) => /[\u4e00-\u9fff]/.test(s);
    for (const seed of [1, 2, 3, 4, 5]) {
      for (const p of generateAddSub1(seed, 20, "mixed", "hiragana", "two")) {
        expect(hasKanji(p.question), `question: ${p.question}`).toBe(false);
        expect(hasKanji(p.answer), `answer: ${p.answer}`).toBe(false);
      }
    }
  });

  it("ops=mixed produces both one-operator and two-operator problems", () => {
    let has1 = false;
    let has2 = false;
    for (let seed = 1; seed <= 30; seed++) {
      for (const p of generateAddSub1(seed, 20, "mixed", "kanji", "mixed")) {
        const nums = extractNumbers(p.question);
        if (nums.length === 2) has1 = true;
        if (nums.length === 3) has2 = true;
      }
    }
    expect(has1).toBe(true);
    expect(has2).toBe(true);
  });

  it("ops=two uses temporal markers (そのあと, etc.) cueing a second step", () => {
    const markers = ["そのあと", "つぎ", "あさ", "ひる"];
    let count = 0;
    for (const seed of seeds) {
      for (const p of generateAddSub1(seed, 20, "mixed", "kanji", "two")) {
        if (markers.some((m) => p.question.includes(m))) count++;
      }
    }
    expect(count).toBeGreaterThan(0);
  });

  it("ops=two is deterministic with the same seed", () => {
    expect(generateAddSub1(42, 20, "mixed", "kanji", "two"))
      .toEqual(generateAddSub1(42, 20, "mixed", "kanji", "two"));
  });
});
