import { describe, it, expect } from "vitest";
import { generateBarGraph } from "./bar-graph";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateBarGraph
// ---------------------------------------------------------------------------
describe("generateBarGraph", () => {
  it("returns 3 problems", () => {
    const problems = generateBarGraph(42, 4);
    expect(problems).toHaveLength(3);
  });

  it("each problem has the correct number of bars", () => {
    for (const seed of seeds) {
      for (const bars of [3, 4, 5]) {
        const problems = generateBarGraph(seed, bars);
        for (const p of problems) {
          expect(p.categories).toHaveLength(bars);
          expect(p.values).toHaveLength(bars);
        }
      }
    }
  });

  it("scaleStep is one of [2, 5, 10]", () => {
    for (const seed of seeds) {
      const problems = generateBarGraph(seed, 4);
      for (const p of problems) {
        expect([2, 5, 10]).toContain(p.scaleStep);
      }
    }
  });

  it("scaleMax is a multiple of scaleStep", () => {
    for (const seed of seeds) {
      const problems = generateBarGraph(seed, 4);
      for (const p of problems) {
        expect(p.scaleMax % p.scaleStep).toBe(0);
      }
    }
  });

  it("values are between 1 and scaleMax-1", () => {
    for (const seed of seeds) {
      const problems = generateBarGraph(seed, 4);
      for (const p of problems) {
        for (const v of p.values) {
          expect(v).toBeGreaterThanOrEqual(1);
          expect(v).toBeLessThan(p.scaleMax);
        }
      }
    }
  });

  it("unit is '人'", () => {
    for (const seed of seeds) {
      const problems = generateBarGraph(seed, 4);
      for (const p of problems) {
        expect(p.unit).toBe("人");
      }
    }
  });

  it("each problem has at least 2 questions", () => {
    for (const seed of seeds) {
      const problems = generateBarGraph(seed, 4);
      for (const p of problems) {
        expect(p.questions.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("Q1 read-value answer matches the actual values", () => {
    for (const seed of seeds) {
      const problems = generateBarGraph(seed, 4);
      for (const p of problems) {
        // First question reads a category value
        const q1 = p.questions[0];
        const match = q1.question.match(/^(.+)は何人ですか？$/);
        expect(match).not.toBeNull();
        const catName = match![1];
        const catIdx = p.categories.indexOf(catName);
        expect(catIdx).not.toBe(-1);
        expect(q1.answer).toBe(`${p.values[catIdx]}人`);
      }
    }
  });

  it("Q2 most popular answer is the category with max value", () => {
    for (const seed of seeds) {
      const problems = generateBarGraph(seed, 4);
      for (const p of problems) {
        const q2 = p.questions[1];
        expect(q2.question).toBe("いちばん多いのは何ですか？");
        const maxVal = Math.max(...p.values);
        const maxCat = p.categories[p.values.indexOf(maxVal)];
        expect(q2.answer).toBe(maxCat);
      }
    }
  });

  it("Q3 difference answer is correct", () => {
    for (const seed of seeds) {
      const problems = generateBarGraph(seed, 4);
      for (const p of problems) {
        if (p.questions.length >= 3) {
          const q3 = p.questions[2];
          const match = q3.question.match(/^(.+)と(.+)のちがいは何人ですか？$/);
          expect(match).not.toBeNull();
          const catA = match![1];
          const catB = match![2];
          const valA = p.values[p.categories.indexOf(catA)];
          const valB = p.values[p.categories.indexOf(catB)];
          expect(q3.answer).toBe(`${Math.abs(valA - valB)}人`);
        }
      }
    }
  });

  it("title comes from the predefined set", () => {
    const validTitles = ["好きな果物", "好きな教科", "クラス別の人数"];
    for (const seed of seeds) {
      const problems = generateBarGraph(seed, 4);
      for (const p of problems) {
        expect(validTitles).toContain(p.title);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateBarGraph(42, 4);
    const b = generateBarGraph(42, 4);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateBarGraph(1, 4);
    const b = generateBarGraph(2, 4);
    const aValues = a.map((p) => p.values);
    const bValues = b.map((p) => p.values);
    expect(aValues).not.toEqual(bValues);
  });
});
