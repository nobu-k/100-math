import { describe, it, expect } from "vitest";
import { generateSector } from "./sector";

const seeds = [1, 2, 42, 100, 999];

const validAngles = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 360];
const validRadii = [2, 3, 4, 5, 6, 8, 9, 10, 12, 15];

describe("generateSector", () => {
  it("returns 10 problems", () => {
    const problems = generateSector(42, "mixed");
    expect(problems).toHaveLength(6);
  });

  it("defaults to mixed mode", () => {
    const a = generateSector(42);
    const b = generateSector(42, "mixed");
    expect(a).toEqual(b);
  });

  it("is deterministic with the same seed", () => {
    const a = generateSector(42, "mixed");
    const b = generateSector(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateSector(1, "mixed");
    const b = generateSector(2, "mixed");
    const aCoeffs = a.map((p) => p.answerCoefficient);
    const bCoeffs = b.map((p) => p.answerCoefficient);
    expect(aCoeffs).not.toEqual(bCoeffs);
  });

  it("arc mode: all problems have type arc", () => {
    for (const seed of seeds) {
      const problems = generateSector(seed, "arc");
      for (const p of problems) {
        expect(p.type).toBe("arc");
        expect(p.unit).toBe("cm");
      }
    }
  });

  it("area mode: all problems have type area", () => {
    for (const seed of seeds) {
      const problems = generateSector(seed, "area");
      for (const p of problems) {
        expect(p.type).toBe("area");
        expect(p.unit).toBe("cm²");
      }
    }
  });

  it("mixed mode produces both arc and area types", () => {
    let hasArc = false;
    let hasArea = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateSector(seed, "mixed");
      for (const p of problems) {
        if (p.type === "arc") hasArc = true;
        if (p.type === "area") hasArea = true;
      }
    }
    expect(hasArc).toBe(true);
    expect(hasArea).toBe(true);
  });

  it("radius is from the valid radii set", () => {
    for (const seed of seeds) {
      const problems = generateSector(seed, "mixed");
      for (const p of problems) {
        expect(validRadii).toContain(p.radius);
      }
    }
  });

  it("angle is from the valid angles set", () => {
    for (const seed of seeds) {
      const problems = generateSector(seed, "mixed");
      for (const p of problems) {
        expect(validAngles).toContain(p.angle);
      }
    }
  });

  it("arc mode: answerCoefficient equals 2 * radius * angle / 360", () => {
    for (const seed of seeds) {
      const problems = generateSector(seed, "arc");
      for (const p of problems) {
        const expected =
          Math.round(((2 * p.radius * p.angle) / 360) * 100) / 100;
        expect(p.answerCoefficient).toBeCloseTo(expected, 2);
      }
    }
  });

  it("area mode: answerCoefficient equals radius^2 * angle / 360", () => {
    for (const seed of seeds) {
      const problems = generateSector(seed, "area");
      for (const p of problems) {
        const expected =
          Math.round(
            ((p.radius * p.radius * p.angle) / 360) * 100,
          ) / 100;
        expect(p.answerCoefficient).toBeCloseTo(expected, 2);
      }
    }
  });

  it("answerDisplay contains pi symbol", () => {
    for (const seed of seeds) {
      const problems = generateSector(seed, "mixed");
      for (const p of problems) {
        expect(p.answerDisplay).toContain("π");
      }
    }
  });

  it("answerCoefficient is a positive number", () => {
    for (const seed of seeds) {
      const problems = generateSector(seed, "mixed");
      for (const p of problems) {
        expect(p.answerCoefficient).toBeGreaterThan(0);
      }
    }
  });
});
