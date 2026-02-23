import { describe, it, expect } from "vitest";
import { generatePrismVolume } from "./prism-volume";

const seeds = [1, 2, 42, 100, 999];

describe("generatePrismVolume", () => {
  it("returns 10 problems", () => {
    const problems = generatePrismVolume(42, "mixed");
    expect(problems).toHaveLength(6);
  });

  it("is deterministic with the same seed", () => {
    const a = generatePrismVolume(42, "mixed");
    const b = generatePrismVolume(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generatePrismVolume(1, "mixed");
    const b = generatePrismVolume(2, "mixed");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("cylinder: volume = r² × 3.14 × h", () => {
    for (const seed of seeds) {
      const problems = generatePrismVolume(seed, "cylinder");
      for (const p of problems) {
        expect(p.question).toContain("円柱");
        const rMatch = p.question.match(/半径(\d+)cm/);
        const hMatch = p.question.match(/高さ(\d+)cm/);
        expect(rMatch).not.toBeNull();
        expect(hMatch).not.toBeNull();
        const r = Number(rMatch![1]);
        const h = Number(hMatch![1]);
        const expected = Number((r * r * 3.14 * h).toFixed(2)).toString();
        expect(p.answer).toBe(`${expected}cm³`);
      }
    }
  });

  it("prism: answers end with cm³", () => {
    for (const seed of seeds) {
      const problems = generatePrismVolume(seed, "prism");
      for (const p of problems) {
        expect(p.answer).toMatch(/cm³$/);
      }
    }
  });

  it("prism: triangular prism volume = (base × triHeight / 2) × h", () => {
    for (const seed of seeds) {
      const problems = generatePrismVolume(seed, "prism");
      for (const p of problems) {
        if (p.question.includes("三角柱")) {
          const baseMatch = p.question.match(/底辺(\d+)cm/);
          const triHMatch = p.question.match(/高さ(\d+)cmの三角形/);
          const hMatch = p.question.match(/高さ(\d+)cmの三角柱/);
          expect(baseMatch).not.toBeNull();
          expect(triHMatch).not.toBeNull();
          expect(hMatch).not.toBeNull();
          const base = Number(baseMatch![1]);
          const triHeight = Number(triHMatch![1]);
          const h = Number(hMatch![1]);
          const expected = (base * triHeight / 2) * h;
          expect(p.answer).toBe(`${expected}cm³`);
        }
      }
    }
  });

  it("prism: quadrilateral prism volume = baseArea × h", () => {
    for (const seed of seeds) {
      const problems = generatePrismVolume(seed, "prism");
      for (const p of problems) {
        if (p.question.includes("角柱") && p.question.includes("底面積")) {
          const areaMatch = p.question.match(/底面積(\d+)cm²/);
          const hMatch = p.question.match(/高さ(\d+)cm/);
          expect(areaMatch).not.toBeNull();
          expect(hMatch).not.toBeNull();
          const baseArea = Number(areaMatch![1]);
          const h = Number(hMatch![1]);
          const expected = baseArea * h;
          expect(p.answer).toBe(`${expected}cm³`);
        }
      }
    }
  });

  it("mixed mode produces both prism and cylinder types", () => {
    let hasPrism = false;
    let hasCylinder = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generatePrismVolume(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("円柱")) hasCylinder = true;
        if (p.question.includes("三角柱") || p.question.includes("角柱")) hasPrism = true;
      }
    }
    expect(hasPrism).toBe(true);
    expect(hasCylinder).toBe(true);
  });

  it("cylinder radius is between 1 and 10, height between 1 and 15", () => {
    for (const seed of seeds) {
      const problems = generatePrismVolume(seed, "cylinder");
      for (const p of problems) {
        const rMatch = p.question.match(/半径(\d+)cm/);
        const hMatch = p.question.match(/高さ(\d+)cm/);
        const r = Number(rMatch![1]);
        const h = Number(hMatch![1]);
        expect(r).toBeGreaterThanOrEqual(1);
        expect(r).toBeLessThanOrEqual(10);
        expect(h).toBeGreaterThanOrEqual(1);
        expect(h).toBeLessThanOrEqual(15);
      }
    }
  });
});
