import { describe, it, expect } from "vitest";
import { generateAddSub1 } from "./add-sub-1";

const seeds = [1, 2, 42, 100, 999];

const extractNumbers = (s: string): number[] =>
  [...s.matchAll(/\d+/g)].map((m) => Number(m[0]));

const parseAnswer = (s: string): number => Number(s.match(/\d+/)![0]);

describe("generateAddSub1", () => {
  it("returns 10 problems", () => {
    expect(generateAddSub1(42, 10, "mixed")).toHaveLength(10);
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
});
