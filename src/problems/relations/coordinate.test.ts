import { describe, it, expect } from "vitest";
import { generateCoordinate } from "./coordinate";

const seeds = [1, 2, 42, 100, 999];

describe("generateCoordinate", () => {
  it("returns 6 problems", () => {
    const problems = generateCoordinate(42, "mixed");
    expect(problems).toHaveLength(6);
  });

  it("defaults to mixed mode", () => {
    const a = generateCoordinate(42);
    const b = generateCoordinate(42, "mixed");
    expect(a).toEqual(b);
  });

  it("is deterministic with the same seed", () => {
    const a = generateCoordinate(42, "mixed");
    const b = generateCoordinate(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateCoordinate(1, "mixed");
    const b = generateCoordinate(2, "mixed");
    const aDisplays = a.map((p) => p.answerDisplay);
    const bDisplays = b.map((p) => p.answerDisplay);
    expect(aDisplays).not.toEqual(bDisplays);
  });

  it("quadrant mode: all problems have type quadrant", () => {
    for (const seed of seeds) {
      const problems = generateCoordinate(seed, "quadrant");
      for (const p of problems) {
        expect(p.type).toBe("quadrant");
      }
    }
  });

  it("on-graph mode: all problems have type on-graph", () => {
    for (const seed of seeds) {
      const problems = generateCoordinate(seed, "on-graph");
      for (const p of problems) {
        expect(p.type).toBe("on-graph");
      }
    }
  });

  it("mixed mode produces both quadrant and on-graph types", () => {
    let hasQuadrant = false;
    let hasOnGraph = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateCoordinate(seed, "mixed");
      for (const p of problems) {
        if (p.type === "quadrant") hasQuadrant = true;
        if (p.type === "on-graph") hasOnGraph = true;
      }
    }
    expect(hasQuadrant).toBe(true);
    expect(hasOnGraph).toBe(true);
  });

  it("quadrant mode: quadrant is correctly determined from coordinates", () => {
    for (const seed of seeds) {
      const problems = generateCoordinate(seed, "quadrant");
      for (const p of problems) {
        if (p.x === 0 || p.y === 0) {
          expect(p.quadrant).toBe(0);
          expect(p.answerDisplay).toBe("軸上");
        } else if (p.x > 0 && p.y > 0) {
          expect(p.quadrant).toBe(1);
        } else if (p.x < 0 && p.y > 0) {
          expect(p.quadrant).toBe(2);
        } else if (p.x < 0 && p.y < 0) {
          expect(p.quadrant).toBe(3);
        } else {
          expect(p.quadrant).toBe(4);
        }
      }
    }
  });

  it("on-graph mode: isOnGraph is correct for y = ax", () => {
    for (const seed of seeds) {
      const problems = generateCoordinate(seed, "on-graph");
      for (const p of problems) {
        expect(p.formulaA).toBeDefined();
        expect(p.isOnGraph).toBeDefined();
        const expectedY = p.formulaA! * p.x;
        expect(p.isOnGraph).toBe(p.y === expectedY);
        if (p.isOnGraph) {
          expect(p.answerDisplay).toBe("通る");
        } else {
          expect(p.answerDisplay).toBe("通らない");
        }
      }
    }
  });

  it("coordinates are within expected range", () => {
    for (const seed of seeds) {
      const problems = generateCoordinate(seed, "quadrant");
      for (const p of problems) {
        expect(p.x).toBeGreaterThanOrEqual(-8);
        expect(p.x).toBeLessThanOrEqual(8);
        expect(p.y).toBeGreaterThanOrEqual(-8);
        expect(p.y).toBeLessThanOrEqual(8);
      }
    }
  });
});
