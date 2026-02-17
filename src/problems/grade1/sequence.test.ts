import { describe, it, expect } from "vitest";
import { generateSequence } from "./sequence";

const seeds = [1, 2, 42, 100, 999];

describe("generateSequence", () => {
  it("returns 6 problems", () => {
    const problems = generateSequence(42, 2, 20);
    expect(problems).toHaveLength(6);
  });

  it("each sequence has 8 cells with exactly 3 blanks", () => {
    for (const seed of seeds) {
      const problems = generateSequence(seed, 1, 20);
      for (const p of problems) {
        expect(p.cells).toHaveLength(8);
        const blanks = p.cells.filter((c) => c === null);
        expect(blanks).toHaveLength(3);
        expect(p.answers).toHaveLength(3);
      }
    }
  });

  it("first and last cells are never blank", () => {
    for (const seed of seeds) {
      const problems = generateSequence(seed, 2, 50);
      for (const p of problems) {
        expect(p.cells[0]).not.toBeNull();
        expect(p.cells[7]).not.toBeNull();
      }
    }
  });

  it("filled + blank values form an arithmetic sequence", () => {
    for (const seed of seeds) {
      for (const step of [1, 2, 5, 10]) {
        const problems = generateSequence(seed, step, 100);
        for (const p of problems) {
          const full: number[] = [];
          let ansIdx = 0;
          for (const c of p.cells) {
            if (c !== null) {
              full.push(c);
            } else {
              full.push(p.answers[ansIdx++]);
            }
          }
          const diff = full[1] - full[0];
          expect(Math.abs(diff)).toBe(step);
          for (let i = 2; i < full.length; i++) {
            expect(full[i] - full[i - 1]).toBe(diff);
          }
        }
      }
    }
  });

  it("all values are positive", () => {
    for (const seed of seeds) {
      const problems = generateSequence(seed, 2, 20);
      for (const p of problems) {
        let ansIdx = 0;
        for (const c of p.cells) {
          const v = c !== null ? c : p.answers[ansIdx++];
          expect(v).toBeGreaterThan(0);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateSequence(42, 2, 20);
    const b = generateSequence(42, 2, 20);
    expect(a).toEqual(b);
  });
});
