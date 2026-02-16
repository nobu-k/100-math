import { describe, it, expect } from "vitest";
import {
  generateKukuBlank,
  generateMushikui,
  generateUnitConv,
  generateTimeCalc,
  generateLargeNum,
  generateTableRead,
} from "./generators";
import { numberToKanji } from "../shared/math-utils";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateKukuBlank
// ---------------------------------------------------------------------------
describe("generateKukuBlank", () => {
  it("returns 15 problems", () => {
    const problems = generateKukuBlank(42, "any");
    expect(problems).toHaveLength(15);
  });

  it("product equals a * b for every problem", () => {
    for (const seed of seeds) {
      for (const mode of ["any", "product", "factor"] as const) {
        const problems = generateKukuBlank(seed, mode);
        for (const p of problems) {
          expect(p.product).toBe(p.a * p.b);
        }
      }
    }
  });

  it("answer matches the blanked position", () => {
    for (const seed of seeds) {
      const problems = generateKukuBlank(seed, "any");
      for (const p of problems) {
        if (p.blankPos === "a") expect(p.answer).toBe(p.a);
        else if (p.blankPos === "b") expect(p.answer).toBe(p.b);
        else expect(p.answer).toBe(p.product);
      }
    }
  });

  it("a and b are between 1 and 9", () => {
    for (const seed of seeds) {
      const problems = generateKukuBlank(seed, "any");
      for (const p of problems) {
        expect(p.a).toBeGreaterThanOrEqual(1);
        expect(p.a).toBeLessThanOrEqual(9);
        expect(p.b).toBeGreaterThanOrEqual(1);
        expect(p.b).toBeLessThanOrEqual(9);
      }
    }
  });

  it("product mode: blankPos is always 'product'", () => {
    for (const seed of seeds) {
      const problems = generateKukuBlank(seed, "product");
      for (const p of problems) {
        expect(p.blankPos).toBe("product");
        expect(p.answer).toBe(p.product);
      }
    }
  });

  it("factor mode: blankPos is always 'a' or 'b'", () => {
    for (const seed of seeds) {
      const problems = generateKukuBlank(seed, "factor");
      for (const p of problems) {
        expect(["a", "b"]).toContain(p.blankPos);
      }
    }
  });

  it("any mode produces all three blank positions", () => {
    let hasA = false;
    let hasB = false;
    let hasProduct = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateKukuBlank(seed, "any");
      for (const p of problems) {
        if (p.blankPos === "a") hasA = true;
        if (p.blankPos === "b") hasB = true;
        if (p.blankPos === "product") hasProduct = true;
      }
    }
    expect(hasA).toBe(true);
    expect(hasB).toBe(true);
    expect(hasProduct).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const a = generateKukuBlank(42, "any");
    const b = generateKukuBlank(42, "any");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateKukuBlank(1, "any");
    const b = generateKukuBlank(2, "any");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});

// ---------------------------------------------------------------------------
// generateMushikui
// ---------------------------------------------------------------------------
describe("generateMushikui", () => {
  it("returns 12 problems", () => {
    const problems = generateMushikui(42, 100, "mixed");
    expect(problems).toHaveLength(12);
  });

  it("addition problems: left + right = result, answer fills blank correctly", () => {
    for (const seed of seeds) {
      const problems = generateMushikui(seed, 100, "add");
      for (const p of problems) {
        expect(p.op).toBe("+");
        const left = p.left ?? p.answer;
        const right = p.right ?? p.answer;
        const result = p.result ?? p.answer;
        expect(left + right).toBe(result);
      }
    }
  });

  it("subtraction problems: left - right = result, answer fills blank correctly", () => {
    for (const seed of seeds) {
      const problems = generateMushikui(seed, 100, "sub");
      for (const p of problems) {
        expect(p.op).toBe("−");
        const left = p.left ?? p.answer;
        const right = p.right ?? p.answer;
        const result = p.result ?? p.answer;
        expect(left - right).toBe(result);
      }
    }
  });

  it("exactly one of left/right/result is null (the blank)", () => {
    for (const seed of seeds) {
      const problems = generateMushikui(seed, 100, "mixed");
      for (const p of problems) {
        const nullCount =
          (p.left === null ? 1 : 0) +
          (p.right === null ? 1 : 0) +
          (p.result === null ? 1 : 0);
        expect(nullCount).toBe(1);
      }
    }
  });

  it("mixed mode produces both add and sub", () => {
    let hasAdd = false;
    let hasSub = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateMushikui(seed, 100, "mixed");
      for (const p of problems) {
        if (p.op === "+") hasAdd = true;
        if (p.op === "−") hasSub = true;
      }
    }
    expect(hasAdd).toBe(true);
    expect(hasSub).toBe(true);
  });

  it("add mode: all ops are +", () => {
    for (const seed of seeds) {
      const problems = generateMushikui(seed, 100, "add");
      for (const p of problems) {
        expect(p.op).toBe("+");
      }
    }
  });

  it("sub mode: all ops are −", () => {
    for (const seed of seeds) {
      const problems = generateMushikui(seed, 100, "sub");
      for (const p of problems) {
        expect(p.op).toBe("−");
      }
    }
  });

  it("all non-null values are positive", () => {
    for (const seed of seeds) {
      const problems = generateMushikui(seed, 100, "mixed");
      for (const p of problems) {
        if (p.left !== null) expect(p.left).toBeGreaterThanOrEqual(1);
        if (p.right !== null) expect(p.right).toBeGreaterThanOrEqual(1);
        if (p.result !== null) expect(p.result).toBeGreaterThanOrEqual(0);
        expect(p.answer).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateMushikui(42, 100, "mixed");
    const b = generateMushikui(42, 100, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateMushikui(1, 100, "mixed");
    const b = generateMushikui(2, 100, "mixed");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});

// ---------------------------------------------------------------------------
// generateUnitConv
// ---------------------------------------------------------------------------
describe("generateUnitConv", () => {
  it("returns 10 problems", () => {
    const problems = generateUnitConv(42, "length");
    expect(problems).toHaveLength(10);
  });

  it("length mode: all questions involve cm/mm/m units", () => {
    for (const seed of seeds) {
      const problems = generateUnitConv(seed, "length");
      for (const p of problems) {
        const hasLengthUnit = /mm|cm|m/.test(p.question);
        expect(hasLengthUnit).toBe(true);
        // Should not contain volume units
        expect(p.question).not.toContain("dL");
        expect(p.question).not.toContain("mL");
        // Don't match "L" alone since "mL" is already excluded; check for standalone L
        expect(p.question).not.toMatch(/\dL\s/);
      }
    }
  });

  it("volume mode: all questions involve L/dL/mL units", () => {
    for (const seed of seeds) {
      const problems = generateUnitConv(seed, "volume");
      for (const p of problems) {
        const hasVolumeUnit = /[LdmM]L|dL|mL/.test(p.question);
        expect(hasVolumeUnit).toBe(true);
      }
    }
  });

  it("length conversions are mathematically correct", () => {
    for (const seed of seeds) {
      const problems = generateUnitConv(seed, "length");
      for (const p of problems) {
        // Verify conversions based on question pattern
        const cmMmToMm = p.question.match(/^(\d+)cm (\d+)mm ＝ □mm$/);
        if (cmMmToMm) {
          const cm = Number(cmMmToMm[1]);
          const mm = Number(cmMmToMm[2]);
          expect(p.answer).toBe(`${cm * 10 + mm}`);
          continue;
        }
        const mmToCmMm = p.question.match(/^(\d+)mm ＝ □cm □mm$/);
        if (mmToCmMm) {
          const totalMm = Number(mmToCmMm[1]);
          const cm = Math.floor(totalMm / 10);
          const mm = totalMm % 10;
          expect(p.answer).toBe(`${cm}cm ${mm}mm`);
          continue;
        }
        const mCmToCm = p.question.match(/^(\d+)m (\d+)cm ＝ □cm$/);
        if (mCmToCm) {
          const m = Number(mCmToCm[1]);
          const cm = Number(mCmToCm[2]);
          expect(p.answer).toBe(`${m * 100 + cm}`);
          continue;
        }
        const cmToMCm = p.question.match(/^(\d+)cm ＝ □m □cm$/);
        if (cmToMCm) {
          const totalCm = Number(cmToMCm[1]);
          const m = Math.floor(totalCm / 100);
          const cm = totalCm % 100;
          expect(p.answer).toBe(`${m}m ${cm}cm`);
          continue;
        }
      }
    }
  });

  it("volume conversions are mathematically correct", () => {
    for (const seed of seeds) {
      const problems = generateUnitConv(seed, "volume");
      for (const p of problems) {
        const lDlToDl = p.question.match(/^(\d+)L (\d+)dL ＝ □dL$/);
        if (lDlToDl) {
          const l = Number(lDlToDl[1]);
          const dl = Number(lDlToDl[2]);
          expect(p.answer).toBe(`${l * 10 + dl}`);
          continue;
        }
        const dlToLDl = p.question.match(/^(\d+)dL ＝ □L □dL$/);
        if (dlToLDl) {
          const totalDl = Number(dlToLDl[1]);
          const l = Math.floor(totalDl / 10);
          const dl = totalDl % 10;
          expect(p.answer).toBe(`${l}L ${dl}dL`);
          continue;
        }
        const lMlToMl = p.question.match(/^(\d+)L (\d+)mL ＝ □mL$/);
        if (lMlToMl) {
          const l = Number(lMlToMl[1]);
          const ml = Number(lMlToMl[2]);
          expect(p.answer).toBe(`${l * 1000 + ml}`);
          continue;
        }
        const mlToLMl = p.question.match(/^(\d+)mL ＝ □L □mL$/);
        if (mlToLMl) {
          const totalMl = Number(mlToLMl[1]);
          const l = Math.floor(totalMl / 1000);
          const ml = totalMl % 1000;
          expect(p.answer).toBe(`${l}L ${ml}mL`);
          continue;
        }
      }
    }
  });

  it("mixed mode produces both length and volume problems", () => {
    let hasLength = false;
    let hasVolume = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateUnitConv(seed, "mixed");
      for (const p of problems) {
        if (/mm|cm ＝|m \d+cm/.test(p.question)) hasLength = true;
        if (/[Ld]L|mL/.test(p.question)) hasVolume = true;
      }
    }
    expect(hasLength).toBe(true);
    expect(hasVolume).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const a = generateUnitConv(42, "mixed");
    const b = generateUnitConv(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateUnitConv(1, "length");
    const b = generateUnitConv(2, "length");
    const aQs = a.map((p) => p.question);
    const bQs = b.map((p) => p.question);
    expect(aQs).not.toEqual(bQs);
  });
});

// ---------------------------------------------------------------------------
// generateTimeCalc
// ---------------------------------------------------------------------------
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
        // Extract time and addMin from question
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
        // Extract start and end times from question
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
        if (diffM < 0) {
          diffH -= 1;
          diffM += 60;
        }

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

// ---------------------------------------------------------------------------
// generateLargeNum
// ---------------------------------------------------------------------------
describe("generateLargeNum", () => {
  it("returns 10 problems", () => {
    const problems = generateLargeNum(42, 1000);
    expect(problems).toHaveLength(10);
  });

  it("question-answer pairs are consistent (number <-> kanji)", () => {
    for (const seed of seeds) {
      for (const maxRange of [100, 1000, 10000]) {
        const problems = generateLargeNum(seed, maxRange);
        for (const p of problems) {
          // One is a numeral, the other is kanji
          const numVal = Number(p.question);
          if (!isNaN(numVal)) {
            // question is a number, answer should be kanji
            expect(p.answer).toBe(numberToKanji(numVal));
          } else {
            // question is kanji, answer should be a number
            const ansNum = Number(p.answer);
            expect(p.question).toBe(numberToKanji(ansNum));
          }
        }
      }
    }
  });

  it("values are within the expected range based on maxRange", () => {
    for (const seed of seeds) {
      // maxRange=100 -> minVal=10
      const problems100 = generateLargeNum(seed, 100);
      for (const p of problems100) {
        const numVal = Number(p.question) || Number(p.answer);
        expect(numVal).toBeGreaterThanOrEqual(10);
        expect(numVal).toBeLessThan(100);
      }

      // maxRange=1000 -> minVal=100
      const problems1000 = generateLargeNum(seed, 1000);
      for (const p of problems1000) {
        const numVal = Number(p.question) || Number(p.answer);
        expect(numVal).toBeGreaterThanOrEqual(100);
        expect(numVal).toBeLessThan(1000);
      }

      // maxRange=10000 -> minVal=1000
      const problems10000 = generateLargeNum(seed, 10000);
      for (const p of problems10000) {
        const numVal = Number(p.question) || Number(p.answer);
        expect(numVal).toBeGreaterThanOrEqual(1000);
        expect(numVal).toBeLessThan(10000);
      }
    }
  });

  it("produces both directions (number->kanji and kanji->number)", () => {
    let hasNumToKanji = false;
    let hasKanjiToNum = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateLargeNum(seed, 1000);
      for (const p of problems) {
        if (!isNaN(Number(p.question))) hasNumToKanji = true;
        else hasKanjiToNum = true;
      }
    }
    expect(hasNumToKanji).toBe(true);
    expect(hasKanjiToNum).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const a = generateLargeNum(42, 1000);
    const b = generateLargeNum(42, 1000);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateLargeNum(1, 1000);
    const b = generateLargeNum(2, 1000);
    const aQs = a.map((p) => p.question);
    const bQs = b.map((p) => p.question);
    expect(aQs).not.toEqual(bQs);
  });
});

// ---------------------------------------------------------------------------
// generateTableRead
// ---------------------------------------------------------------------------
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
        // find which category is asked about
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
        // Extract the two categories from the question
        const catA = p.categories.find((c) => q4.question.startsWith(c));
        expect(catA).toBeDefined();
        const remaining = q4.question.slice(catA!.length + 1); // skip "と"
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
