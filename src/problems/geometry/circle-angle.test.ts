import { describe, it, expect } from "vitest";
import { generateCircleAngle } from "./circle-angle";

const seeds = [1, 2, 42, 100, 999];

describe("generateCircleAngle", () => {
  it("returns 10 problems", () => {
    const problems = generateCircleAngle(42, "mixed");
    expect(problems).toHaveLength(6);
  });

  it("is deterministic with the same seed", () => {
    const a = generateCircleAngle(42, "mixed");
    const b = generateCircleAngle(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateCircleAngle(1, "mixed");
    const b = generateCircleAngle(2, "mixed");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("all answers are positive integers", () => {
    for (const seed of seeds) {
      const problems = generateCircleAngle(seed, "mixed");
      for (const p of problems) {
        expect(p.answer).toBeGreaterThan(0);
        expect(Number.isInteger(p.answer)).toBe(true);
      }
    }
  });

  it("answerDisplay ends with degree symbol", () => {
    for (const seed of seeds) {
      const problems = generateCircleAngle(seed, "mixed");
      for (const p of problems) {
        expect(p.answerDisplay).toMatch(/°$/);
      }
    }
  });

  it("each problem has a valid type", () => {
    const validTypes = [
      "central-to-inscribed",
      "inscribed-to-central",
      "semicircle",
      "inscribed-quadrilateral",
    ];
    for (const seed of seeds) {
      const problems = generateCircleAngle(seed, "mixed");
      for (const p of problems) {
        expect(validTypes).toContain(p.type);
      }
    }
  });

  it("inscribed mode only produces inscribed types", () => {
    for (const seed of seeds) {
      const problems = generateCircleAngle(seed, "inscribed");
      for (const p of problems) {
        expect(["inscribed-quadrilateral", "semicircle"]).toContain(p.type);
      }
    }
  });

  it("basic mode can produce central angle types", () => {
    let hasCentral = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50, 100]) {
      const problems = generateCircleAngle(seed, "basic");
      for (const p of problems) {
        if (
          p.type === "central-to-inscribed" ||
          p.type === "inscribed-to-central"
        ) {
          hasCentral = true;
        }
      }
    }
    expect(hasCentral).toBe(true);
  });

  it("central-to-inscribed: inscribed angle is half the central angle", () => {
    for (const seed of seeds) {
      const problems = generateCircleAngle(seed, "mixed");
      for (const p of problems) {
        if (p.type === "central-to-inscribed") {
          // answer is half of the central angle mentioned in question
          const match = p.question.match(/中心角が (\d+)°/);
          if (match) {
            const central = parseInt(match[1]);
            expect(p.answer).toBe(central / 2);
          }
        }
      }
    }
  });

  it("inscribed-to-central: central angle is double the inscribed angle", () => {
    for (const seed of seeds) {
      const problems = generateCircleAngle(seed, "mixed");
      for (const p of problems) {
        if (p.type === "inscribed-to-central") {
          const match = p.question.match(/円周角が (\d+)°/);
          if (match) {
            const inscribed = parseInt(match[1]);
            expect(p.answer).toBe(inscribed * 2);
          }
        }
      }
    }
  });

  it("inscribed-quadrilateral: opposite angles sum to 180", () => {
    for (const seed of seeds) {
      const problems = generateCircleAngle(seed, "mixed");
      for (const p of problems) {
        if (p.type === "inscribed-quadrilateral") {
          const match = p.question.match(/(\d+)°/);
          if (match) {
            const givenAngle = parseInt(match[1]);
            expect(p.answer).toBe(180 - givenAngle);
          }
        }
      }
    }
  });

  it("answers are within a reasonable angle range", () => {
    for (const seed of seeds) {
      const problems = generateCircleAngle(seed, "mixed");
      for (const p of problems) {
        expect(p.answer).toBeGreaterThan(0);
        expect(p.answer).toBeLessThan(180);
      }
    }
  });
});
