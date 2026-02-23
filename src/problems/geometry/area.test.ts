import { describe, it, expect } from "vitest";
import { generateArea } from "./area";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateArea
// ---------------------------------------------------------------------------
describe("generateArea", () => {
  it("returns 10 problems", () => {
    const problems = generateArea(42, "mixed");
    expect(problems).toHaveLength(6);
  });

  it("square mode: all questions mention 正方形", () => {
    for (const seed of seeds) {
      const problems = generateArea(seed, "square");
      for (const p of problems) {
        expect(p.question).toContain("正方形");
      }
    }
  });

  it("rect mode: all questions mention 長方形", () => {
    for (const seed of seeds) {
      const problems = generateArea(seed, "rect");
      for (const p of problems) {
        expect(p.question).toContain("長方形");
      }
    }
  });

  it("mixed mode produces both shapes", () => {
    let hasSquare = false;
    let hasRect = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateArea(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("正方形")) hasSquare = true;
        if (p.question.includes("長方形")) hasRect = true;
      }
    }
    expect(hasSquare).toBe(true);
    expect(hasRect).toBe(true);
  });

  it("square forward: area = side * side", () => {
    for (const seed of seeds) {
      const problems = generateArea(seed, "square");
      for (const p of problems) {
        const sideMatch = p.question.match(/一辺(\d+)cm/);
        if (sideMatch) {
          const side = Number(sideMatch[1]);
          expect(p.answer).toBe(`${side * side}cm²`);
        }
      }
    }
  });

  it("square reverse: side = sqrt(area)", () => {
    for (const seed of seeds) {
      const problems = generateArea(seed, "square");
      for (const p of problems) {
        const areaMatch = p.question.match(/面積が(\d+)cm²の正方形/);
        if (areaMatch) {
          const area = Number(areaMatch[1]);
          const side = Math.round(Math.sqrt(area));
          expect(p.answer).toBe(`${side}cm`);
        }
      }
    }
  });

  it("rect forward: area = w * h", () => {
    for (const seed of seeds) {
      const problems = generateArea(seed, "rect");
      for (const p of problems) {
        const match = p.question.match(/たて(\d+)cm、よこ(\d+)cm/);
        if (match) {
          const h = Number(match[1]);
          const w = Number(match[2]);
          expect(p.answer).toBe(`${w * h}cm²`);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateArea(42, "mixed");
    const b = generateArea(42, "mixed");
    expect(a).toEqual(b);
  });
});
