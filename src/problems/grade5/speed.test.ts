import { describe, it, expect } from "vitest";
import { generateSpeed } from "./speed";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateSpeed
// ---------------------------------------------------------------------------
describe("generateSpeed", () => {
  it("returns 10 problems", () => {
    const problems = generateSpeed(42, "speed");
    expect(problems).toHaveLength(10);
  });

  it("distance mode: answer is speed * time", () => {
    for (const seed of seeds) {
      const problems = generateSpeed(seed, "distance");
      for (const p of problems) {
        expect(p.question).toContain("何km");
        const match = p.question.match(/時速(\d+)kmで(\d+)時間/);
        expect(match).not.toBeNull();
        const speed = Number(match![1]);
        const time = Number(match![2]);
        expect(p.answer).toBe(`${speed * time}km`);
      }
    }
  });

  it("time mode: answer is distance / speed", () => {
    for (const seed of seeds) {
      const problems = generateSpeed(seed, "time");
      for (const p of problems) {
        expect(p.question).toContain("何時間");
        const match = p.question.match(/(\d+)kmを時速(\d+)km/);
        expect(match).not.toBeNull();
        const distance = Number(match![1]);
        const speed = Number(match![2]);
        expect(p.answer).toBe(`${distance / speed}時間`);
      }
    }
  });

  it("speed mode: answer is distance / time", () => {
    for (const seed of seeds) {
      const problems = generateSpeed(seed, "speed");
      for (const p of problems) {
        expect(p.question).toContain("時速は");
        const match = p.question.match(/(\d+)kmを(\d+)時間/);
        expect(match).not.toBeNull();
        const distance = Number(match![1]);
        const time = Number(match![2]);
        expect(p.answer).toBe(`時速${distance / time}km`);
      }
    }
  });

  it("mixed mode produces all three types", () => {
    let hasSpeed = false;
    let hasTime = false;
    let hasDistance = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateSpeed(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("時速は")) hasSpeed = true;
        if (p.question.includes("何時間")) hasTime = true;
        if (p.question.includes("走ると何km")) hasDistance = true;
      }
    }
    expect(hasSpeed).toBe(true);
    expect(hasTime).toBe(true);
    expect(hasDistance).toBe(true);
  });

  it("speed is a multiple of 10 between 30 and 200", () => {
    for (const seed of seeds) {
      const problems = generateSpeed(seed, "distance");
      for (const p of problems) {
        const match = p.question.match(/時速(\d+)km/);
        const speed = Number(match![1]);
        expect(speed % 10).toBe(0);
        expect(speed).toBeGreaterThanOrEqual(30);
        expect(speed).toBeLessThanOrEqual(200);
      }
    }
  });

  it("time is between 1 and 8", () => {
    for (const seed of seeds) {
      const problems = generateSpeed(seed, "distance");
      for (const p of problems) {
        const match = p.question.match(/(\d+)時間走ると/);
        const time = Number(match![1]);
        expect(time).toBeGreaterThanOrEqual(1);
        expect(time).toBeLessThanOrEqual(8);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateSpeed(42, "mixed");
    const b = generateSpeed(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateSpeed(1, "speed");
    const b = generateSpeed(2, "speed");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
