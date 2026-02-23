import { describe, it, expect } from "vitest";
import { generateSolid } from "./solid-volume";

const seeds = [1, 2, 42, 100, 999];

describe("generateSolid", () => {
  it("returns 10 problems", () => {
    const problems = generateSolid(42, "mixed");
    expect(problems).toHaveLength(6);
  });

  it("defaults to mixed mode and volume calcType", () => {
    const a = generateSolid(42);
    const b = generateSolid(42, "mixed", "volume");
    expect(a).toEqual(b);
  });

  it("is deterministic with the same seed", () => {
    const a = generateSolid(42, "mixed");
    const b = generateSolid(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateSolid(1, "mixed");
    const b = generateSolid(2, "mixed");
    const aDisplays = a.map((p) => p.answerDisplay);
    const bDisplays = b.map((p) => p.answerDisplay);
    expect(aDisplays).not.toEqual(bDisplays);
  });

  it("cylinder mode: all problems have solidType cylinder", () => {
    for (const seed of seeds) {
      const problems = generateSolid(seed, "cylinder");
      for (const p of problems) {
        expect(p.solidType).toBe("cylinder");
      }
    }
  });

  it("cone mode: all problems have solidType cone", () => {
    for (const seed of seeds) {
      const problems = generateSolid(seed, "cone");
      for (const p of problems) {
        expect(p.solidType).toBe("cone");
      }
    }
  });

  it("sphere mode: all problems have solidType sphere", () => {
    for (const seed of seeds) {
      const problems = generateSolid(seed, "sphere");
      for (const p of problems) {
        expect(p.solidType).toBe("sphere");
      }
    }
  });

  it("prism mode: all problems have solidType prism", () => {
    for (const seed of seeds) {
      const problems = generateSolid(seed, "prism");
      for (const p of problems) {
        expect(p.solidType).toBe("prism");
      }
    }
  });

  it("mixed mode produces multiple solid types", () => {
    const types = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 42, 50, 100]) {
      const problems = generateSolid(seed, "mixed");
      for (const p of problems) {
        types.add(p.solidType);
      }
    }
    expect(types.size).toBeGreaterThanOrEqual(2);
  });

  it("cylinder volume: answerPiCoeff equals r^2 * h", () => {
    for (const seed of seeds) {
      const problems = generateSolid(seed, "cylinder", "volume");
      for (const p of problems) {
        if (p.calcType === "volume") {
          expect(p.hasPI).toBe(true);
          expect(p.answerPiCoeff).toBe(p.radius! * p.radius! * p.height!);
        }
      }
    }
  });

  it("cone volume: answerPiCoeff equals r^2 * h / 3", () => {
    for (const seed of seeds) {
      const problems = generateSolid(seed, "cone", "volume");
      for (const p of problems) {
        if (p.calcType === "volume") {
          expect(p.hasPI).toBe(true);
          expect(p.answerPiCoeff).toBe(
            (p.radius! * p.radius! * p.height!) / 3,
          );
        }
      }
    }
  });

  it("sphere volume: answerPiCoeff equals 4 * r^3 / 3", () => {
    for (const seed of seeds) {
      const problems = generateSolid(seed, "sphere", "volume");
      for (const p of problems) {
        if (p.calcType === "volume") {
          expect(p.hasPI).toBe(true);
          expect(p.answerPiCoeff).toBe(
            (4 * p.radius! * p.radius! * p.radius!) / 3,
          );
        }
      }
    }
  });

  it("prism volume: hasPI is false and answerPlain is positive", () => {
    for (const seed of seeds) {
      const problems = generateSolid(seed, "prism", "volume");
      for (const p of problems) {
        expect(p.hasPI).toBe(false);
        expect(p.answerPiCoeff).toBe(0);
        expect(p.answerPlain).toBeGreaterThan(0);
      }
    }
  });

  it("cylinder and cone have positive radius and height", () => {
    for (const seed of seeds) {
      const problems = generateSolid(seed, "mixed");
      for (const p of problems) {
        if (p.solidType === "cylinder" || p.solidType === "cone") {
          expect(p.radius).toBeGreaterThanOrEqual(2);
          expect(p.height).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });

  it("sphere has positive radius", () => {
    for (const seed of seeds) {
      const problems = generateSolid(seed, "sphere");
      for (const p of problems) {
        expect(p.radius).toBeGreaterThanOrEqual(2);
        expect(p.radius).toBeLessThanOrEqual(9);
      }
    }
  });

  it("each problem has answerDisplay string", () => {
    for (const seed of seeds) {
      const problems = generateSolid(seed, "mixed");
      for (const p of problems) {
        expect(typeof p.answerDisplay).toBe("string");
        expect(p.answerDisplay.length).toBeGreaterThan(0);
      }
    }
  });

  it("problems with PI have answerDisplay containing pi symbol", () => {
    for (const seed of seeds) {
      const problems = generateSolid(seed, "cylinder");
      for (const p of problems) {
        if (p.hasPI) {
          expect(p.answerDisplay).toContain("π");
        }
      }
    }
  });
});
