import { describe, it, expect } from "vitest";
import { generateTableRead } from "./table-read";

const seeds = [1, 2, 42, 100, 999];

describe("generateTableRead", () => {
  it("returns 3 problems", () => {
    const problems = generateTableRead(42, 5);
    expect(problems).toHaveLength(3);
  });

  it("each problem has the correct number of categories", () => {
    for (const seed of seeds) {
      for (const numCats of [3, 4, 5]) {
        const problems = generateTableRead(seed, numCats);
        for (const p of problems) {
          expect(p.categories).toHaveLength(numCats);
          expect(p.values).toHaveLength(numCats);
        }
      }
    }
  });

  it("values are between 1 and 15", () => {
    for (const seed of seeds) {
      const problems = generateTableRead(seed, 5);
      for (const p of problems) {
        for (const v of p.values) {
          expect(v).toBeGreaterThanOrEqual(1);
          expect(v).toBeLessThanOrEqual(15);
        }
      }
    }
  });

  it("each problem has at least 5 questions", () => {
    for (const seed of seeds) {
      const problems = generateTableRead(seed, 4);
      for (const p of problems) {
        expect(p.questions.length).toBeGreaterThanOrEqual(5);
      }
    }
  });

  it("Q1: specific item count is correct", () => {
    for (const seed of seeds) {
      const problems = generateTableRead(seed, 5);
      for (const p of problems) {
        const q1 = p.questions[0];
        const cat = p.categories.find((c) => q1.question.includes(c));
        expect(cat).toBeDefined();
        const idx = p.categories.indexOf(cat!);
        expect(q1.answer).toBe(`${p.values[idx]}人`);
      }
    }
  });

  it("Q2: most popular category is correct", () => {
    for (const seed of seeds) {
      const problems = generateTableRead(seed, 5);
      for (const p of problems) {
        const q2 = p.questions[1];
        expect(q2.question).toContain("いちばん多い");
        const maxVal = Math.max(...p.values);
        const maxCat = p.categories[p.values.indexOf(maxVal)];
        expect(q2.answer).toBe(maxCat);
      }
    }
  });

  it("Q3: total is correct", () => {
    for (const seed of seeds) {
      const problems = generateTableRead(seed, 5);
      for (const p of problems) {
        const q3 = p.questions[2];
        expect(q3.question).toContain("合計");
        const total = p.values.reduce((a, b) => a + b, 0);
        expect(q3.answer).toBe(`${total}人`);
      }
    }
  });

  it("Q4: difference between two items is correct", () => {
    for (const seed of seeds) {
      const problems = generateTableRead(seed, 5);
      for (const p of problems) {
        const q4 = p.questions[3];
        expect(q4.question).toContain("ちがい");
        const catA = p.categories.find((c) => q4.question.startsWith(c));
        expect(catA).toBeDefined();
        const remaining = q4.question.slice(catA!.length + 1);
        const catB = p.categories.find((c) => remaining.startsWith(c));
        expect(catB).toBeDefined();
        const idxA = p.categories.indexOf(catA!);
        const idxB = p.categories.indexOf(catB!);
        const diff = Math.abs(p.values[idxA] - p.values[idxB]);
        expect(q4.answer).toBe(`${diff}人`);
      }
    }
  });

  it("Q5: least popular category is correct", () => {
    for (const seed of seeds) {
      const problems = generateTableRead(seed, 5);
      for (const p of problems) {
        const q5 = p.questions[4];
        expect(q5.question).toContain("いちばん少ない");
        const minVal = Math.min(...p.values);
        const minCat = p.categories[p.values.indexOf(minVal)];
        expect(q5.answer).toBe(minCat);
      }
    }
  });

  it("title matches one of the known category titles", () => {
    const knownTitles = ["好きな果物しらべ", "好きな動物しらべ", "好きなスポーツしらべ"];
    for (const seed of seeds) {
      const problems = generateTableRead(seed, 4);
      for (const p of problems) {
        expect(knownTitles).toContain(p.title);
      }
    }
  });

  it("categories are unique within each problem (no duplicates)", () => {
    for (const seed of seeds) {
      const problems = generateTableRead(seed, 5);
      for (const p of problems) {
        const unique = new Set(p.categories);
        expect(unique.size).toBe(p.categories.length);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateTableRead(42, 5);
    const b = generateTableRead(42, 5);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateTableRead(1, 5);
    const b = generateTableRead(2, 5);
    const aValues = a.map((p) => p.values);
    const bValues = b.map((p) => p.values);
    expect(aValues).not.toEqual(bValues);
  });
});
