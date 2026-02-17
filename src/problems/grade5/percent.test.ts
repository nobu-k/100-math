import { describe, it, expect } from "vitest";
import { generatePercent } from "./percent";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generatePercent
// ---------------------------------------------------------------------------
describe("generatePercent", () => {
  it("returns 10 problems", () => {
    const problems = generatePercent(42, "ratio");
    expect(problems).toHaveLength(10);
  });

  it("ratio mode: answer is a valid percentage", () => {
    for (const seed of seeds) {
      const problems = generatePercent(seed, "ratio");
      for (const p of problems) {
        expect(p.question).toContain("何%");
        expect(p.question).toContain("人中");
        // answer should be a number followed by %
        const ansMatch = p.answer.match(/^(\d+)%$/);
        expect(ansMatch).not.toBeNull();
        const pct = Number(ansMatch![1]);
        // percentage is a multiple of 5 between 5 and 95
        expect(pct % 5).toBe(0);
        expect(pct).toBeGreaterThanOrEqual(5);
        expect(pct).toBeLessThanOrEqual(95);
        // verify: base * pct / 100 = compared
        const qMatch = p.question.match(/([\d.]+)人中([\d.]+)人/);
        expect(qMatch).not.toBeNull();
        const base = Number(qMatch![1]);
        const compared = Number(qMatch![2]);
        expect(base * pct / 100).toBeCloseTo(compared, 10);
      }
    }
  });

  it("compared mode: answer is base * pct / 100", () => {
    for (const seed of seeds) {
      const problems = generatePercent(seed, "compared");
      for (const p of problems) {
        expect(p.question).toContain("はいくつ");
        const match = p.question.match(/(\d+)の(\d+)%/);
        expect(match).not.toBeNull();
        const base = Number(match![1]);
        const pct = Number(match![2]);
        const compared = base * pct / 100;
        expect(p.answer).toBe(`${compared}`);
      }
    }
  });

  it("base mode: answer is the base value", () => {
    for (const seed of seeds) {
      const problems = generatePercent(seed, "base");
      for (const p of problems) {
        expect(p.question).toContain("□");
        const matchPct = p.question.match(/(\d+)%/);
        const matchCompared = p.question.match(/が([\d.]+)のとき/);
        expect(matchPct).not.toBeNull();
        expect(matchCompared).not.toBeNull();
        const pct = Number(matchPct![1]);
        const compared = Number(matchCompared![1]);
        const base = Number(p.answer);
        // verify: base * pct / 100 = compared
        expect(base * pct / 100).toBeCloseTo(compared, 10);
        // base should be a multiple of 10
        expect(base % 10).toBe(0);
        expect(base).toBeGreaterThanOrEqual(20);
        expect(base).toBeLessThanOrEqual(200);
      }
    }
  });

  it("mixed mode produces all three types", () => {
    let hasRatio = false;
    let hasCompared = false;
    let hasBase = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generatePercent(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("何%")) hasRatio = true;
        if (p.question.includes("はいくつ")) hasCompared = true;
        if (p.question.includes("□")) hasBase = true;
      }
    }
    expect(hasRatio).toBe(true);
    expect(hasCompared).toBe(true);
    expect(hasBase).toBe(true);
  });

  it("base is a multiple of 10 between 20 and 200", () => {
    for (const seed of seeds) {
      const problems = generatePercent(seed, "compared");
      for (const p of problems) {
        const match = p.question.match(/(\d+)の(\d+)%/);
        const base = Number(match![1]);
        expect(base % 10).toBe(0);
        expect(base).toBeGreaterThanOrEqual(20);
        expect(base).toBeLessThanOrEqual(200);
      }
    }
  });

  it("percentage is a multiple of 5 between 5 and 95", () => {
    for (const seed of seeds) {
      const problems = generatePercent(seed, "compared");
      for (const p of problems) {
        const match = p.question.match(/(\d+)の(\d+)%/);
        const pct = Number(match![2]);
        expect(pct % 5).toBe(0);
        expect(pct).toBeGreaterThanOrEqual(5);
        expect(pct).toBeLessThanOrEqual(95);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generatePercent(42, "mixed");
    const b = generatePercent(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generatePercent(1, "ratio");
    const b = generatePercent(2, "ratio");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
