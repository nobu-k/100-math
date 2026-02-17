import { describe, it, expect } from "vitest";
import { generateTimeCalc3 } from "./time-calc3";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateTimeCalc3
// ---------------------------------------------------------------------------
describe("generateTimeCalc3", () => {
  it("returns 8 problems", () => {
    const problems = generateTimeCalc3(42, "mixed");
    expect(problems).toHaveLength(8);
  });

  it("after mode: all questions ask about time after minutes", () => {
    for (const seed of seeds) {
      const problems = generateTimeCalc3(seed, "after");
      for (const p of problems) {
        expect(p.question).toContain("分後");
      }
    }
  });

  it("duration mode: all questions ask about duration", () => {
    for (const seed of seeds) {
      const problems = generateTimeCalc3(seed, "duration");
      for (const p of problems) {
        expect(p.question).toContain("から");
        expect(p.question).toContain("まで");
      }
    }
  });

  it("seconds mode: all questions involve seconds", () => {
    for (const seed of seeds) {
      const problems = generateTimeCalc3(seed, "seconds");
      for (const p of problems) {
        expect(p.question).toContain("秒");
      }
    }
  });

  it("mixed mode produces multiple sub-modes", () => {
    let hasAfter = false;
    let hasDuration = false;
    let hasSeconds = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateTimeCalc3(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("分後")) hasAfter = true;
        if (p.question.includes("から") && p.question.includes("まで")) hasDuration = true;
        if (p.question.includes("秒") && !p.question.includes("分後")) hasSeconds = true;
      }
    }
    expect(hasAfter).toBe(true);
    expect(hasDuration).toBe(true);
    expect(hasSeconds).toBe(true);
  });

  it("seconds conversion: minutes*60+seconds = total seconds", () => {
    for (const seed of seeds) {
      const problems = generateTimeCalc3(seed, "seconds");
      for (const p of problems) {
        // pattern: "Xmin Ysec = □sec"
        const toSecMatch = p.question.match(/^(\d+)分(\d+)秒 ＝ □秒$/);
        if (toSecMatch) {
          const min = Number(toSecMatch[1]);
          const sec = Number(toSecMatch[2]);
          expect(p.answer).toBe(`${min * 60 + sec}`);
        }
        // pattern: "Xsec = □min □sec"
        const toMinMatch = p.question.match(/^(\d+)秒 ＝ □分□秒$/);
        if (toMinMatch) {
          const totalSec = Number(toMinMatch[1]);
          const expectedMin = Math.floor(totalSec / 60);
          const expectedSec = totalSec % 60;
          expect(p.answer).toBe(`${expectedMin}分${expectedSec}秒`);
        }
      }
    }
  });

  it("after mode: answer time is correctly computed", () => {
    for (const seed of seeds) {
      const problems = generateTimeCalc3(seed, "after");
      for (const p of problems) {
        // parse "Xh Ym の Zmin 後は何時何分？"
        const match = p.question.match(/^(\d+)時(?:(\d+)分)?の(\d+)分後は何時何分？$/);
        if (match) {
          const hour = Number(match[1]);
          const minute = match[2] ? Number(match[2]) : 0;
          const addMin = Number(match[3]);
          let newMin = minute + addMin;
          let newHour = hour + Math.floor(newMin / 60);
          newMin = newMin % 60;
          const expected = newMin === 0 ? `${newHour}時` : `${newHour}時${newMin}分`;
          expect(p.answer).toBe(expected);
        }
      }
    }
  });

  it("every problem has a non-empty question and answer", () => {
    for (const seed of seeds) {
      for (const mode of ["after", "duration", "seconds", "mixed"] as const) {
        const problems = generateTimeCalc3(seed, mode);
        for (const p of problems) {
          expect(p.question.length).toBeGreaterThan(0);
          expect(p.answer.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateTimeCalc3(42, "mixed");
    const b = generateTimeCalc3(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateTimeCalc3(1, "after");
    const b = generateTimeCalc3(2, "after");
    const aQuestions = a.map((p) => p.question);
    const bQuestions = b.map((p) => p.question);
    expect(aQuestions).not.toEqual(bQuestions);
  });
});
