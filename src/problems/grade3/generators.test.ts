import { describe, it, expect } from "vitest";
import {
  generateDivision,
  generateBoxEq,
  generateMentalMath,
  generateUnitConv3,
  generateDecimalComp,
  generateTimeCalc3,
  generateLargeNum3,
  generateBarGraph,
  generateCircleRD,
} from "./generators";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateDivision
// ---------------------------------------------------------------------------
describe("generateDivision", () => {
  it("returns 15 problems", () => {
    const problems = generateDivision(42, "mixed");
    expect(problems).toHaveLength(15);
  });

  it("dividend = divisor * quotient + remainder for every problem", () => {
    for (const seed of seeds) {
      for (const mode of ["none", "yes", "mixed"] as const) {
        const problems = generateDivision(seed, mode);
        for (const p of problems) {
          expect(p.dividend).toBe(p.divisor * p.quotient + p.remainder);
        }
      }
    }
  });

  it("none mode: all remainders are 0", () => {
    for (const seed of seeds) {
      const problems = generateDivision(seed, "none");
      for (const p of problems) {
        expect(p.remainder).toBe(0);
      }
    }
  });

  it("yes mode: all remainders are > 0", () => {
    for (const seed of seeds) {
      const problems = generateDivision(seed, "yes");
      for (const p of problems) {
        expect(p.remainder).toBeGreaterThan(0);
      }
    }
  });

  it("mixed mode produces both remainder and non-remainder problems", () => {
    let hasRemainder = false;
    let hasNoRemainder = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateDivision(seed, "mixed");
      for (const p of problems) {
        if (p.remainder > 0) hasRemainder = true;
        if (p.remainder === 0) hasNoRemainder = true;
      }
    }
    expect(hasRemainder).toBe(true);
    expect(hasNoRemainder).toBe(true);
  });

  it("divisor is between 2 and 9", () => {
    for (const seed of seeds) {
      const problems = generateDivision(seed, "mixed");
      for (const p of problems) {
        expect(p.divisor).toBeGreaterThanOrEqual(2);
        expect(p.divisor).toBeLessThanOrEqual(9);
      }
    }
  });

  it("quotient is between 1 and 9", () => {
    for (const seed of seeds) {
      const problems = generateDivision(seed, "mixed");
      for (const p of problems) {
        expect(p.quotient).toBeGreaterThanOrEqual(1);
        expect(p.quotient).toBeLessThanOrEqual(9);
      }
    }
  });

  it("remainder is less than divisor", () => {
    for (const seed of seeds) {
      const problems = generateDivision(seed, "yes");
      for (const p of problems) {
        expect(p.remainder).toBeLessThan(p.divisor);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateDivision(42, "mixed");
    const b = generateDivision(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateDivision(1, "mixed");
    const b = generateDivision(2, "mixed");
    const aDividends = a.map((p) => p.dividend);
    const bDividends = b.map((p) => p.dividend);
    expect(aDividends).not.toEqual(bDividends);
  });
});

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

// ---------------------------------------------------------------------------
// generateMentalMath
// ---------------------------------------------------------------------------
describe("generateMentalMath", () => {
  it("returns 20 problems", () => {
    const problems = generateMentalMath(42, "mixed");
    expect(problems).toHaveLength(20);
  });

  it("add mode: all operations are +", () => {
    for (const seed of seeds) {
      const problems = generateMentalMath(seed, "add");
      for (const p of problems) {
        expect(p.op).toBe("+");
      }
    }
  });

  it("sub mode: all operations are minus", () => {
    for (const seed of seeds) {
      const problems = generateMentalMath(seed, "sub");
      for (const p of problems) {
        expect(p.op).toBe("−");
      }
    }
  });

  it("mixed mode produces both add and sub", () => {
    let hasAdd = false;
    let hasSub = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateMentalMath(seed, "mixed");
      for (const p of problems) {
        if (p.op === "+") hasAdd = true;
        if (p.op === "−") hasSub = true;
      }
    }
    expect(hasAdd).toBe(true);
    expect(hasSub).toBe(true);
  });

  it("answer is correct for addition", () => {
    for (const seed of seeds) {
      const problems = generateMentalMath(seed, "add");
      for (const p of problems) {
        expect(p.answer).toBe(p.left + p.right);
      }
    }
  });

  it("answer is correct for subtraction", () => {
    for (const seed of seeds) {
      const problems = generateMentalMath(seed, "sub");
      for (const p of problems) {
        expect(p.answer).toBe(p.left - p.right);
      }
    }
  });

  it("left is between 10 and 99", () => {
    for (const seed of seeds) {
      for (const mode of ["add", "sub", "mixed"] as const) {
        const problems = generateMentalMath(seed, mode);
        for (const p of problems) {
          expect(p.left).toBeGreaterThanOrEqual(10);
          expect(p.left).toBeLessThanOrEqual(99);
        }
      }
    }
  });

  it("right is at least 1", () => {
    for (const seed of seeds) {
      const problems = generateMentalMath(seed, "mixed");
      for (const p of problems) {
        expect(p.right).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("addition results do not exceed 200", () => {
    for (const seed of seeds) {
      const problems = generateMentalMath(seed, "add");
      for (const p of problems) {
        expect(p.answer).toBeLessThanOrEqual(200);
      }
    }
  });

  it("subtraction results are non-negative", () => {
    for (const seed of seeds) {
      const problems = generateMentalMath(seed, "sub");
      for (const p of problems) {
        expect(p.answer).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateMentalMath(42, "mixed");
    const b = generateMentalMath(42, "mixed");
    expect(a).toEqual(b);
  });
});

// ---------------------------------------------------------------------------
// generateUnitConv3
// ---------------------------------------------------------------------------
describe("generateUnitConv3", () => {
  it("returns 10 problems", () => {
    const problems = generateUnitConv3(42, "length");
    expect(problems).toHaveLength(10);
  });

  it("length mode: questions involve length units (km, m, cm)", () => {
    for (const seed of seeds) {
      const problems = generateUnitConv3(seed, "length");
      for (const p of problems) {
        const hasLength = p.question.includes("km") || p.question.includes("cm") || p.question.includes("m");
        expect(hasLength).toBe(true);
        const hasWeight = p.question.includes("kg") || p.question.includes("g") || p.question.includes("t");
        expect(hasWeight).toBe(false);
      }
    }
  });

  it("weight mode: questions involve weight units (kg, g, t)", () => {
    for (const seed of seeds) {
      const problems = generateUnitConv3(seed, "weight");
      for (const p of problems) {
        const hasWeight = p.question.includes("kg") || p.question.includes("g") || p.question.includes("t");
        expect(hasWeight).toBe(true);
      }
    }
  });

  it("mixed mode produces both length and weight problems", () => {
    let hasLength = false;
    let hasWeight = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateUnitConv3(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("km") || p.question.includes("cm")) hasLength = true;
        if (p.question.includes("kg") || p.question.includes("t")) hasWeight = true;
      }
    }
    expect(hasLength).toBe(true);
    expect(hasWeight).toBe(true);
  });

  it("every problem has a non-empty question and answer", () => {
    for (const seed of seeds) {
      for (const ut of ["length", "weight", "mixed"] as const) {
        const problems = generateUnitConv3(seed, ut);
        for (const p of problems) {
          expect(p.question.length).toBeGreaterThan(0);
          expect(p.answer.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("length conversion: km+m to m is correct", () => {
    for (const seed of seeds) {
      const problems = generateUnitConv3(seed, "length");
      for (const p of problems) {
        // Check km+m → m pattern
        const match = p.question.match(/^(\d+)km (\d+)m ＝ □m$/);
        if (match) {
          const km = Number(match[1]);
          const m = Number(match[2]);
          expect(p.answer).toBe(`${km * 1000 + m}`);
        }
      }
    }
  });

  it("weight conversion: kg+g to g is correct", () => {
    for (const seed of seeds) {
      const problems = generateUnitConv3(seed, "weight");
      for (const p of problems) {
        const match = p.question.match(/^(\d+)kg (\d+)g ＝ □g$/);
        if (match) {
          const kg = Number(match[1]);
          const g = Number(match[2]);
          expect(p.answer).toBe(`${kg * 1000 + g}`);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateUnitConv3(42, "mixed");
    const b = generateUnitConv3(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateUnitConv3(1, "length");
    const b = generateUnitConv3(2, "length");
    const aQuestions = a.map((p) => p.question);
    const bQuestions = b.map((p) => p.question);
    expect(aQuestions).not.toEqual(bQuestions);
  });
});

// ---------------------------------------------------------------------------
// generateDecimalComp
// ---------------------------------------------------------------------------
describe("generateDecimalComp", () => {
  it("returns 15 problems", () => {
    const problems = generateDecimalComp(42, 10);
    expect(problems).toHaveLength(15);
  });

  it("answer matches actual comparison", () => {
    for (const seed of seeds) {
      for (const maxVal of [5, 10, 20]) {
        const problems = generateDecimalComp(seed, maxVal);
        for (const p of problems) {
          const left = parseFloat(p.left);
          const right = parseFloat(p.right);
          if (left > right) expect(p.answer).toBe("＞");
          else if (left < right) expect(p.answer).toBe("＜");
          else expect(p.answer).toBe("＝");
        }
      }
    }
  });

  it("first two problems have equal pairs", () => {
    for (const seed of seeds) {
      const problems = generateDecimalComp(seed, 10);
      expect(problems[0].left).toBe(problems[0].right);
      expect(problems[1].left).toBe(problems[1].right);
    }
  });

  it("values are formatted to 1 decimal place", () => {
    for (const seed of seeds) {
      const problems = generateDecimalComp(seed, 10);
      for (const p of problems) {
        expect(p.left).toMatch(/^\d+\.\d$/);
        expect(p.right).toMatch(/^\d+\.\d$/);
      }
    }
  });

  it("values are positive", () => {
    for (const seed of seeds) {
      const problems = generateDecimalComp(seed, 10);
      for (const p of problems) {
        expect(parseFloat(p.left)).toBeGreaterThan(0);
        expect(parseFloat(p.right)).toBeGreaterThan(0);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateDecimalComp(42, 10);
    const b = generateDecimalComp(42, 10);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateDecimalComp(1, 10);
    const b = generateDecimalComp(2, 10);
    const aLefts = a.map((p) => p.left);
    const bLefts = b.map((p) => p.left);
    expect(aLefts).not.toEqual(bLefts);
  });
});

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

// ---------------------------------------------------------------------------
// generateLargeNum3
// ---------------------------------------------------------------------------
describe("generateLargeNum3", () => {
  it("returns 10 problems", () => {
    const problems = generateLargeNum3(42, "mixed");
    expect(problems).toHaveLength(10);
  });

  it("read mode: all problems involve large number reading", () => {
    for (const seed of seeds) {
      const problems = generateLargeNum3(seed, "read");
      for (const p of problems) {
        // Either question is a number (answer is kanji) or vice versa
        const qIsNum = /^\d+$/.test(p.question);
        const aIsNum = /^\d+$/.test(p.answer);
        expect(qIsNum || aIsNum).toBe(true);
      }
    }
  });

  it("count mode: all problems ask how many units", () => {
    for (const seed of seeds) {
      const problems = generateLargeNum3(seed, "count");
      for (const p of problems) {
        expect(p.question).toContain("が□個");
        const ans = Number(p.answer);
        expect(Number.isInteger(ans)).toBe(true);
        expect(ans).toBeGreaterThan(0);
      }
    }
  });

  it("count mode: n = count * unit is correct", () => {
    for (const seed of seeds) {
      const problems = generateLargeNum3(seed, "count");
      for (const p of problems) {
        // Parse "Nは<kanjiUnit>が□個"
        const match = p.question.match(/^(\d+)は(.+)が□個$/);
        expect(match).not.toBeNull();
        const n = Number(match![1]);
        const count = Number(p.answer);
        // n / count should be a power-of-10 unit
        const unit = n / count;
        expect([10, 100, 1000, 10000]).toContain(unit);
      }
    }
  });

  it("multiply mode: all problems ask about multiplying or dividing", () => {
    for (const seed of seeds) {
      const problems = generateLargeNum3(seed, "multiply");
      for (const p of problems) {
        const hasMul = p.question.includes("倍");
        const hasDiv = p.question.includes("1/");
        expect(hasMul || hasDiv).toBe(true);
      }
    }
  });

  it("multiply mode: multiplication answers are correct", () => {
    for (const seed of seeds) {
      const problems = generateLargeNum3(seed, "multiply");
      for (const p of problems) {
        const mulMatch = p.question.match(/^(\d+)の(\d+)倍は？$/);
        if (mulMatch) {
          const base = Number(mulMatch[1]);
          const mul = Number(mulMatch[2]);
          expect(p.answer).toBe(`${base * mul}`);
        }
        const divMatch = p.question.match(/^(\d+)の1\/(\d+)は？$/);
        if (divMatch) {
          const base = Number(divMatch[1]);
          const div = Number(divMatch[2]);
          expect(p.answer).toBe(`${base / div}`);
          // result should be an integer
          expect(Number.isInteger(base / div)).toBe(true);
        }
      }
    }
  });

  it("mixed mode produces multiple sub-modes", () => {
    let hasRead = false;
    let hasCount = false;
    let hasMultiply = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateLargeNum3(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("が□個")) hasCount = true;
        else if (p.question.includes("倍") || p.question.includes("1/")) hasMultiply = true;
        else hasRead = true;
      }
    }
    expect(hasRead).toBe(true);
    expect(hasCount).toBe(true);
    expect(hasMultiply).toBe(true);
  });

  it("every problem has a non-empty question and answer", () => {
    for (const seed of seeds) {
      for (const mode of ["read", "count", "multiply", "mixed"] as const) {
        const problems = generateLargeNum3(seed, mode);
        for (const p of problems) {
          expect(p.question.length).toBeGreaterThan(0);
          expect(p.answer.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateLargeNum3(42, "mixed");
    const b = generateLargeNum3(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateLargeNum3(1, "read");
    const b = generateLargeNum3(2, "read");
    const aQuestions = a.map((p) => p.question);
    const bQuestions = b.map((p) => p.question);
    expect(aQuestions).not.toEqual(bQuestions);
  });
});

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

// ---------------------------------------------------------------------------
// generateCircleRD
// ---------------------------------------------------------------------------
describe("generateCircleRD", () => {
  it("returns 10 problems", () => {
    const problems = generateCircleRD(42);
    expect(problems).toHaveLength(10);
  });

  it("radius-to-diameter: diameter = 2 * radius", () => {
    for (const seed of seeds) {
      const problems = generateCircleRD(seed);
      for (const p of problems) {
        const match = p.question.match(/^半径(\d+)cmの円の直径は？$/);
        if (match) {
          const r = Number(match[1]);
          expect(p.answer).toBe(`${r * 2}cm`);
        }
      }
    }
  });

  it("diameter-to-radius: radius = diameter / 2", () => {
    for (const seed of seeds) {
      const problems = generateCircleRD(seed);
      for (const p of problems) {
        const match = p.question.match(/^直径(\d+)cmの円の半径は？$/);
        if (match) {
          const d = Number(match[1]);
          expect(p.answer).toBe(`${d / 2}cm`);
          // diameter should be even (integer radius)
          expect(d % 2).toBe(0);
        }
      }
    }
  });

  it("ratio question: answer is always 2倍", () => {
    for (const seed of seeds) {
      const problems = generateCircleRD(seed);
      for (const p of problems) {
        if (p.question.includes("何倍")) {
          expect(p.answer).toBe("2倍");
        }
      }
    }
  });

  it("all three question types appear across seeds", () => {
    let hasRadToDiam = false;
    let hasDiamToRad = false;
    let hasRatio = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateCircleRD(seed);
      for (const p of problems) {
        if (p.question.match(/^半径\d+cmの円の直径は？$/)) hasRadToDiam = true;
        if (p.question.match(/^直径\d+cmの円の半径は？$/)) hasDiamToRad = true;
        if (p.question.includes("何倍")) hasRatio = true;
      }
    }
    expect(hasRadToDiam).toBe(true);
    expect(hasDiamToRad).toBe(true);
    expect(hasRatio).toBe(true);
  });

  it("radius values are within expected ranges", () => {
    for (const seed of seeds) {
      const problems = generateCircleRD(seed);
      for (const p of problems) {
        // radius-to-diameter: radius 1-20
        const radMatch = p.question.match(/^半径(\d+)cmの円の直径は？$/);
        if (radMatch) {
          const r = Number(radMatch[1]);
          expect(r).toBeGreaterThanOrEqual(1);
          expect(r).toBeLessThanOrEqual(20);
        }
        // diameter-to-radius: diameter is even 2-20
        const diamMatch = p.question.match(/^直径(\d+)cmの円の半径は？$/);
        if (diamMatch) {
          const d = Number(diamMatch[1]);
          expect(d).toBeGreaterThanOrEqual(2);
          expect(d).toBeLessThanOrEqual(20);
        }
        // ratio: radius 1-15
        const ratioMatch = p.question.match(/^半径が(\d+)cmの円があります/);
        if (ratioMatch) {
          const r = Number(ratioMatch[1]);
          expect(r).toBeGreaterThanOrEqual(1);
          expect(r).toBeLessThanOrEqual(15);
        }
      }
    }
  });

  it("every problem has a non-empty question and answer", () => {
    for (const seed of seeds) {
      const problems = generateCircleRD(seed);
      for (const p of problems) {
        expect(p.question.length).toBeGreaterThan(0);
        expect(p.answer.length).toBeGreaterThan(0);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateCircleRD(42);
    const b = generateCircleRD(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateCircleRD(1);
    const b = generateCircleRD(2);
    const aQuestions = a.map((p) => p.question);
    const bQuestions = b.map((p) => p.question);
    expect(aQuestions).not.toEqual(bQuestions);
  });
});
