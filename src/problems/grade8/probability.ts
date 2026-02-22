import { mulberry32 } from "../random";

export type ProbabilityMode = "basic" | "two-dice" | "mixed";

export interface ProbabilityProblem {
  type: "basic" | "two-dice";
  question: string;
  /** Numerator of the answer fraction */
  ansNum: number;
  /** Denominator of the answer fraction */
  ansDen: number;
  answerDisplay: string;
}

export const generateProbability = (
  seed: number,
  mode: ProbabilityMode = "mixed",
): ProbabilityProblem[] => {
  const rng = mulberry32(seed);
  const problems: ProbabilityProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < 10; i++) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const type: "basic" | "two-dice" =
        mode === "mixed"
          ? rng() < 0.5 ? "basic" : "two-dice"
          : mode as any;

      const templates = type === "basic" ? basicTemplates : twoDiceTemplates;
      const tmpl = templates[Math.floor(rng() * templates.length)];
      const result = tmpl.build(rng);
      if (!result) continue;

      const [sNum, sDen] = simplify(result.num, result.den);
      const key = result.question;
      if (!seen.has(key) || attempt === 29) {
        seen.add(key);
        problems.push({
          type,
          question: result.question,
          ansNum: sNum,
          ansDen: sDen,
          answerDisplay:
            sDen === 1 ? `${sNum}` : `${sNum}/${sDen}`,
        });
        break;
      }
    }
  }
  return problems;
};

const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
};

const simplify = (num: number, den: number): [number, number] => {
  const g = gcd(num, den);
  return [num / g, den / g];
};

interface BasicTemplate {
  build: (rng: () => number) => { question: string; num: number; den: number } | null;
}

const basicTemplates: BasicTemplate[] = [
  {
    // Dice: multiples
    build: (rng) => {
      const targets = [2, 3, 5, 6];
      const t = targets[Math.floor(rng() * targets.length)];
      let count = 0;
      for (let d = 1; d <= 6; d++) if (d % t === 0) count++;
      if (count === 0) return null;
      return {
        question: `1つのさいころを投げて、${t}の倍数が出る確率は？`,
        num: count,
        den: 6,
      };
    },
  },
  {
    // Dice: greater/less than
    build: (rng) => {
      const threshold = 2 + Math.floor(rng() * 4); // 2-5
      const isGreater = rng() < 0.5;
      let count = 0;
      for (let d = 1; d <= 6; d++) {
        if (isGreater ? d > threshold : d < threshold) count++;
      }
      if (count === 0 || count === 6) return null;
      const cond = isGreater ? `${threshold}より大きい` : `${threshold}より小さい`;
      return {
        question: `1つのさいころを投げて、${cond}目が出る確率は？`,
        num: count,
        den: 6,
      };
    },
  },
  {
    // Dice: odd/even
    build: (rng) => {
      const isOdd = rng() < 0.5;
      return {
        question: `1つのさいころを投げて、${isOdd ? "奇数" : "偶数"}が出る確率は？`,
        num: 3,
        den: 6,
      };
    },
  },
  {
    // Balls: pick one
    build: (rng) => {
      const red = 1 + Math.floor(rng() * 5); // 1-5
      const white = 1 + Math.floor(rng() * 5);
      const blue = rng() < 0.4 ? 1 + Math.floor(rng() * 3) : 0;
      const total = red + white + blue;
      const colors = [
        { name: "赤玉", count: red },
        { name: "白玉", count: white },
      ];
      if (blue > 0) colors.push({ name: "青玉", count: blue });
      const target = colors[Math.floor(rng() * colors.length)];
      const desc = colors.map((c) => `${c.name}${c.count}個`).join("、");
      return {
        question: `${desc}の袋から1個取り出して${target.name}の確率は？`,
        num: target.count,
        den: total,
      };
    },
  },
  {
    // Coins
    build: (rng) => {
      const n = 2 + Math.floor(rng() * 2); // 2-3 coins
      const total = Math.pow(2, n);
      const variant = Math.floor(rng() * 3);
      let count: number;
      let desc: string;
      if (variant === 0) {
        // all heads
        count = 1;
        desc = `${n}枚の硬貨を投げて、すべて表が出る`;
      } else if (variant === 1) {
        // exactly 1 head
        count = n;
        desc = `${n}枚の硬貨を投げて、表がちょうど1枚出る`;
      } else {
        // at least 1 head
        count = total - 1;
        desc = `${n}枚の硬貨を投げて、少なくとも1枚は表が出る`;
      }
      return { question: `${desc}確率は？`, num: count, den: total };
    },
  },
];

interface TwoDiceTemplate {
  build: (rng: () => number) => { question: string; num: number; den: number } | null;
}

const twoDiceTemplates: TwoDiceTemplate[] = [
  {
    // Sum equals target
    build: (rng) => {
      const targets = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const target = targets[Math.floor(rng() * targets.length)];
      let count = 0;
      for (let a = 1; a <= 6; a++) {
        for (let b = 1; b <= 6; b++) {
          if (a + b === target) count++;
        }
      }
      return {
        question: `2つのさいころを投げて、和が ${target} になる確率は？`,
        num: count,
        den: 36,
      };
    },
  },
  {
    // Sum is even/odd
    build: (rng) => {
      const isEven = rng() < 0.5;
      let count = 0;
      for (let a = 1; a <= 6; a++) {
        for (let b = 1; b <= 6; b++) {
          if ((a + b) % 2 === (isEven ? 0 : 1)) count++;
        }
      }
      return {
        question: `2つのさいころを投げて、和が${isEven ? "偶数" : "奇数"}になる確率は？`,
        num: count,
        den: 36,
      };
    },
  },
  {
    // Product is even
    build: () => {
      let count = 0;
      for (let a = 1; a <= 6; a++) {
        for (let b = 1; b <= 6; b++) {
          if ((a * b) % 2 === 0) count++;
        }
      }
      return {
        question: `2つのさいころを投げて、積が偶数になる確率は？`,
        num: count,
        den: 36,
      };
    },
  },
  {
    // Same number
    build: () => ({
      question: `2つのさいころを投げて、同じ目が出る確率は？`,
      num: 6,
      den: 36,
    }),
  },
  {
    // Sum >= threshold
    build: (rng) => {
      const threshold = 8 + Math.floor(rng() * 4); // 8-11
      let count = 0;
      for (let a = 1; a <= 6; a++) {
        for (let b = 1; b <= 6; b++) {
          if (a + b >= threshold) count++;
        }
      }
      return {
        question: `2つのさいころを投げて、和が ${threshold} 以上になる確率は？`,
        num: count,
        den: 36,
      };
    },
  },
];
