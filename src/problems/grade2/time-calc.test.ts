import { describe, it, expect } from "vitest";
import { generateTimeCalc } from "./time-calc";

const seeds = [1, 2, 42, 100, 999];

describe("generateTimeCalc", () => {
  it("returns 8 problems", () => {
    const problems = generateTimeCalc(42, "mixed");
    expect(problems).toHaveLength(8);
  });

  it("after mode: all questions ask about time after minutes", () => {
    for (const seed of seeds) {
      const problems = generateTimeCalc(seed, "after");
      for (const p of problems) {
        expect(p.question).toContain("分後は何時何分");
      }
    }
  });

  it("duration mode: all questions ask about duration between times", () => {
    for (const seed of seeds) {
      const problems = generateTimeCalc(seed, "duration");
      for (const p of problems) {
        expect(p.question).toContain("から");
        expect(p.question).toContain("まで何時間何分");
      }
    }
  });

  it("after problems: answer is correctly computed", () => {
    for (const seed of seeds) {
      const problems = generateTimeCalc(seed, "after");
      for (const p of problems) {
        const match = p.question.match(/(\d+)時(?:(\d+)分)?の(\d+)分後/);
        expect(match).not.toBeNull();
        const hour = Number(match![1]);
        const minute = match![2] ? Number(match![2]) : 0;
        const addMin = Number(match![3]);
        let newMin = minute + addMin;
        let newHour = hour;
        if (newMin >= 60) {
          newHour += Math.floor(newMin / 60);
          newMin = newMin % 60;
        }
        const expectedAns = newMin === 0 ? `${newHour}時` : `${newHour}時${newMin}分`;
        expect(p.answer).toBe(expectedAns);
      }
    }
  });

  it("duration problems: answer is correctly computed", () => {
    for (const seed of seeds) {
      const problems = generateTimeCalc(seed, "duration");
      for (const p of problems) {
        const match = p.question.match(
          /(\d+)時(?:(\d+)分)?から(\d+)時(?:(\d+)分)?まで/,
        );
        expect(match).not.toBeNull();
        const startH = Number(match![1]);
        const startM = match![2] ? Number(match![2]) : 0;
        const endH = Number(match![3]);
        const endM = match![4] ? Number(match![4]) : 0;
        let diffH = endH - startH;
        let diffM = endM - startM;
        if (diffM < 0) { diffH -= 1; diffM += 60; }
        let expectedAns: string;
        if (diffH === 0) expectedAns = `${diffM}分`;
        else if (diffM === 0) expectedAns = `${diffH}時間`;
        else expectedAns = `${diffH}時間${diffM}分`;
        expect(p.answer).toBe(expectedAns);
      }
    }
  });

  it("mixed mode produces both after and duration problems", () => {
    let hasAfter = false;
    let hasDuration = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateTimeCalc(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("分後")) hasAfter = true;
        if (p.question.includes("まで何時間何分")) hasDuration = true;
      }
    }
    expect(hasAfter).toBe(true);
    expect(hasDuration).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const a = generateTimeCalc(42, "mixed");
    const b = generateTimeCalc(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateTimeCalc(1, "after");
    const b = generateTimeCalc(2, "after");
    const aQs = a.map((p) => p.question);
    const bQs = b.map((p) => p.question);
    expect(aQs).not.toEqual(bQs);
  });
});
