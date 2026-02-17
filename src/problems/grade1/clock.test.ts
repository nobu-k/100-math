import { describe, it, expect } from "vitest";
import { generateClock } from "./clock";

const seeds = [1, 2, 42, 100, 999];

describe("generateClock", () => {
  it("returns 8 problems", () => {
    const problems = generateClock(42, "half");
    expect(problems).toHaveLength(8);
  });

  it("hour precision: all minutes are 0", () => {
    for (const seed of seeds) {
      const problems = generateClock(seed, "hour");
      for (const p of problems) {
        expect(p.minute).toBe(0);
      }
    }
  });

  it("half precision: minutes are 0 or 30", () => {
    for (const seed of seeds) {
      const problems = generateClock(seed, "half");
      for (const p of problems) {
        expect([0, 30]).toContain(p.minute);
      }
    }
  });

  it("5min precision: minutes are multiples of 5", () => {
    for (const seed of seeds) {
      const problems = generateClock(seed, "5min");
      for (const p of problems) {
        expect(p.minute % 5).toBe(0);
        expect(p.minute).toBeGreaterThanOrEqual(0);
        expect(p.minute).toBeLessThanOrEqual(55);
      }
    }
  });

  it("1min precision: minutes are 0-59", () => {
    for (const seed of seeds) {
      const problems = generateClock(seed, "1min");
      for (const p of problems) {
        expect(p.minute).toBeGreaterThanOrEqual(0);
        expect(p.minute).toBeLessThanOrEqual(59);
      }
    }
  });

  it("hours are between 1 and 12", () => {
    for (const seed of seeds) {
      for (const prec of ["hour", "half", "5min", "1min"] as const) {
        const problems = generateClock(seed, prec);
        for (const p of problems) {
          expect(p.hour).toBeGreaterThanOrEqual(1);
          expect(p.hour).toBeLessThanOrEqual(12);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateClock(42, "5min");
    const b = generateClock(42, "5min");
    expect(a).toEqual(b);
  });
});
