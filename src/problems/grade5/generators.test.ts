import { describe, it, expect } from "vitest";
import { gcd, lcm, simplify } from "../shared/math-utils";
import {
  generatePercent,
  generateSpeed,
  generateAreaFormula,
  generateFracDecimal,
  generateAverage,
  generateDiffFrac,
  generateVolume,
  generateCircumference,
  generateEvenOdd,
  generateFracCompare,
  generateUnitAmount,
  generateDecimalShift,
  generatePatternEq,
} from "./generators";

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

// ---------------------------------------------------------------------------
// generateAreaFormula
// ---------------------------------------------------------------------------
describe("generateAreaFormula", () => {
  it("returns 10 problems", () => {
    const problems = generateAreaFormula(42, "triangle");
    expect(problems).toHaveLength(10);
  });

  it("triangle: area = base * height / 2", () => {
    for (const seed of seeds) {
      const problems = generateAreaFormula(seed, "triangle");
      for (const p of problems) {
        expect(p.question).toContain("三角形");
        const match = p.question.match(/底辺(\d+)cm、高さ(\d+)cm/);
        expect(match).not.toBeNull();
        const base = Number(match![1]);
        const height = Number(match![2]);
        const area = (base * height) / 2;
        expect(p.answer).toBe(`${area}cm²`);
        // base should be even for integer area
        expect(base % 2).toBe(0);
      }
    }
  });

  it("parallelogram: area = base * height", () => {
    for (const seed of seeds) {
      const problems = generateAreaFormula(seed, "parallelogram");
      for (const p of problems) {
        expect(p.question).toContain("平行四辺形");
        const match = p.question.match(/底辺(\d+)cm、高さ(\d+)cm/);
        expect(match).not.toBeNull();
        const base = Number(match![1]);
        const height = Number(match![2]);
        expect(p.answer).toBe(`${base * height}cm²`);
      }
    }
  });

  it("trapezoid: area = (upper + lower) * height / 2", () => {
    for (const seed of seeds) {
      const problems = generateAreaFormula(seed, "trapezoid");
      for (const p of problems) {
        expect(p.question).toContain("台形");
        const match = p.question.match(/上底(\d+)cm、下底(\d+)cm、高さ(\d+)cm/);
        expect(match).not.toBeNull();
        const upper = Number(match![1]);
        const lower = Number(match![2]);
        const height = Number(match![3]);
        const area = (upper + lower) * height / 2;
        expect(p.answer).toBe(`${area}cm²`);
        // area should be an integer
        expect(Number.isInteger(area)).toBe(true);
      }
    }
  });

  it("mixed mode produces all three shape types", () => {
    let hasTriangle = false;
    let hasParallelogram = false;
    let hasTrapezoid = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateAreaFormula(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("三角形")) hasTriangle = true;
        if (p.question.includes("平行四辺形")) hasParallelogram = true;
        if (p.question.includes("台形")) hasTrapezoid = true;
      }
    }
    expect(hasTriangle).toBe(true);
    expect(hasParallelogram).toBe(true);
    expect(hasTrapezoid).toBe(true);
  });

  it("all areas are positive integers", () => {
    for (const seed of seeds) {
      for (const shape of ["triangle", "parallelogram", "trapezoid"] as const) {
        const problems = generateAreaFormula(seed, shape);
        for (const p of problems) {
          const areaMatch = p.answer.match(/(\d+)cm²/);
          expect(areaMatch).not.toBeNull();
          const area = Number(areaMatch![1]);
          expect(area).toBeGreaterThan(0);
          expect(Number.isInteger(area)).toBe(true);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateAreaFormula(42, "mixed");
    const b = generateAreaFormula(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateAreaFormula(1, "triangle");
    const b = generateAreaFormula(2, "triangle");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});

// ---------------------------------------------------------------------------
// generateFracDecimal
// ---------------------------------------------------------------------------
describe("generateFracDecimal", () => {
  it("returns 10 problems", () => {
    const problems = generateFracDecimal(42, "to-decimal");
    expect(problems).toHaveLength(10);
  });

  it("to-decimal: answer equals num/den as a decimal", () => {
    for (const seed of seeds) {
      const problems = generateFracDecimal(seed, "to-decimal");
      for (const p of problems) {
        expect(p.question).toContain("小数で表しなさい");
        const match = p.question.match(/(\d+)\/(\d+)/);
        expect(match).not.toBeNull();
        const num = Number(match![1]);
        const den = Number(match![2]);
        const decimal = num / den;
        expect(Number(p.answer)).toBeCloseTo(decimal, 10);
      }
    }
  });

  it("to-fraction: answer equals the fraction representation", () => {
    for (const seed of seeds) {
      const problems = generateFracDecimal(seed, "to-fraction");
      for (const p of problems) {
        expect(p.question).toContain("分数で表しなさい");
        const qMatch = p.question.match(/([\d.]+)\s*を分数/);
        expect(qMatch).not.toBeNull();
        const decimal = Number(qMatch![1]);
        const aMatch = p.answer.match(/(\d+)\/(\d+)/);
        expect(aMatch).not.toBeNull();
        const ansNum = Number(aMatch![1]);
        const ansDen = Number(aMatch![2]);
        expect(ansNum / ansDen).toBeCloseTo(decimal, 10);
      }
    }
  });

  it("mixed mode produces both directions", () => {
    let hasToDecimal = false;
    let hasToFraction = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateFracDecimal(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("小数で表しなさい")) hasToDecimal = true;
        if (p.question.includes("分数で表しなさい")) hasToFraction = true;
      }
    }
    expect(hasToDecimal).toBe(true);
    expect(hasToFraction).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const a = generateFracDecimal(42, "mixed");
    const b = generateFracDecimal(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateFracDecimal(1, "to-decimal");
    const b = generateFracDecimal(2, "to-decimal");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});

// ---------------------------------------------------------------------------
// generateAverage
// ---------------------------------------------------------------------------
describe("generateAverage", () => {
  it("returns 8 problems", () => {
    const problems = generateAverage(42, 4);
    expect(problems).toHaveLength(8);
  });

  it("the average of the values equals the answer", () => {
    for (const seed of seeds) {
      for (const count of [3, 4, 5]) {
        const problems = generateAverage(seed, count);
        for (const p of problems) {
          // Parse numbers from the question
          const nums = p.question.replace(/の平均は？/, "").split("、").map(Number);
          expect(nums).toHaveLength(count);
          const sum = nums.reduce((a, b) => a + b, 0);
          const avg = sum / count;
          expect(avg).toBe(Number(p.answer));
        }
      }
    }
  });

  it("answer is an integer between 50 and 99", () => {
    for (const seed of seeds) {
      const problems = generateAverage(seed, 4);
      for (const p of problems) {
        const ans = Number(p.answer);
        expect(Number.isInteger(ans)).toBe(true);
        expect(ans).toBeGreaterThanOrEqual(50);
        expect(ans).toBeLessThanOrEqual(99);
      }
    }
  });

  it("all individual values are between 1 and 100", () => {
    for (const seed of seeds) {
      const problems = generateAverage(seed, 5);
      for (const p of problems) {
        const nums = p.question.replace(/の平均は？/, "").split("、").map(Number);
        for (const n of nums) {
          expect(n).toBeGreaterThanOrEqual(1);
          expect(n).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateAverage(42, 4);
    const b = generateAverage(42, 4);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateAverage(1, 4);
    const b = generateAverage(2, 4);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});

// ---------------------------------------------------------------------------
// generateDiffFrac
// ---------------------------------------------------------------------------
describe("generateDiffFrac", () => {
  it("returns 12 problems", () => {
    const problems = generateDiffFrac(42, "add");
    expect(problems).toHaveLength(12);
  });

  it("addition: answer equals sum of fractions simplified", () => {
    for (const seed of seeds) {
      const problems = generateDiffFrac(seed, "add");
      for (const p of problems) {
        expect(p.op).toBe("+");
        const commonDen = lcm(p.aDen, p.bDen);
        const aConv = p.aNum * (commonDen / p.aDen);
        const bConv = p.bNum * (commonDen / p.bDen);
        const rawNum = aConv + bConv;
        const [sNum, sDen] = simplify(rawNum, commonDen);
        expect(p.ansNum).toBe(sNum);
        expect(p.ansDen).toBe(sDen);
      }
    }
  });

  it("answer is in lowest terms", () => {
    for (const seed of seeds) {
      const problems = generateDiffFrac(seed, "mixed");
      for (const p of problems) {
        expect(gcd(p.ansNum, p.ansDen)).toBe(1);
      }
    }
  });

  it("answer numerator and denominator are positive", () => {
    for (const seed of seeds) {
      const problems = generateDiffFrac(seed, "mixed");
      for (const p of problems) {
        expect(p.ansNum).toBeGreaterThan(0);
        expect(p.ansDen).toBeGreaterThan(0);
      }
    }
  });

  it("mixed number parts are correct when present", () => {
    for (const seed of seeds) {
      const problems = generateDiffFrac(seed, "mixed");
      for (const p of problems) {
        if (p.ansWhole !== undefined && p.ansPartNum !== undefined) {
          expect(p.ansWhole).toBe(Math.floor(p.ansNum / p.ansDen));
          expect(p.ansPartNum).toBe(p.ansNum % p.ansDen);
          expect(p.ansWhole).toBeGreaterThan(0);
          expect(p.ansPartNum).toBeGreaterThan(0);
        }
      }
    }
  });

  it("denominators are between 2 and 10", () => {
    for (const seed of seeds) {
      const problems = generateDiffFrac(seed, "mixed");
      for (const p of problems) {
        expect(p.aDen).toBeGreaterThanOrEqual(2);
        expect(p.aDen).toBeLessThanOrEqual(10);
        expect(p.bDen).toBeGreaterThanOrEqual(2);
        expect(p.bDen).toBeLessThanOrEqual(10);
      }
    }
  });

  it("input denominators are different", () => {
    for (const seed of seeds) {
      const problems = generateDiffFrac(seed, "add");
      for (const p of problems) {
        expect(p.aDen).not.toBe(p.bDen);
      }
    }
  });

  it("numerators are proper fractions (less than denominator)", () => {
    for (const seed of seeds) {
      const problems = generateDiffFrac(seed, "mixed");
      for (const p of problems) {
        expect(p.aNum).toBeGreaterThanOrEqual(1);
        expect(p.aNum).toBeLessThan(p.aDen);
        expect(p.bNum).toBeGreaterThanOrEqual(1);
        expect(p.bNum).toBeLessThan(p.bDen);
      }
    }
  });

  it("op is + for add mode and - for sub mode", () => {
    for (const seed of seeds) {
      const addProblems = generateDiffFrac(seed, "add");
      for (const p of addProblems) {
        expect(p.op).toBe("+");
      }
      const subProblems = generateDiffFrac(seed, "sub");
      for (const p of subProblems) {
        expect(p.op).toBe("−");
      }
    }
  });

  it("mixed mode produces both + and - operations", () => {
    let hasAdd = false;
    let hasSub = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateDiffFrac(seed, "mixed");
      for (const p of problems) {
        if (p.op === "+") hasAdd = true;
        if (p.op === "−") hasSub = true;
      }
    }
    expect(hasAdd).toBe(true);
    expect(hasSub).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const a = generateDiffFrac(42, "mixed");
    const b = generateDiffFrac(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateDiffFrac(1, "add");
    const b = generateDiffFrac(2, "add");
    const aNums = a.map((p) => p.ansNum);
    const bNums = b.map((p) => p.ansNum);
    expect(aNums).not.toEqual(bNums);
  });
});

// ---------------------------------------------------------------------------
// generateVolume
// ---------------------------------------------------------------------------
describe("generateVolume", () => {
  it("returns 10 problems", () => {
    const problems = generateVolume(42, "cube");
    expect(problems).toHaveLength(10);
  });

  it("cube: volume = side^3", () => {
    for (const seed of seeds) {
      const problems = generateVolume(seed, "cube");
      for (const p of problems) {
        expect(p.question).toContain("立方体");
        const match = p.question.match(/一辺(\d+)cm/);
        expect(match).not.toBeNull();
        const side = Number(match![1]);
        expect(p.answer).toBe(`${side * side * side}cm³`);
      }
    }
  });

  it("rect: volume = a * b * c", () => {
    for (const seed of seeds) {
      const problems = generateVolume(seed, "rect");
      for (const p of problems) {
        expect(p.question).toContain("直方体");
        const match = p.question.match(/たて(\d+)cm、よこ(\d+)cm、高さ(\d+)cm/);
        expect(match).not.toBeNull();
        const a = Number(match![1]);
        const b = Number(match![2]);
        const c = Number(match![3]);
        expect(p.answer).toBe(`${a * b * c}cm³`);
      }
    }
  });

  it("cube side is between 1 and 10", () => {
    for (const seed of seeds) {
      const problems = generateVolume(seed, "cube");
      for (const p of problems) {
        const match = p.question.match(/一辺(\d+)cm/);
        const side = Number(match![1]);
        expect(side).toBeGreaterThanOrEqual(1);
        expect(side).toBeLessThanOrEqual(10);
      }
    }
  });

  it("rect dimensions are between 2 and 11", () => {
    for (const seed of seeds) {
      const problems = generateVolume(seed, "rect");
      for (const p of problems) {
        const match = p.question.match(/たて(\d+)cm、よこ(\d+)cm、高さ(\d+)cm/);
        const a = Number(match![1]);
        const b = Number(match![2]);
        const c = Number(match![3]);
        expect(a).toBeGreaterThanOrEqual(2);
        expect(a).toBeLessThanOrEqual(11);
        expect(b).toBeGreaterThanOrEqual(2);
        expect(b).toBeLessThanOrEqual(11);
        expect(c).toBeGreaterThanOrEqual(2);
        expect(c).toBeLessThanOrEqual(11);
      }
    }
  });

  it("mixed mode produces both cube and rect types", () => {
    let hasCube = false;
    let hasRect = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateVolume(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("立方体")) hasCube = true;
        if (p.question.includes("直方体")) hasRect = true;
      }
    }
    expect(hasCube).toBe(true);
    expect(hasRect).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const a = generateVolume(42, "mixed");
    const b = generateVolume(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateVolume(1, "cube");
    const b = generateVolume(2, "cube");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});

// ---------------------------------------------------------------------------
// generateCircumference
// ---------------------------------------------------------------------------
describe("generateCircumference", () => {
  it("returns 10 problems", () => {
    const problems = generateCircumference(42, "forward");
    expect(problems).toHaveLength(10);
  });

  it("forward: circumference = diameter * 3.14", () => {
    for (const seed of seeds) {
      const problems = generateCircumference(seed, "forward");
      for (const p of problems) {
        expect(p.question).toContain("円周は");
        const match = p.question.match(/直径(\d+)cm/);
        expect(match).not.toBeNull();
        const d = Number(match![1]);
        const expected = Number((d * 3.14).toFixed(2)).toString();
        expect(p.answer).toBe(`${expected}cm`);
      }
    }
  });

  it("reverse: diameter = circumference / 3.14", () => {
    for (const seed of seeds) {
      const problems = generateCircumference(seed, "reverse");
      for (const p of problems) {
        expect(p.question).toContain("直径は");
        const match = p.question.match(/円周が([\d.]+)cm/);
        expect(match).not.toBeNull();
        const circ = Number(match![1]);
        const dAnswer = p.answer.match(/(\d+)cm/);
        expect(dAnswer).not.toBeNull();
        const d = Number(dAnswer![1]);
        // Verify: d * 3.14 should equal the circumference
        const expectedCirc = Number((d * 3.14).toFixed(2)).toString();
        expect(String(circ)).toBe(expectedCirc);
      }
    }
  });

  it("forward: diameter is between 1 and 20", () => {
    for (const seed of seeds) {
      const problems = generateCircumference(seed, "forward");
      for (const p of problems) {
        const match = p.question.match(/直径(\d+)cm/);
        const d = Number(match![1]);
        expect(d).toBeGreaterThanOrEqual(1);
        expect(d).toBeLessThanOrEqual(20);
      }
    }
  });

  it("reverse: diameter is between 2 and 21", () => {
    for (const seed of seeds) {
      const problems = generateCircumference(seed, "reverse");
      for (const p of problems) {
        const dMatch = p.answer.match(/(\d+)cm/);
        const d = Number(dMatch![1]);
        expect(d).toBeGreaterThanOrEqual(2);
        expect(d).toBeLessThanOrEqual(21);
      }
    }
  });

  it("mixed mode produces both forward and reverse types", () => {
    let hasForward = false;
    let hasReverse = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateCircumference(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("円周は")) hasForward = true;
        if (p.question.includes("直径は")) hasReverse = true;
      }
    }
    expect(hasForward).toBe(true);
    expect(hasReverse).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const a = generateCircumference(42, "mixed");
    const b = generateCircumference(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateCircumference(1, "forward");
    const b = generateCircumference(2, "forward");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});

// ---------------------------------------------------------------------------
// generateEvenOdd
// ---------------------------------------------------------------------------
describe("generateEvenOdd", () => {
  it("returns 15 problems", () => {
    const problems = generateEvenOdd(42, 100);
    expect(problems).toHaveLength(15);
  });

  it("even answers contain only even numbers from the list", () => {
    for (const seed of seeds) {
      const problems = generateEvenOdd(seed, 100);
      for (const p of problems) {
        for (const n of p.evenAnswers) {
          expect(n % 2).toBe(0);
          expect(p.numbers).toContain(n);
        }
      }
    }
  });

  it("odd answers contain only odd numbers from the list", () => {
    for (const seed of seeds) {
      const problems = generateEvenOdd(seed, 100);
      for (const p of problems) {
        for (const n of p.oddAnswers) {
          expect(n % 2).toBe(1);
          expect(p.numbers).toContain(n);
        }
      }
    }
  });

  it("even and odd answers together account for all numbers", () => {
    for (const seed of seeds) {
      const problems = generateEvenOdd(seed, 50);
      for (const p of problems) {
        const combined = [...p.evenAnswers, ...p.oddAnswers].sort((a, b) => a - b);
        // Each number should appear in even or odd; note duplicates are possible
        expect(combined.length).toBe(p.numbers.length);
      }
    }
  });

  it("answers are sorted in ascending order", () => {
    for (const seed of seeds) {
      const problems = generateEvenOdd(seed, 100);
      for (const p of problems) {
        for (let i = 1; i < p.evenAnswers.length; i++) {
          expect(p.evenAnswers[i]).toBeGreaterThanOrEqual(p.evenAnswers[i - 1]);
        }
        for (let i = 1; i < p.oddAnswers.length; i++) {
          expect(p.oddAnswers[i]).toBeGreaterThanOrEqual(p.oddAnswers[i - 1]);
        }
      }
    }
  });

  it("each problem has 8-12 numbers", () => {
    for (const seed of seeds) {
      const problems = generateEvenOdd(seed, 100);
      for (const p of problems) {
        expect(p.numbers.length).toBeGreaterThanOrEqual(8);
        expect(p.numbers.length).toBeLessThanOrEqual(12);
      }
    }
  });

  it("numbers are between 1 and range", () => {
    for (const seed of seeds) {
      for (const range of [50, 100, 200]) {
        const problems = generateEvenOdd(seed, range);
        for (const p of problems) {
          for (const n of p.numbers) {
            expect(n).toBeGreaterThanOrEqual(1);
            expect(n).toBeLessThanOrEqual(range);
          }
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateEvenOdd(42, 100);
    const b = generateEvenOdd(42, 100);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateEvenOdd(1, 100);
    const b = generateEvenOdd(2, 100);
    const aNums = a.map((p) => p.numbers);
    const bNums = b.map((p) => p.numbers);
    expect(aNums).not.toEqual(bNums);
  });
});

// ---------------------------------------------------------------------------
// generateFracCompare
// ---------------------------------------------------------------------------
describe("generateFracCompare", () => {
  it("returns 15 problems", () => {
    const problems = generateFracCompare(42);
    expect(problems).toHaveLength(15);
  });

  it("answer matches the actual comparison of fraction values", () => {
    for (const seed of seeds) {
      const problems = generateFracCompare(seed);
      for (const p of problems) {
        const aVal = p.aNum / p.aDen;
        const bVal = p.bNum / p.bDen;
        if (Math.abs(aVal - bVal) < 1e-10) {
          expect(p.answer).toBe("＝");
        } else if (aVal > bVal) {
          expect(p.answer).toBe("＞");
        } else {
          expect(p.answer).toBe("＜");
        }
      }
    }
  });

  it("first two problems have equal fractions", () => {
    for (const seed of seeds) {
      const problems = generateFracCompare(seed);
      expect(problems[0].answer).toBe("＝");
      expect(problems[1].answer).toBe("＝");
    }
  });

  it("all fractions are proper (numerator < denominator)", () => {
    for (const seed of seeds) {
      const problems = generateFracCompare(seed);
      for (const p of problems) {
        expect(p.aNum).toBeGreaterThanOrEqual(1);
        expect(p.aNum).toBeLessThan(p.aDen);
        expect(p.bNum).toBeGreaterThanOrEqual(1);
        expect(p.bNum).toBeLessThan(p.bDen);
      }
    }
  });

  it("denominators are at least 2", () => {
    for (const seed of seeds) {
      const problems = generateFracCompare(seed);
      for (const p of problems) {
        expect(p.aDen).toBeGreaterThanOrEqual(2);
        expect(p.bDen).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("answer is one of the three valid symbols", () => {
    for (const seed of seeds) {
      const problems = generateFracCompare(seed);
      for (const p of problems) {
        expect(["＞", "＜", "＝"]).toContain(p.answer);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateFracCompare(42);
    const b = generateFracCompare(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateFracCompare(1);
    const b = generateFracCompare(2);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});

// ---------------------------------------------------------------------------
// generateUnitAmount
// ---------------------------------------------------------------------------
describe("generateUnitAmount", () => {
  it("returns 8 problems", () => {
    const problems = generateUnitAmount(42);
    expect(problems).toHaveLength(8);
  });

  it("per-unit problems: answer = total / area", () => {
    for (const seed of seeds) {
      const problems = generateUnitAmount(seed);
      for (const p of problems) {
        if (p.question.includes("あたり何人") || p.question.includes("人口密度")) {
          // find per unit: total / area
          const areaMatch = p.question.match(/面積(\d+)/);
          const totalMatch = p.question.match(/に(\d+)/);
          expect(areaMatch).not.toBeNull();
          expect(totalMatch).not.toBeNull();
          const area = Number(areaMatch![1]);
          const total = Number(totalMatch![1]);
          const perUnit = total / area;
          const ansMatch = p.answer.match(/(\d+)/);
          expect(ansMatch).not.toBeNull();
          expect(Number(ansMatch![1])).toBe(perUnit);
        } else {
          // find total: perUnit * area
          const perUnitMatch = p.question.match(/あたり(\d+)/);
          const areaMatch = p.question.match(/面積が(\d+)/);
          expect(perUnitMatch).not.toBeNull();
          expect(areaMatch).not.toBeNull();
          const perUnit = Number(perUnitMatch![1]);
          const area = Number(areaMatch![1]);
          const ansMatch = p.answer.match(/(\d+)/);
          expect(ansMatch).not.toBeNull();
          expect(Number(ansMatch![1])).toBe(perUnit * area);
        }
      }
    }
  });

  it("area is between 5 and 24", () => {
    for (const seed of seeds) {
      const problems = generateUnitAmount(seed);
      for (const p of problems) {
        const areaMatch = p.question.match(/面積[がは]?(\d+)/);
        if (!areaMatch) {
          const areaMatch2 = p.question.match(/面積(\d+)/);
          expect(areaMatch2).not.toBeNull();
        }
      }
    }
  });

  it("produces both per-unit and total question types", () => {
    let hasPerUnit = false;
    let hasTotal = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateUnitAmount(seed);
      for (const p of problems) {
        if (p.question.includes("あたり何人") || p.question.includes("人口密度")) hasPerUnit = true;
        if (p.question.includes("全部で何")) hasTotal = true;
      }
    }
    expect(hasPerUnit).toBe(true);
    expect(hasTotal).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const a = generateUnitAmount(42);
    const b = generateUnitAmount(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateUnitAmount(1);
    const b = generateUnitAmount(2);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});

// ---------------------------------------------------------------------------
// generateDecimalShift
// ---------------------------------------------------------------------------
describe("generateDecimalShift", () => {
  it("returns 10 problems", () => {
    const problems = generateDecimalShift(42);
    expect(problems).toHaveLength(10);
  });

  it("multiplication: answer = number * multiplier", () => {
    for (const seed of seeds) {
      const problems = generateDecimalShift(seed);
      for (const p of problems) {
        if (p.question.includes("倍は")) {
          const match = p.question.match(/([\d.]+)の(\d+)倍は/);
          expect(match).not.toBeNull();
          const n = Number(match![1]);
          const mul = Number(match![2]);
          const expected = n * mul;
          const expectedStr = expected % 1 === 0
            ? String(expected)
            : Number(expected.toFixed(5)).toString();
          expect(p.answer).toBe(expectedStr);
        }
      }
    }
  });

  it("division: answer = number / divisor", () => {
    for (const seed of seeds) {
      const problems = generateDecimalShift(seed);
      for (const p of problems) {
        if (p.question.includes("1/")) {
          const match = p.question.match(/([\d.]+)の1\/(\d+)は/);
          expect(match).not.toBeNull();
          const n = Number(match![1]);
          const div = Number(match![2]);
          const expected = n / div;
          const expectedStr = Number(expected.toFixed(5)).toString();
          expect(p.answer).toBe(expectedStr);
        }
      }
    }
  });

  it("multiplier/divisor is 10, 100, or 1000", () => {
    for (const seed of seeds) {
      const problems = generateDecimalShift(seed);
      for (const p of problems) {
        if (p.question.includes("倍は")) {
          const match = p.question.match(/の(\d+)倍は/);
          expect([10, 100, 1000]).toContain(Number(match![1]));
        } else {
          const match = p.question.match(/の1\/(\d+)は/);
          expect([10, 100, 1000]).toContain(Number(match![1]));
        }
      }
    }
  });

  it("produces both multiplication and division types", () => {
    let hasMul = false;
    let hasDiv = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateDecimalShift(seed);
      for (const p of problems) {
        if (p.question.includes("倍は")) hasMul = true;
        if (p.question.includes("1/")) hasDiv = true;
      }
    }
    expect(hasMul).toBe(true);
    expect(hasDiv).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const a = generateDecimalShift(42);
    const b = generateDecimalShift(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateDecimalShift(1);
    const b = generateDecimalShift(2);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});

// ---------------------------------------------------------------------------
// generatePatternEq
// ---------------------------------------------------------------------------
describe("generatePatternEq", () => {
  it("returns 6 problems", () => {
    const problems = generatePatternEq(42);
    expect(problems).toHaveLength(6);
  });

  it("the rule y = a*x + b fits all table values", () => {
    for (const seed of seeds) {
      const problems = generatePatternEq(seed);
      for (const p of problems) {
        // Parse the answer to extract a and b
        const mulMatch = p.answer.match(/y ＝ (\d+) × x/);
        expect(mulMatch).not.toBeNull();
        const a = Number(mulMatch![1]);
        const addMatch = p.answer.match(/＋ (\d+)/);
        const b = addMatch ? Number(addMatch[1]) : 0;

        // Parse x,y pairs from question
        const pairs = [...p.question.matchAll(/x=(\d+)のときy=(\d+)/g)];
        expect(pairs.length).toBe(5);
        for (const pair of pairs) {
          const x = Number(pair[1]);
          const y = Number(pair[2]);
          expect(y).toBe(a * x + b);
        }
      }
    }
  });

  it("coefficient a is between 2 and 9", () => {
    for (const seed of seeds) {
      const problems = generatePatternEq(seed);
      for (const p of problems) {
        const mulMatch = p.answer.match(/y ＝ (\d+) × x/);
        const a = Number(mulMatch![1]);
        expect(a).toBeGreaterThanOrEqual(2);
        expect(a).toBeLessThanOrEqual(9);
      }
    }
  });

  it("constant b is between 0 and 9", () => {
    for (const seed of seeds) {
      const problems = generatePatternEq(seed);
      for (const p of problems) {
        const addMatch = p.answer.match(/＋ (\d+)/);
        const b = addMatch ? Number(addMatch[1]) : 0;
        expect(b).toBeGreaterThanOrEqual(0);
        expect(b).toBeLessThanOrEqual(9);
      }
    }
  });

  it("x values are always [1, 2, 3, 4, 5]", () => {
    for (const seed of seeds) {
      const problems = generatePatternEq(seed);
      for (const p of problems) {
        const pairs = [...p.question.matchAll(/x=(\d+)のときy=(\d+)/g)];
        const xValues = pairs.map((m) => Number(m[1]));
        expect(xValues).toEqual([1, 2, 3, 4, 5]);
      }
    }
  });

  it("when b=0, answer format is y = a * x (no constant)", () => {
    // Find problems where b=0 across many seeds
    for (const seed of seeds) {
      const problems = generatePatternEq(seed);
      for (const p of problems) {
        const addMatch = p.answer.match(/＋ (\d+)/);
        if (!addMatch) {
          // b=0 case: answer should be "y = a × x"
          expect(p.answer).toMatch(/^y ＝ \d+ × x$/);
        }
      }
    }
  });

  it("when b>0, answer format includes the constant", () => {
    for (const seed of seeds) {
      const problems = generatePatternEq(seed);
      for (const p of problems) {
        const addMatch = p.answer.match(/＋ (\d+)/);
        if (addMatch) {
          expect(p.answer).toMatch(/^y ＝ \d+ × x ＋ \d+$/);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generatePatternEq(42);
    const b = generatePatternEq(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generatePatternEq(1);
    const b = generatePatternEq(2);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
