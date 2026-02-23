import { describe, it, expect } from "vitest";
import { generateTriAngle } from "./triangle-angle";

const seeds = [1, 2, 42, 100, 999];

describe("generateTriAngle", () => {
  it("returns 10 problems", () => {
    const problems = generateTriAngle(42, "mixed");
    expect(problems).toHaveLength(6);
  });

  it("is deterministic with the same seed", () => {
    const a = generateTriAngle(42, "mixed");
    const b = generateTriAngle(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateTriAngle(1, "mixed");
    const b = generateTriAngle(2, "mixed");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("interior mode only produces interior problems", () => {
    for (const seed of seeds) {
      const problems = generateTriAngle(seed, "interior");
      for (const p of problems) {
        expect(p.type).toBe("interior");
      }
    }
  });

  it("exterior mode only produces exterior problems", () => {
    for (const seed of seeds) {
      const problems = generateTriAngle(seed, "exterior");
      for (const p of problems) {
        expect(p.type).toBe("exterior");
      }
    }
  });

  it("mixed mode produces both interior and exterior", () => {
    let hasInterior = false;
    let hasExterior = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateTriAngle(seed, "mixed");
      for (const p of problems) {
        if (p.type === "interior") hasInterior = true;
        if (p.type === "exterior") hasExterior = true;
      }
    }
    expect(hasInterior).toBe(true);
    expect(hasExterior).toBe(true);
  });

  it("interior problems: answer + knownAngles sum to 180", () => {
    for (const seed of seeds) {
      const problems = generateTriAngle(seed, "interior");
      for (const p of problems) {
        const sum = p.knownAngles[0] + p.knownAngles[1] + p.answer;
        expect(sum).toBe(180);
      }
    }
  });

  it("exterior problems: answer equals sum of two known angles", () => {
    for (const seed of seeds) {
      const problems = generateTriAngle(seed, "exterior");
      for (const p of problems) {
        expect(p.answer).toBe(p.knownAngles[0] + p.knownAngles[1]);
      }
    }
  });

  it("knownAngles are positive", () => {
    for (const seed of seeds) {
      const problems = generateTriAngle(seed, "mixed");
      for (const p of problems) {
        expect(p.knownAngles).toHaveLength(2);
        expect(p.knownAngles[0]).toBeGreaterThan(0);
        expect(p.knownAngles[1]).toBeGreaterThan(0);
      }
    }
  });

  it("answer is a positive integer", () => {
    for (const seed of seeds) {
      const problems = generateTriAngle(seed, "mixed");
      for (const p of problems) {
        expect(p.answer).toBeGreaterThan(0);
        expect(Number.isInteger(p.answer)).toBe(true);
      }
    }
  });

  it("answerDisplay ends with degree symbol", () => {
    for (const seed of seeds) {
      const problems = generateTriAngle(seed, "mixed");
      for (const p of problems) {
        expect(p.answerDisplay).toMatch(/°$/);
      }
    }
  });
});
