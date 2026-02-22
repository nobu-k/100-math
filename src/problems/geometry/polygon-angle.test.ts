import { describe, it, expect } from "vitest";
import { generatePolygonAngle } from "./polygon-angle";

const seeds = [1, 2, 42, 100, 999];

describe("generatePolygonAngle", () => {
  it("returns 10 problems", () => {
    const problems = generatePolygonAngle(42, "mixed");
    expect(problems).toHaveLength(10);
  });

  it("is deterministic with the same seed", () => {
    const a = generatePolygonAngle(42, "mixed");
    const b = generatePolygonAngle(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generatePolygonAngle(1, "mixed");
    const b = generatePolygonAngle(2, "mixed");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("interior-sum mode only produces interior-sum problems", () => {
    for (const seed of seeds) {
      const problems = generatePolygonAngle(seed, "interior-sum");
      for (const p of problems) {
        expect(p.type).toBe("interior-sum");
      }
    }
  });

  it("regular mode only produces regular problems", () => {
    for (const seed of seeds) {
      const problems = generatePolygonAngle(seed, "regular");
      for (const p of problems) {
        expect(p.type).toBe("regular");
      }
    }
  });

  it("exterior mode only produces exterior problems", () => {
    for (const seed of seeds) {
      const problems = generatePolygonAngle(seed, "exterior");
      for (const p of problems) {
        expect(p.type).toBe("exterior");
      }
    }
  });

  it("find-n mode only produces find-n problems", () => {
    for (const seed of seeds) {
      const problems = generatePolygonAngle(seed, "find-n");
      for (const p of problems) {
        expect(p.type).toBe("find-n");
      }
    }
  });

  it("mixed mode produces multiple types", () => {
    const typesSeen = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generatePolygonAngle(seed, "mixed");
      for (const p of problems) {
        typesSeen.add(p.type);
      }
    }
    expect(typesSeen.size).toBeGreaterThanOrEqual(2);
  });

  it("interior-sum answers equal (n-2)*180", () => {
    for (const seed of seeds) {
      const problems = generatePolygonAngle(seed, "interior-sum");
      for (const p of problems) {
        expect(p.n).toBeDefined();
        expect(p.answer).toBe((p.n! - 2) * 180);
      }
    }
  });

  it("regular polygon answers are integer values", () => {
    for (const seed of seeds) {
      const problems = generatePolygonAngle(seed, "regular");
      for (const p of problems) {
        expect(Number.isInteger(p.answer)).toBe(true);
      }
    }
  });

  it("exterior angle sum is always 360", () => {
    for (const seed of seeds) {
      const problems = generatePolygonAngle(seed, "exterior");
      for (const p of problems) {
        expect(p.answer).toBe(360);
      }
    }
  });

  it("find-n answers are valid polygon side counts", () => {
    const validNs = [3, 4, 5, 6, 7, 8, 9, 10, 12];
    for (const seed of seeds) {
      const problems = generatePolygonAngle(seed, "find-n");
      for (const p of problems) {
        expect(validNs).toContain(p.answer);
      }
    }
  });

  it("n is one of the supported polygon side counts", () => {
    const validNs = [3, 4, 5, 6, 7, 8, 9, 10, 12];
    for (const seed of seeds) {
      const problems = generatePolygonAngle(seed, "mixed");
      for (const p of problems) {
        if (p.n !== undefined) {
          expect(validNs).toContain(p.n);
        }
      }
    }
  });
});
