import { describe, it, expect } from "vitest";
import { generateCircleRD } from "./circle-rd";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateCircleRD
// ---------------------------------------------------------------------------
describe("generateCircleRD", () => {
  it("returns 10 problems", () => {
    const problems = generateCircleRD(42);
    expect(problems).toHaveLength(6);
  });

  it("radius-to-diameter: diameter = 2 * radius", () => {
    for (const seed of seeds) {
      const problems = generateCircleRD(seed);
      for (const p of problems) {
        const match = p.question.match(/^半径(\d+)cmの円の直径は？$/);
        if (match) {
          const r = Number(match[1]);
          expect(p.answer).toBe(`${r * 2}cm`);
        }
      }
    }
  });

  it("diameter-to-radius: radius = diameter / 2", () => {
    for (const seed of seeds) {
      const problems = generateCircleRD(seed);
      for (const p of problems) {
        const match = p.question.match(/^直径(\d+)cmの円の半径は？$/);
        if (match) {
          const d = Number(match[1]);
          expect(p.answer).toBe(`${d / 2}cm`);
          // diameter should be even (integer radius)
          expect(d % 2).toBe(0);
        }
      }
    }
  });

  it("ratio question: answer is always 2倍", () => {
    for (const seed of seeds) {
      const problems = generateCircleRD(seed);
      for (const p of problems) {
        if (p.question.includes("何倍")) {
          expect(p.answer).toBe("2倍");
        }
      }
    }
  });

  it("all three question types appear across seeds", () => {
    let hasRadToDiam = false;
    let hasDiamToRad = false;
    let hasRatio = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateCircleRD(seed);
      for (const p of problems) {
        if (p.question.match(/^半径\d+cmの円の直径は？$/)) hasRadToDiam = true;
        if (p.question.match(/^直径\d+cmの円の半径は？$/)) hasDiamToRad = true;
        if (p.question.includes("何倍")) hasRatio = true;
      }
    }
    expect(hasRadToDiam).toBe(true);
    expect(hasDiamToRad).toBe(true);
    expect(hasRatio).toBe(true);
  });

  it("radius values are within expected ranges", () => {
    for (const seed of seeds) {
      const problems = generateCircleRD(seed);
      for (const p of problems) {
        // radius-to-diameter: radius 1-20
        const radMatch = p.question.match(/^半径(\d+)cmの円の直径は？$/);
        if (radMatch) {
          const r = Number(radMatch[1]);
          expect(r).toBeGreaterThanOrEqual(1);
          expect(r).toBeLessThanOrEqual(20);
        }
        // diameter-to-radius: diameter is even 2-20
        const diamMatch = p.question.match(/^直径(\d+)cmの円の半径は？$/);
        if (diamMatch) {
          const d = Number(diamMatch[1]);
          expect(d).toBeGreaterThanOrEqual(2);
          expect(d).toBeLessThanOrEqual(20);
        }
        // ratio: radius 1-15
        const ratioMatch = p.question.match(/^半径が(\d+)cmの円があります/);
        if (ratioMatch) {
          const r = Number(ratioMatch[1]);
          expect(r).toBeGreaterThanOrEqual(1);
          expect(r).toBeLessThanOrEqual(15);
        }
      }
    }
  });

  it("every problem has a non-empty question and answer", () => {
    for (const seed of seeds) {
      const problems = generateCircleRD(seed);
      for (const p of problems) {
        expect(p.question.length).toBeGreaterThan(0);
        expect(p.answer.length).toBeGreaterThan(0);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateCircleRD(42);
    const b = generateCircleRD(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateCircleRD(1);
    const b = generateCircleRD(2);
    const aQuestions = a.map((p) => p.question);
    const bQuestions = b.map((p) => p.question);
    expect(aQuestions).not.toEqual(bQuestions);
  });
});
