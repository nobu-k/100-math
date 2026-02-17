import { describe, it, expect } from "vitest";
import { generateLargeNum } from "./large-num";
import { numberToKanji } from "../shared/math-utils";

const seeds = [1, 2, 42, 100, 999];

describe("generateLargeNum", () => {
  it("returns 10 problems", () => {
    const problems = generateLargeNum(42, 1000);
    expect(problems).toHaveLength(10);
  });

  it("question-answer pairs are consistent (number <-> kanji)", () => {
    for (const seed of seeds) {
      for (const maxRange of [100, 1000, 10000]) {
        const problems = generateLargeNum(seed, maxRange);
        for (const p of problems) {
          const numVal = Number(p.question);
          if (!isNaN(numVal)) {
            expect(p.answer).toBe(numberToKanji(numVal));
          } else {
            const ansNum = Number(p.answer);
            expect(p.question).toBe(numberToKanji(ansNum));
          }
        }
      }
    }
  });

  it("values are within the expected range based on maxRange", () => {
    for (const seed of seeds) {
      const problems100 = generateLargeNum(seed, 100);
      for (const p of problems100) {
        const numVal = Number(p.question) || Number(p.answer);
        expect(numVal).toBeGreaterThanOrEqual(10);
        expect(numVal).toBeLessThan(100);
      }
      const problems1000 = generateLargeNum(seed, 1000);
      for (const p of problems1000) {
        const numVal = Number(p.question) || Number(p.answer);
        expect(numVal).toBeGreaterThanOrEqual(100);
        expect(numVal).toBeLessThan(1000);
      }
      const problems10000 = generateLargeNum(seed, 10000);
      for (const p of problems10000) {
        const numVal = Number(p.question) || Number(p.answer);
        expect(numVal).toBeGreaterThanOrEqual(1000);
        expect(numVal).toBeLessThan(10000);
      }
    }
  });

  it("produces both directions (number->kanji and kanji->number)", () => {
    let hasNumToKanji = false;
    let hasKanjiToNum = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateLargeNum(seed, 1000);
      for (const p of problems) {
        if (!isNaN(Number(p.question))) hasNumToKanji = true;
        else hasKanjiToNum = true;
      }
    }
    expect(hasNumToKanji).toBe(true);
    expect(hasKanjiToNum).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const a = generateLargeNum(42, 1000);
    const b = generateLargeNum(42, 1000);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateLargeNum(1, 1000);
    const b = generateLargeNum(2, 1000);
    const aQs = a.map((p) => p.question);
    const bQs = b.map((p) => p.question);
    expect(aQs).not.toEqual(bQs);
  });
});
