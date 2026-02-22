import { describe, it, expect } from "vitest";
import { generateLineGraph } from "./line-graph";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateLineGraph
// ---------------------------------------------------------------------------
describe("generateLineGraph", () => {
  it("returns 3 problems", () => {
    const problems = generateLineGraph(42);
    expect(problems).toHaveLength(3);
  });

  it("each problem has a title, labels, values, unit, and questions", () => {
    for (const seed of seeds) {
      const problems = generateLineGraph(seed);
      for (const p of problems) {
        expect(p.title.length).toBeGreaterThan(0);
        expect(p.labels.length).toBeGreaterThan(0);
        expect(p.values).toHaveLength(p.labels.length);
        expect(p.unit.length).toBeGreaterThan(0);
        expect(p.questions.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("values are within the min/max range for each theme", () => {
    const ranges = [
      { min: 5, max: 35 },  // 気温の変化
      { min: 25, max: 40 }, // 体重の記録
      { min: 20, max: 100 }, // 水の温度の変化
    ];
    for (const seed of seeds) {
      const problems = generateLineGraph(seed);
      for (let t = 0; t < problems.length; t++) {
        const p = problems[t];
        const range = ranges[t];
        for (const v of p.values) {
          expect(v).toBeGreaterThanOrEqual(range.min);
          expect(v).toBeLessThanOrEqual(range.max);
        }
      }
    }
  });

  it("Q1: value at a point is correct", () => {
    for (const seed of seeds) {
      const problems = generateLineGraph(seed);
      for (const p of problems) {
        // First question asks for value at a specific label
        const q1 = p.questions[0];
        // Find which label it references
        const matchedLabel = p.labels.find((l) => q1.question.includes(l));
        if (matchedLabel) {
          const idx = p.labels.indexOf(matchedLabel);
          expect(q1.answer).toContain(`${p.values[idx]}`);
        }
      }
    }
  });

  it("Q2: highest point is correct", () => {
    for (const seed of seeds) {
      const problems = generateLineGraph(seed);
      for (const p of problems) {
        const q2 = p.questions[1];
        expect(q2.question).toContain("いちばん高い");
        const maxVal = Math.max(...p.values);
        const maxIdx = p.values.indexOf(maxVal);
        expect(q2.answer).toBe(p.labels[maxIdx]);
      }
    }
  });

  it("Q3: change between consecutive points is correct", () => {
    for (const seed of seeds) {
      const problems = generateLineGraph(seed);
      for (const p of problems) {
        const q3 = p.questions[2];
        expect(q3.question).toContain("変化");
        // Find the two labels in the question
        const fromLabel = p.labels.find((l) =>
          q3.question.startsWith(`${l}から`),
        );
        if (fromLabel) {
          const fromIdx = p.labels.indexOf(fromLabel);
          const diff = p.values[fromIdx + 1] - p.values[fromIdx];
          const sign = diff >= 0 ? "＋" : "";
          expect(q3.answer).toBe(`${sign}${diff}${p.unit}`);
        }
      }
    }
  });

  it("values are integers", () => {
    for (const seed of seeds) {
      const problems = generateLineGraph(seed);
      for (const p of problems) {
        for (const v of p.values) {
          expect(Number.isInteger(v)).toBe(true);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateLineGraph(42);
    const b = generateLineGraph(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateLineGraph(1);
    const b = generateLineGraph(2);
    const aValues = a.map((p) => p.values);
    const bValues = b.map((p) => p.values);
    expect(aValues).not.toEqual(bValues);
  });
});
