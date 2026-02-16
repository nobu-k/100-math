import { describe, it, expect } from "vitest";
import {
  generateMixedCalc,
  generateRounding,
  generateFracConv,
  generateArea,
  generateAngle,
  generateAreaUnit,
  generateEstimate,
  generateDecimalPlace,
  generateDivCheck,
  generateLargeNum4,
  generateCalcTrick,
  generatePatternTable,
  generateLineGraph,
  generateCrossTable,
} from "./generators";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateMixedCalc
// ---------------------------------------------------------------------------
describe("generateMixedCalc", () => {
  it("returns 12 problems", () => {
    const problems = generateMixedCalc(42, false);
    expect(problems).toHaveLength(12);
  });

  it("returns 12 problems with parentheses mode", () => {
    const problems = generateMixedCalc(42, true);
    expect(problems).toHaveLength(12);
  });

  it("every problem has a non-empty display and an integer answer", () => {
    for (const seed of seeds) {
      for (const withParen of [true, false]) {
        const problems = generateMixedCalc(seed, withParen);
        for (const p of problems) {
          expect(p.display.length).toBeGreaterThan(0);
          expect(Number.isInteger(p.answer)).toBe(true);
        }
      }
    }
  });

  it("without parentheses: no display contains parentheses", () => {
    for (const seed of seeds) {
      const problems = generateMixedCalc(seed, false);
      for (const p of problems) {
        expect(p.display).not.toContain("(");
        expect(p.display).not.toContain(")");
      }
    }
  });

  it("with parentheses: at least some problems contain parentheses across seeds", () => {
    let hasParen = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateMixedCalc(seed, true);
      for (const p of problems) {
        if (p.display.includes("(")) hasParen = true;
      }
    }
    expect(hasParen).toBe(true);
  });

  it("answers are non-negative", () => {
    for (const seed of seeds) {
      for (const withParen of [true, false]) {
        const problems = generateMixedCalc(seed, withParen);
        for (const p of problems) {
          expect(p.answer).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateMixedCalc(42, true);
    const b = generateMixedCalc(42, true);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateMixedCalc(1, false);
    const b = generateMixedCalc(2, false);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});

// ---------------------------------------------------------------------------
// generateRounding
// ---------------------------------------------------------------------------
describe("generateRounding", () => {
  it("returns 10 problems", () => {
    const problems = generateRounding(42, 3);
    expect(problems).toHaveLength(10);
  });

  it("question contains the number and a rounding position", () => {
    for (const seed of seeds) {
      const problems = generateRounding(seed, 3);
      for (const p of problems) {
        expect(p.question).toContain("概数");
        expect(p.question).toMatch(/の位/);
      }
    }
  });

  it("answer is a valid number string", () => {
    for (const seed of seeds) {
      const problems = generateRounding(seed, 3);
      for (const p of problems) {
        const ansNum = Number(p.answer);
        expect(Number.isNaN(ansNum)).toBe(false);
        expect(ansNum).toBeGreaterThan(0);
      }
    }
  });

  it("answer is a multiple of the rounding unit", () => {
    for (const seed of seeds) {
      const problems = generateRounding(seed, 3);
      for (const p of problems) {
        const ansNum = Number(p.answer);
        // Must be a multiple of 10, 100, or 1000
        const isMultipleOf10 =
          ansNum % 10 === 0 || ansNum % 100 === 0 || ansNum % 1000 === 0;
        expect(isMultipleOf10).toBe(true);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateRounding(42, 3);
    const b = generateRounding(42, 3);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateRounding(1, 3);
    const b = generateRounding(2, 3);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});

// ---------------------------------------------------------------------------
// generateFracConv
// ---------------------------------------------------------------------------
describe("generateFracConv", () => {
  it("returns 10 problems", () => {
    const problems = generateFracConv(42, "both");
    expect(problems).toHaveLength(10);
  });

  it("to-mixed: improperNum/den => whole + partNum/den", () => {
    for (const seed of seeds) {
      const problems = generateFracConv(seed, "to-mixed");
      for (const p of problems) {
        expect(p.direction).toBe("to-mixed");
        expect(p.fromNum).toBeDefined();
        expect(p.fromDen).toBeDefined();
        expect(p.toWhole).toBeDefined();
        expect(p.toNum).toBeDefined();
        expect(p.toDen).toBeDefined();
        // Check: whole * den + partNum = improperNum
        expect(p.toWhole! * p.toDen! + p.toNum!).toBe(p.fromNum!);
        expect(p.toDen).toBe(p.fromDen);
        // partNum < den
        expect(p.toNum!).toBeLessThan(p.toDen!);
        expect(p.toNum!).toBeGreaterThanOrEqual(1);
        expect(p.toWhole!).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("to-improper: whole + partNum/den => improperNum/den", () => {
    for (const seed of seeds) {
      const problems = generateFracConv(seed, "to-improper");
      for (const p of problems) {
        expect(p.direction).toBe("to-improper");
        expect(p.fromWhole).toBeDefined();
        expect(p.fromNum).toBeDefined();
        expect(p.fromDen).toBeDefined();
        expect(p.toNum).toBeDefined();
        expect(p.toDen).toBeDefined();
        // Check: whole * den + partNum = improperNum
        expect(p.fromWhole! * p.fromDen! + p.fromNum!).toBe(p.toNum!);
        expect(p.toDen).toBe(p.fromDen);
      }
    }
  });

  it("both mode produces both directions", () => {
    let hasToMixed = false;
    let hasToImproper = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateFracConv(seed, "both");
      for (const p of problems) {
        if (p.direction === "to-mixed") hasToMixed = true;
        if (p.direction === "to-improper") hasToImproper = true;
      }
    }
    expect(hasToMixed).toBe(true);
    expect(hasToImproper).toBe(true);
  });

  it("denominators are between 2 and 10", () => {
    for (const seed of seeds) {
      const problems = generateFracConv(seed, "both");
      for (const p of problems) {
        const den = p.fromDen ?? p.toDen!;
        expect(den).toBeGreaterThanOrEqual(2);
        expect(den).toBeLessThanOrEqual(10);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateFracConv(42, "both");
    const b = generateFracConv(42, "both");
    expect(a).toEqual(b);
  });
});

// ---------------------------------------------------------------------------
// generateArea
// ---------------------------------------------------------------------------
describe("generateArea", () => {
  it("returns 10 problems", () => {
    const problems = generateArea(42, "mixed");
    expect(problems).toHaveLength(10);
  });

  it("square mode: all questions mention 正方形", () => {
    for (const seed of seeds) {
      const problems = generateArea(seed, "square");
      for (const p of problems) {
        expect(p.question).toContain("正方形");
      }
    }
  });

  it("rect mode: all questions mention 長方形", () => {
    for (const seed of seeds) {
      const problems = generateArea(seed, "rect");
      for (const p of problems) {
        expect(p.question).toContain("長方形");
      }
    }
  });

  it("mixed mode produces both shapes", () => {
    let hasSquare = false;
    let hasRect = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateArea(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("正方形")) hasSquare = true;
        if (p.question.includes("長方形")) hasRect = true;
      }
    }
    expect(hasSquare).toBe(true);
    expect(hasRect).toBe(true);
  });

  it("square forward: area = side * side", () => {
    for (const seed of seeds) {
      const problems = generateArea(seed, "square");
      for (const p of problems) {
        const sideMatch = p.question.match(/一辺(\d+)cm/);
        if (sideMatch) {
          const side = Number(sideMatch[1]);
          expect(p.answer).toBe(`${side * side}cm²`);
        }
      }
    }
  });

  it("square reverse: side = sqrt(area)", () => {
    for (const seed of seeds) {
      const problems = generateArea(seed, "square");
      for (const p of problems) {
        const areaMatch = p.question.match(/面積が(\d+)cm²の正方形/);
        if (areaMatch) {
          const area = Number(areaMatch[1]);
          const side = Math.round(Math.sqrt(area));
          expect(p.answer).toBe(`${side}cm`);
        }
      }
    }
  });

  it("rect forward: area = w * h", () => {
    for (const seed of seeds) {
      const problems = generateArea(seed, "rect");
      for (const p of problems) {
        const match = p.question.match(/たて(\d+)cm、よこ(\d+)cm/);
        if (match) {
          const h = Number(match[1]);
          const w = Number(match[2]);
          expect(p.answer).toBe(`${w * h}cm²`);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateArea(42, "mixed");
    const b = generateArea(42, "mixed");
    expect(a).toEqual(b);
  });
});

// ---------------------------------------------------------------------------
// generateAngle
// ---------------------------------------------------------------------------
describe("generateAngle", () => {
  it("returns 10 problems", () => {
    const problems = generateAngle(42);
    expect(problems).toHaveLength(10);
  });

  it("all answers are positive and at most 360", () => {
    for (const seed of seeds) {
      const problems = generateAngle(seed);
      for (const p of problems) {
        expect(p.answer).toBeGreaterThan(0);
        expect(p.answer).toBeLessThanOrEqual(360);
      }
    }
  });

  it("display contains degree symbols", () => {
    for (const seed of seeds) {
      const problems = generateAngle(seed);
      for (const p of problems) {
        expect(p.display).toContain("°");
      }
    }
  });

  it("answers are integers", () => {
    for (const seed of seeds) {
      const problems = generateAngle(seed);
      for (const p of problems) {
        expect(Number.isInteger(p.answer)).toBe(true);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateAngle(42);
    const b = generateAngle(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateAngle(1);
    const b = generateAngle(2);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});

// ---------------------------------------------------------------------------
// generateAreaUnit
// ---------------------------------------------------------------------------
describe("generateAreaUnit", () => {
  it("returns 10 problems", () => {
    const problems = generateAreaUnit(42, "cm-m");
    expect(problems).toHaveLength(10);
  });

  it("cm-m mode: questions involve cm² and m² conversions", () => {
    for (const seed of seeds) {
      const problems = generateAreaUnit(seed, "cm-m");
      for (const p of problems) {
        const hasCmM =
          p.question.includes("cm²") || p.question.includes("m²");
        expect(hasCmM).toBe(true);
      }
    }
  });

  it("m-ha mode: questions involve ha, a, km², or m² conversions", () => {
    for (const seed of seeds) {
      const problems = generateAreaUnit(seed, "m-ha");
      for (const p of problems) {
        const hasUnit =
          p.question.includes("ha") ||
          p.question.includes("a ") ||
          p.question.includes("km²") ||
          p.question.includes("m²");
        expect(hasUnit).toBe(true);
      }
    }
  });

  it("mixed mode produces both cm-m and m-ha types", () => {
    let hasCmM = false;
    let hasMHa = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateAreaUnit(seed, "mixed");
      for (const p of problems) {
        // cm-m problems mention cm² to m² or vice versa without ha
        if (
          p.question.includes("m² ＝ □cm²") ||
          p.question.includes("cm² ＝ □m²")
        )
          hasCmM = true;
        if (
          p.question.includes("ha") ||
          p.question.includes("km²") ||
          p.question.match(/\d+a ＝/)
        )
          hasMHa = true;
      }
    }
    expect(hasCmM).toBe(true);
    expect(hasMHa).toBe(true);
  });

  it("cm-m conversions are correct (1 m² = 10000 cm²)", () => {
    for (const seed of seeds) {
      const problems = generateAreaUnit(seed, "cm-m");
      for (const p of problems) {
        const m2ToCm2 = p.question.match(/^(\d+)m² ＝ □cm²$/);
        if (m2ToCm2) {
          const m2 = Number(m2ToCm2[1]);
          expect(p.answer).toBe(`${m2 * 10000}`);
        }
        const cm2ToM2 = p.question.match(/^(\d+)cm² ＝ □m²$/);
        if (cm2ToM2) {
          const cm2 = Number(cm2ToM2[1]);
          expect(p.answer).toBe(`${cm2 / 10000}`);
        }
      }
    }
  });

  it("m-ha conversions are correct", () => {
    for (const seed of seeds) {
      const problems = generateAreaUnit(seed, "m-ha");
      for (const p of problems) {
        // ha to m²: 1 ha = 10000 m²
        const haToM2 = p.question.match(/^(\d+)ha ＝ □m²$/);
        if (haToM2) {
          const ha = Number(haToM2[1]);
          expect(p.answer).toBe(`${ha * 10000}`);
        }
        // m² to ha
        const m2ToHa = p.question.match(/^(\d+)m² ＝ □ha$/);
        if (m2ToHa) {
          const m2 = Number(m2ToHa[1]);
          expect(p.answer).toBe(`${m2 / 10000}`);
        }
        // a to m²: 1 a = 100 m²
        const aToM2 = p.question.match(/^(\d+)a ＝ □m²$/);
        if (aToM2) {
          const a = Number(aToM2[1]);
          expect(p.answer).toBe(`${a * 100}`);
        }
        // km² to ha: 1 km² = 100 ha
        const km2ToHa = p.question.match(/^(\d+)km² ＝ □ha$/);
        if (km2ToHa) {
          const km2 = Number(km2ToHa[1]);
          expect(p.answer).toBe(`${km2 * 100}`);
        }
      }
    }
  });

  it("answers are valid numbers", () => {
    for (const seed of seeds) {
      for (const unitType of ["cm-m", "m-ha", "mixed"] as const) {
        const problems = generateAreaUnit(seed, unitType);
        for (const p of problems) {
          const ansNum = Number(p.answer);
          expect(Number.isNaN(ansNum)).toBe(false);
          expect(ansNum).toBeGreaterThan(0);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateAreaUnit(42, "mixed");
    const b = generateAreaUnit(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateAreaUnit(1, "cm-m");
    const b = generateAreaUnit(2, "cm-m");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});

// ---------------------------------------------------------------------------
// generateEstimate
// ---------------------------------------------------------------------------
describe("generateEstimate", () => {
  it("returns 10 problems", () => {
    const problems = generateEstimate(42, 10);
    expect(problems).toHaveLength(10);
  });

  it("question mentions rounding and estimation", () => {
    for (const seed of seeds) {
      const problems = generateEstimate(seed, 10);
      for (const p of problems) {
        expect(p.question).toContain("概数");
        expect(p.question).toContain("見積もり");
      }
    }
  });

  it("roundTo=10: question mentions 十の位", () => {
    for (const seed of seeds) {
      const problems = generateEstimate(seed, 10);
      for (const p of problems) {
        expect(p.question).toContain("十の位");
      }
    }
  });

  it("roundTo=100: question mentions 百の位", () => {
    for (const seed of seeds) {
      const problems = generateEstimate(seed, 100);
      for (const p of problems) {
        expect(p.question).toContain("百の位");
      }
    }
  });

  it("answer contains rounded values and a result", () => {
    for (const seed of seeds) {
      const problems = generateEstimate(seed, 10);
      for (const p of problems) {
        // answer format: "aRound OP bRound ＝ result"
        expect(p.answer).toContain("＝");
        const parts = p.answer.split("＝");
        const result = Number(parts[parts.length - 1].trim());
        expect(Number.isNaN(result)).toBe(false);
      }
    }
  });

  it("rounded values in answer are multiples of roundTo", () => {
    for (const seed of seeds) {
      for (const roundTo of [10, 100]) {
        const problems = generateEstimate(seed, roundTo);
        for (const p of problems) {
          // Parse answer: "aRound OP bRound ＝ result"
          const matchAdd = p.answer.match(/^(\d+) ＋ (\d+) ＝/);
          const matchSub = p.answer.match(/^(\d+) − (\d+) ＝/);
          const matchMul = p.answer.match(/^(\d+) × (\d+) ＝/);
          const match = matchAdd || matchSub || matchMul;
          if (match) {
            const aRound = Number(match[1]);
            const bRound = Number(match[2]);
            expect(aRound % roundTo).toBe(0);
            expect(bRound % roundTo).toBe(0);
          }
        }
      }
    }
  });

  it("estimation result is mathematically correct", () => {
    for (const seed of seeds) {
      const problems = generateEstimate(seed, 10);
      for (const p of problems) {
        const matchAdd = p.answer.match(/^(\d+) ＋ (\d+) ＝ (-?\d+)$/);
        const matchSub = p.answer.match(/^(\d+) − (\d+) ＝ (-?\d+)$/);
        const matchMul = p.answer.match(/^(\d+) × (\d+) ＝ (-?\d+)$/);
        if (matchAdd) {
          expect(Number(matchAdd[1]) + Number(matchAdd[2])).toBe(
            Number(matchAdd[3]),
          );
        }
        if (matchSub) {
          expect(Number(matchSub[1]) - Number(matchSub[2])).toBe(
            Number(matchSub[3]),
          );
        }
        if (matchMul) {
          expect(Number(matchMul[1]) * Number(matchMul[2])).toBe(
            Number(matchMul[3]),
          );
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateEstimate(42, 10);
    const b = generateEstimate(42, 10);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateEstimate(1, 10);
    const b = generateEstimate(2, 10);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});

// ---------------------------------------------------------------------------
// generateDecimalPlace
// ---------------------------------------------------------------------------
describe("generateDecimalPlace", () => {
  it("returns 10 problems", () => {
    const problems = generateDecimalPlace(42, "count");
    expect(problems).toHaveLength(10);
  });

  it("count mode: questions involve 0.1 counting", () => {
    for (const seed of seeds) {
      const problems = generateDecimalPlace(seed, "count");
      for (const p of problems) {
        expect(p.question).toContain("0.1");
      }
    }
  });

  it("multiply mode: questions involve multiplication or 1/10", () => {
    for (const seed of seeds) {
      const problems = generateDecimalPlace(seed, "multiply");
      for (const p of problems) {
        const hasMul = p.question.includes("倍") || p.question.includes("1/10");
        expect(hasMul).toBe(true);
      }
    }
  });

  it("mixed mode produces both count and multiply types", () => {
    let hasCount = false;
    let hasMultiply = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateDecimalPlace(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("0.1が") || p.question.includes("は0.1が"))
          hasCount = true;
        if (p.question.includes("倍") || p.question.includes("1/10"))
          hasMultiply = true;
      }
    }
    expect(hasCount).toBe(true);
    expect(hasMultiply).toBe(true);
  });

  it("count mode: 0.1 * count = value relationship", () => {
    for (const seed of seeds) {
      const problems = generateDecimalPlace(seed, "count");
      for (const p of problems) {
        const countMatch = p.question.match(/0\.1が(\d+)個で□/);
        if (countMatch) {
          const count = Number(countMatch[1]);
          expect(p.answer).toBe(`${count / 10}`);
        }
        const valMatch = p.question.match(/^(.+)は0\.1が□個$/);
        if (valMatch) {
          const val = Number(valMatch[1]);
          const count = Number(p.answer);
          expect(val).toBeCloseTo(count / 10, 5);
        }
      }
    }
  });

  it("answers are valid numbers", () => {
    for (const seed of seeds) {
      for (const mode of ["count", "multiply", "mixed"] as const) {
        const problems = generateDecimalPlace(seed, mode);
        for (const p of problems) {
          const ansNum = Number(p.answer);
          expect(Number.isNaN(ansNum)).toBe(false);
          expect(ansNum).toBeGreaterThan(0);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateDecimalPlace(42, "mixed");
    const b = generateDecimalPlace(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateDecimalPlace(1, "count");
    const b = generateDecimalPlace(2, "count");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});

// ---------------------------------------------------------------------------
// generateDivCheck
// ---------------------------------------------------------------------------
describe("generateDivCheck", () => {
  it("returns 10 problems", () => {
    const problems = generateDivCheck(42);
    expect(problems).toHaveLength(10);
  });

  it("questions reference division verification", () => {
    for (const seed of seeds) {
      const problems = generateDivCheck(seed);
      for (const p of problems) {
        expect(p.question).toContain("÷");
        expect(p.question).toContain("確かめ");
      }
    }
  });

  it("division check: divisor * quotient + remainder = dividend", () => {
    for (const seed of seeds) {
      const problems = generateDivCheck(seed);
      for (const p of problems) {
        // Parse question: "dividend ÷ divisor ＝ quotient [あまり remainder] を確かめなさい"
        const withRemMatch = p.question.match(
          /^(\d+) ÷ (\d+) ＝ (\d+) あまり (\d+)/,
        );
        const noRemMatch = p.question.match(/^(\d+) ÷ (\d+) ＝ (\d+) を/);

        if (withRemMatch) {
          const dividend = Number(withRemMatch[1]);
          const divisor = Number(withRemMatch[2]);
          const quotient = Number(withRemMatch[3]);
          const remainder = Number(withRemMatch[4]);
          expect(divisor * quotient + remainder).toBe(dividend);
          expect(remainder).toBeLessThan(divisor);
          expect(remainder).toBeGreaterThan(0);
        } else if (noRemMatch) {
          const dividend = Number(noRemMatch[1]);
          const divisor = Number(noRemMatch[2]);
          const quotient = Number(noRemMatch[3]);
          expect(divisor * quotient).toBe(dividend);
        }
      }
    }
  });

  it("answer format matches check formula", () => {
    for (const seed of seeds) {
      const problems = generateDivCheck(seed);
      for (const p of problems) {
        // Answer should contain "＝ <dividend>"
        expect(p.answer).toContain("＝");
        const parts = p.answer.split("＝");
        const dividend = Number(parts[parts.length - 1].trim());
        expect(Number.isInteger(dividend)).toBe(true);
        expect(dividend).toBeGreaterThan(0);
      }
    }
  });

  it("divisors are between 2 and 9", () => {
    for (const seed of seeds) {
      const problems = generateDivCheck(seed);
      for (const p of problems) {
        const match = p.question.match(/÷ (\d+)/);
        expect(match).not.toBeNull();
        const divisor = Number(match![1]);
        expect(divisor).toBeGreaterThanOrEqual(2);
        expect(divisor).toBeLessThanOrEqual(9);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateDivCheck(42);
    const b = generateDivCheck(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateDivCheck(1);
    const b = generateDivCheck(2);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});

// ---------------------------------------------------------------------------
// generateLargeNum4
// ---------------------------------------------------------------------------
describe("generateLargeNum4", () => {
  it("returns 10 problems", () => {
    const problems = generateLargeNum4(42, "read");
    expect(problems).toHaveLength(10);
  });

  it("read mode: questions or answers involve 億 or 兆", () => {
    for (const seed of seeds) {
      const problems = generateLargeNum4(seed, "read");
      for (const p of problems) {
        const hasLargeUnit =
          p.question.includes("億") ||
          p.question.includes("兆") ||
          p.answer.includes("億") ||
          p.answer.includes("兆");
        expect(hasLargeUnit).toBe(true);
      }
    }
  });

  it("position mode: questions ask about unit counts", () => {
    for (const seed of seeds) {
      const problems = generateLargeNum4(seed, "position");
      for (const p of problems) {
        expect(p.question).toContain("が□個");
        const ans = Number(p.answer);
        expect(Number.isInteger(ans)).toBe(true);
        expect(ans).toBeGreaterThanOrEqual(1);
        expect(ans).toBeLessThanOrEqual(9);
      }
    }
  });

  it("mixed mode produces both read and position types", () => {
    let hasRead = false;
    let hasPosition = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateLargeNum4(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("が□個")) hasPosition = true;
        else hasRead = true;
      }
    }
    expect(hasRead).toBe(true);
    expect(hasPosition).toBe(true);
  });

  it("answers are valid non-empty strings", () => {
    for (const seed of seeds) {
      for (const mode of ["read", "position", "mixed"] as const) {
        const problems = generateLargeNum4(seed, mode);
        for (const p of problems) {
          expect(p.answer.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateLargeNum4(42, "mixed");
    const b = generateLargeNum4(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateLargeNum4(1, "read");
    const b = generateLargeNum4(2, "read");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});

// ---------------------------------------------------------------------------
// generateCalcTrick
// ---------------------------------------------------------------------------
describe("generateCalcTrick", () => {
  it("returns 8 problems", () => {
    const problems = generateCalcTrick(42);
    expect(problems).toHaveLength(8);
  });

  it("questions mention くふうして計算しなさい", () => {
    for (const seed of seeds) {
      const problems = generateCalcTrick(seed);
      for (const p of problems) {
        expect(p.question).toContain("くふうして計算しなさい");
      }
    }
  });

  it("answers are valid positive integers", () => {
    for (const seed of seeds) {
      const problems = generateCalcTrick(seed);
      for (const p of problems) {
        const ansNum = Number(p.answer);
        expect(Number.isNaN(ansNum)).toBe(false);
        expect(Number.isInteger(ansNum)).toBe(true);
        expect(ansNum).toBeGreaterThan(0);
      }
    }
  });

  it("25 * N problems: answer is correct", () => {
    for (const seed of seeds) {
      const problems = generateCalcTrick(seed);
      for (const p of problems) {
        const match25 = p.question.match(/^25 × (\d+)/);
        if (match25) {
          const n = Number(match25[1]);
          expect(p.answer).toBe(`${25 * n}`);
          // n should be a multiple of 4
          expect(n % 4).toBe(0);
        }
      }
    }
  });

  it("99 * N problems: answer is correct", () => {
    for (const seed of seeds) {
      const problems = generateCalcTrick(seed);
      for (const p of problems) {
        const match99 = p.question.match(/^99 × (\d+)/);
        if (match99) {
          const n = Number(match99[1]);
          expect(p.answer).toBe(`${99 * n}`);
        }
      }
    }
  });

  it("101 * N problems: answer is correct", () => {
    for (const seed of seeds) {
      const problems = generateCalcTrick(seed);
      for (const p of problems) {
        const match101 = p.question.match(/^101 × (\d+)/);
        if (match101) {
          const n = Number(match101[1]);
          expect(p.answer).toBe(`${101 * n}`);
        }
      }
    }
  });

  it("distributive property problems: a*(b+c) = a*b + a*c", () => {
    for (const seed of seeds) {
      const problems = generateCalcTrick(seed);
      for (const p of problems) {
        const matchDist = p.question.match(
          /^(\d+) × (\d+) ＋ (\d+) × (\d+)/,
        );
        if (matchDist) {
          const a1 = Number(matchDist[1]);
          const b = Number(matchDist[2]);
          const a2 = Number(matchDist[3]);
          const c = Number(matchDist[4]);
          expect(a1).toBe(a2); // same factor
          expect(p.answer).toBe(`${a1 * (b + c)}`);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateCalcTrick(42);
    const b = generateCalcTrick(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateCalcTrick(1);
    const b = generateCalcTrick(2);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});

// ---------------------------------------------------------------------------
// generatePatternTable
// ---------------------------------------------------------------------------
describe("generatePatternTable", () => {
  it("returns 6 problems", () => {
    const problems = generatePatternTable(42);
    expect(problems).toHaveLength(6);
  });

  it("each problem has 6 x-values [1..6]", () => {
    for (const seed of seeds) {
      const problems = generatePatternTable(seed);
      for (const p of problems) {
        expect(p.xValues).toEqual([1, 2, 3, 4, 5, 6]);
      }
    }
  });

  it("each problem has exactly 2 blanks (null values) in yValues", () => {
    for (const seed of seeds) {
      const problems = generatePatternTable(seed);
      for (const p of problems) {
        const blanks = p.yValues.filter((y) => y === null);
        expect(blanks).toHaveLength(2);
        expect(p.answers).toHaveLength(2);
      }
    }
  });

  it("first and last y-values are never blank", () => {
    for (const seed of seeds) {
      const problems = generatePatternTable(seed);
      for (const p of problems) {
        expect(p.yValues[0]).not.toBeNull();
        expect(p.yValues[5]).not.toBeNull();
      }
    }
  });

  it("y = a * x + b relationship holds for all values", () => {
    for (const seed of seeds) {
      const problems = generatePatternTable(seed);
      for (const p of problems) {
        // Reconstruct full y-values
        const fullY: number[] = [];
        let ansIdx = 0;
        for (const y of p.yValues) {
          if (y !== null) {
            fullY.push(y);
          } else {
            fullY.push(p.answers[ansIdx++]);
          }
        }

        // Derive a and b from first two known values
        // y = a*x + b => from x=1: fullY[0] = a + b, x=2: fullY[1] = 2a + b
        const a = fullY[1] - fullY[0];
        const b = fullY[0] - a;

        for (let i = 0; i < 6; i++) {
          expect(fullY[i]).toBe(a * (i + 1) + b);
        }
      }
    }
  });

  it("rule string matches pattern", () => {
    for (const seed of seeds) {
      const problems = generatePatternTable(seed);
      for (const p of problems) {
        expect(p.rule).toMatch(/y ＝ \d+ × x/);
      }
    }
  });

  it("labels are non-empty strings", () => {
    for (const seed of seeds) {
      const problems = generatePatternTable(seed);
      for (const p of problems) {
        expect(p.label.length).toBeGreaterThan(0);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generatePatternTable(42);
    const b = generatePatternTable(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generatePatternTable(1);
    const b = generatePatternTable(2);
    const aAnswers = a.map((p) => p.answers);
    const bAnswers = b.map((p) => p.answers);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});

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

// ---------------------------------------------------------------------------
// generateCrossTable
// ---------------------------------------------------------------------------
describe("generateCrossTable", () => {
  it("returns 4 problems", () => {
    const problems = generateCrossTable(42);
    expect(problems).toHaveLength(4);
  });

  it("each problem has a title, row/col labels, cells, and answers", () => {
    for (const seed of seeds) {
      const problems = generateCrossTable(seed);
      for (const p of problems) {
        expect(p.title.length).toBeGreaterThan(0);
        expect(p.rowLabels.length).toBeGreaterThanOrEqual(3); // at least 2 rows + 合計
        expect(p.colLabels.length).toBeGreaterThanOrEqual(4); // at least 3 cols + 合計
        expect(p.cells.length).toBe(p.rowLabels.length);
        for (const row of p.cells) {
          expect(row.length).toBe(p.colLabels.length);
        }
        expect(p.answers.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("last row label and last col label are 合計", () => {
    for (const seed of seeds) {
      const problems = generateCrossTable(seed);
      for (const p of problems) {
        expect(p.rowLabels[p.rowLabels.length - 1]).toBe("合計");
        expect(p.colLabels[p.colLabels.length - 1]).toBe("合計");
      }
    }
  });

  it("blanks are in total row/column only", () => {
    for (const seed of seeds) {
      const problems = generateCrossTable(seed);
      for (const p of problems) {
        const nrows = p.rowLabels.length - 1; // excluding 合計
        const ncols = p.colLabels.length - 1; // excluding 合計
        for (let r = 0; r < nrows; r++) {
          for (let c = 0; c < ncols; c++) {
            // data cells (non-total) should never be null
            expect(p.cells[r][c]).not.toBeNull();
          }
        }
      }
    }
  });

  it("number of null cells equals number of answers", () => {
    for (const seed of seeds) {
      const problems = generateCrossTable(seed);
      for (const p of problems) {
        let nullCount = 0;
        for (const row of p.cells) {
          for (const cell of row) {
            if (cell === null) nullCount++;
          }
        }
        expect(nullCount).toBe(p.answers.length);
      }
    }
  });

  it("non-null totals equal the sum of data cells in that row/column", () => {
    for (const seed of seeds) {
      const problems = generateCrossTable(seed);
      for (const p of problems) {
        const nrows = p.rowLabels.length - 1;
        const ncols = p.colLabels.length - 1;

        // Check non-null row totals (last column)
        for (let r = 0; r < nrows; r++) {
          const rowTotal = p.cells[r][ncols];
          if (rowTotal !== null) {
            let sum = 0;
            for (let c = 0; c < ncols; c++) {
              sum += p.cells[r][c] as number;
            }
            expect(rowTotal).toBe(sum);
          }
        }

        // Check non-null column totals (last row)
        for (let c = 0; c < ncols; c++) {
          const colTotal = p.cells[nrows][c];
          if (colTotal !== null) {
            let sum = 0;
            for (let r = 0; r < nrows; r++) {
              sum += p.cells[r][c] as number;
            }
            expect(colTotal).toBe(sum);
          }
        }

        // Check non-null grand total
        const grandCell = p.cells[nrows][ncols];
        if (grandCell !== null) {
          let grandTotal = 0;
          for (let r = 0; r < nrows; r++) {
            for (let c = 0; c < ncols; c++) {
              grandTotal += p.cells[r][c] as number;
            }
          }
          expect(grandCell).toBe(grandTotal);
        }
      }
    }
  });

  it("answers are correct totals for the blanked cells", () => {
    for (const seed of seeds) {
      const problems = generateCrossTable(seed);
      for (const p of problems) {
        const nrows = p.rowLabels.length - 1;
        const ncols = p.colLabels.length - 1;

        // Compute expected row totals, col totals, and grand total from data cells
        const rowTotals: number[] = [];
        for (let r = 0; r < nrows; r++) {
          let sum = 0;
          for (let c = 0; c < ncols; c++) {
            sum += p.cells[r][c] as number;
          }
          rowTotals.push(sum);
        }
        const colTotals: number[] = [];
        for (let c = 0; c < ncols; c++) {
          let sum = 0;
          for (let r = 0; r < nrows; r++) {
            sum += p.cells[r][c] as number;
          }
          colTotals.push(sum);
        }
        const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

        // Build expected values for total cells
        const expectedTotals: Map<string, number> = new Map();
        for (let r = 0; r < nrows; r++) {
          expectedTotals.set(`${r},${ncols}`, rowTotals[r]);
        }
        for (let c = 0; c < ncols; c++) {
          expectedTotals.set(`${nrows},${c}`, colTotals[c]);
        }
        expectedTotals.set(`${nrows},${ncols}`, grandTotal);

        // Every answer should match an expected total value
        // Collect the null positions and their expected values
        const nullExpected: number[] = [];
        for (let r = 0; r < p.cells.length; r++) {
          for (let c = 0; c < p.cells[r].length; c++) {
            if (p.cells[r][c] === null) {
              const key = `${r},${c}`;
              expect(expectedTotals.has(key)).toBe(true);
              nullExpected.push(expectedTotals.get(key)!);
            }
          }
        }

        // The answers (in blankPositions order) should be a permutation of
        // the null cells' expected values (in row-major order).
        // Since both sets contain the same values, sort and compare.
        const sortedAnswers = [...p.answers].sort((a, b) => a - b);
        const sortedExpected = [...nullExpected].sort((a, b) => a - b);
        expect(sortedAnswers).toEqual(sortedExpected);
      }
    }
  });

  it("data cell values are between 1 and 15", () => {
    for (const seed of seeds) {
      const problems = generateCrossTable(seed);
      for (const p of problems) {
        const nrows = p.rowLabels.length - 1;
        const ncols = p.colLabels.length - 1;
        for (let r = 0; r < nrows; r++) {
          for (let c = 0; c < ncols; c++) {
            const val = p.cells[r][c] as number;
            expect(val).toBeGreaterThanOrEqual(1);
            expect(val).toBeLessThanOrEqual(15);
          }
        }
      }
    }
  });

  it("has 3 to 4 blanks per problem", () => {
    for (const seed of seeds) {
      const problems = generateCrossTable(seed);
      for (const p of problems) {
        expect(p.answers.length).toBeGreaterThanOrEqual(3);
        expect(p.answers.length).toBeLessThanOrEqual(4);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateCrossTable(42);
    const b = generateCrossTable(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateCrossTable(1);
    const b = generateCrossTable(2);
    const aAnswers = a.map((p) => p.answers);
    const bAnswers = b.map((p) => p.answers);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
