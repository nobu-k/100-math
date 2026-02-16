import { describe, it, expect } from "vitest";
import {
  generateDecomposition,
  generateFillBlank,
  generateComparison,
  generateSequence,
  generateClock,
} from "./generators";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateDecomposition
// ---------------------------------------------------------------------------
describe("generateDecomposition", () => {
  it("returns 12 problems", () => {
    const problems = generateDecomposition(42, 10);
    expect(problems).toHaveLength(12);
  });

  it("given + answer = target for every problem", () => {
    for (const seed of seeds) {
      for (const target of [5, 10, 15, 20]) {
        const problems = generateDecomposition(seed, target);
        for (const p of problems) {
          expect(p.given + p.answer).toBe(target);
          expect(p.target).toBe(target);
        }
      }
    }
  });

  it("given is between 1 and target-1", () => {
    for (const seed of seeds) {
      const problems = generateDecomposition(seed, 10);
      for (const p of problems) {
        expect(p.given).toBeGreaterThanOrEqual(1);
        expect(p.given).toBeLessThanOrEqual(9);
      }
    }
  });

  it("position is left or right", () => {
    const problems = generateDecomposition(42, 10);
    for (const p of problems) {
      expect(["left", "right"]).toContain(p.position);
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateDecomposition(42, 10);
    const b = generateDecomposition(42, 10);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateDecomposition(1, 10);
    const b = generateDecomposition(2, 10);
    const aGivens = a.map((p) => p.given);
    const bGivens = b.map((p) => p.given);
    expect(aGivens).not.toEqual(bGivens);
  });
});

// ---------------------------------------------------------------------------
// generateFillBlank
// ---------------------------------------------------------------------------
describe("generateFillBlank", () => {
  it("returns 12 problems", () => {
    const problems = generateFillBlank(42, 10, "mixed");
    expect(problems).toHaveLength(12);
  });

  it("addition problems: left + right = result, blank filled correctly", () => {
    for (const seed of seeds) {
      const problems = generateFillBlank(seed, 20, "add");
      for (const p of problems) {
        expect(p.op).toBe("+");
        const left = p.left ?? p.answer;
        const right = p.right ?? p.answer;
        expect(left + right).toBe(p.result);
      }
    }
  });

  it("subtraction problems: left - right = result, blank filled correctly", () => {
    for (const seed of seeds) {
      const problems = generateFillBlank(seed, 20, "sub");
      for (const p of problems) {
        expect(p.op).toBe("−");
        const left = p.left ?? p.answer;
        const right = p.right ?? p.answer;
        expect(left - right).toBe(p.result);
      }
    }
  });

  it("mixed mode produces both add and sub", () => {
    // Use enough seeds to statistically guarantee both types appear
    let hasAdd = false;
    let hasSub = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateFillBlank(seed, 10, "mixed");
      for (const p of problems) {
        if (p.op === "+") hasAdd = true;
        if (p.op === "−") hasSub = true;
      }
    }
    expect(hasAdd).toBe(true);
    expect(hasSub).toBe(true);
  });

  it("exactly one of left/right is null (the blank)", () => {
    for (const seed of seeds) {
      const problems = generateFillBlank(seed, 10, "mixed");
      for (const p of problems) {
        const nullCount = (p.left === null ? 1 : 0) + (p.right === null ? 1 : 0);
        expect(nullCount).toBe(1);
      }
    }
  });

  it("all values are within range", () => {
    for (const seed of seeds) {
      const problems = generateFillBlank(seed, 10, "mixed");
      for (const p of problems) {
        const left = p.left ?? p.answer;
        const right = p.right ?? p.answer;
        expect(left).toBeGreaterThanOrEqual(1);
        expect(left).toBeLessThanOrEqual(10);
        expect(right).toBeGreaterThanOrEqual(1);
        expect(right).toBeLessThanOrEqual(10);
        expect(p.result).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateFillBlank(42, 10, "mixed");
    const b = generateFillBlank(42, 10, "mixed");
    expect(a).toEqual(b);
  });
});

// ---------------------------------------------------------------------------
// generateComparison
// ---------------------------------------------------------------------------
describe("generateComparison", () => {
  it("returns 15 problems", () => {
    const problems = generateComparison(42, 20);
    expect(problems).toHaveLength(15);
  });

  it("answer matches the actual comparison", () => {
    for (const seed of seeds) {
      const problems = generateComparison(seed, 50);
      for (const p of problems) {
        if (p.left > p.right) expect(p.answer).toBe("＞");
        else if (p.left < p.right) expect(p.answer).toBe("＜");
        else expect(p.answer).toBe("＝");
      }
    }
  });

  it("first two problems have equal pairs", () => {
    for (const seed of seeds) {
      const problems = generateComparison(seed, 20);
      expect(problems[0].left).toBe(problems[0].right);
      expect(problems[1].left).toBe(problems[1].right);
    }
  });

  it("values are within [1, max]", () => {
    for (const seed of seeds) {
      for (const max of [20, 50, 100]) {
        const problems = generateComparison(seed, max);
        for (const p of problems) {
          expect(p.left).toBeGreaterThanOrEqual(1);
          expect(p.left).toBeLessThanOrEqual(max);
          expect(p.right).toBeGreaterThanOrEqual(1);
          expect(p.right).toBeLessThanOrEqual(max);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateComparison(42, 20);
    const b = generateComparison(42, 20);
    expect(a).toEqual(b);
  });
});

// ---------------------------------------------------------------------------
// generateSequence
// ---------------------------------------------------------------------------
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
          // Reconstruct full sequence
          const full: number[] = [];
          let ansIdx = 0;
          for (const c of p.cells) {
            if (c !== null) {
              full.push(c);
            } else {
              full.push(p.answers[ansIdx++]);
            }
          }
          // Check constant difference
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

// ---------------------------------------------------------------------------
// generateClock
// ---------------------------------------------------------------------------
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
