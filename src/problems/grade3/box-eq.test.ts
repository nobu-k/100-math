import { describe, it, expect } from "vitest";
import { generateBoxEq } from "./box-eq";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateBoxEq
// ---------------------------------------------------------------------------
describe("generateBoxEq", () => {
  it("returns 12 problems", () => {
    const problems = generateBoxEq(42, "addsub");
    expect(problems).toHaveLength(12);
  });

  it("addsub mode: equations use only + and -", () => {
    for (const seed of seeds) {
      const problems = generateBoxEq(seed, "addsub");
      for (const p of problems) {
        const hasMultDiv = p.display.includes("×") || p.display.includes("÷");
        expect(hasMultDiv).toBe(false);
      }
    }
  });

  it("all mode produces multiplication/division problems", () => {
    let hasMultDiv = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateBoxEq(seed, "all");
      for (const p of problems) {
        if (p.display.includes("×") || p.display.includes("÷")) {
          hasMultDiv = true;
        }
      }
    }
    expect(hasMultDiv).toBe(true);
  });

  it("answer is a positive integer", () => {
    for (const seed of seeds) {
      for (const ops of ["addsub", "all"] as const) {
        const problems = generateBoxEq(seed, ops);
        for (const p of problems) {
          expect(p.answer).toBeGreaterThan(0);
          expect(Number.isInteger(p.answer)).toBe(true);
        }
      }
    }
  });

  it("display contains exactly one box (□)", () => {
    for (const seed of seeds) {
      for (const ops of ["addsub", "all"] as const) {
        const problems = generateBoxEq(seed, ops);
        for (const p of problems) {
          const boxCount = (p.display.match(/□/g) ?? []).length;
          expect(boxCount).toBe(1);
        }
      }
    }
  });

  it("substituting answer for box makes equation true", () => {
    for (const seed of seeds) {
      for (const ops of ["addsub", "all"] as const) {
        const problems = generateBoxEq(seed, ops);
        for (const p of problems) {
          // Parse the display: "A op B ＝ C" where one of A or B is □
          const parts = p.display.split(" ＝ ");
          const rhs = Number(parts[1]);
          const lhsParts = parts[0].split(" ");
          const leftStr = lhsParts[0] === "□" ? String(p.answer) : lhsParts[0];
          const op = lhsParts[1];
          const rightStr = lhsParts[2] === "□" ? String(p.answer) : lhsParts[2];
          const left = Number(leftStr);
          const right = Number(rightStr);

          let result: number;
          if (op === "＋") result = left + right;
          else if (op === "−") result = left - right;
          else if (op === "×") result = left * right;
          else result = left / right; // ÷

          expect(result).toBe(rhs);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateBoxEq(42, "all");
    const b = generateBoxEq(42, "all");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateBoxEq(1, "addsub");
    const b = generateBoxEq(2, "addsub");
    const aDisplays = a.map((p) => p.display);
    const bDisplays = b.map((p) => p.display);
    expect(aDisplays).not.toEqual(bDisplays);
  });
});
