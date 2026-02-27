import { mulberry32 } from "../random";

export type BaseConversionMode = "to-decimal" | "from-decimal" | "binary-arith" | "mixed";

export interface BaseConversionProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateBaseConversion = (
  seed: number,
  mode: BaseConversionMode = "mixed",
  count = 12,
): BaseConversionProblem[] => {
  const rng = mulberry32(seed);
  const problems: BaseConversionProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: BaseConversionProblem | null = null;
      if (pick === "to-decimal") result = generateToDecimal(rng);
      else if (pick === "from-decimal") result = generateFromDecimal(rng);
      else result = generateBinaryArith(rng);

      if (!result) continue;

      const key = result.expr;
      if (!seen.has(key) || attempt === 39) {
        seen.add(key);
        problems.push(result);
        break;
      }
    }
  }
  return problems;
};

const pickMode = (rng: () => number, mode: BaseConversionMode): "to-decimal" | "from-decimal" | "binary-arith" => {
  if (mode !== "mixed") return mode;
  const r = rng();
  if (r < 0.4) return "to-decimal";
  if (r < 0.75) return "from-decimal";
  return "binary-arith";
};

const generateToDecimal = (rng: () => number): BaseConversionProblem | null => {
  const bases = [2, 3, 5, 8, 16];
  const base = bases[Math.floor(rng() * bases.length)];
  const value = Math.floor(rng() * 200) + 10; // [10..209]

  const repr = value.toString(base).toUpperCase();
  const sub = subscript(base);

  const expr = `${repr}${sub} を10進法で表せ`;
  const answerExpr = `${value}`;

  return { expr, answerExpr, isNL: true };
};

const generateFromDecimal = (rng: () => number): BaseConversionProblem | null => {
  const bases = [2, 3, 5, 8, 16];
  const base = bases[Math.floor(rng() * bases.length)];
  const value = Math.floor(rng() * 200) + 10; // [10..209]

  const repr = value.toString(base).toUpperCase();
  const sub = subscript(base);

  const expr = `${value} を${base}進法で表せ`;
  const answerExpr = `${repr}${sub}`;

  return { expr, answerExpr, isNL: true };
};

const generateBinaryArith = (rng: () => number): BaseConversionProblem | null => {
  const a = Math.floor(rng() * 60) + 5;  // [5..64]
  const b = Math.floor(rng() * 40) + 5;  // [5..44]
  const isAdd = rng() < 0.5;

  const aBin = a.toString(2);
  const bBin = b.toString(2);

  if (isAdd) {
    const result = a + b;
    const expr = `${aBin}₍₂₎ + ${bBin}₍₂₎ を2進法で計算せよ`;
    const answerExpr = `${result.toString(2)}₍₂₎`;
    return { expr, answerExpr, isNL: true };
  }

  // Subtraction: ensure a >= b
  const [big, small] = a >= b ? [a, b] : [b, a];
  const bigBin = big.toString(2);
  const smallBin = small.toString(2);
  const result = big - small;
  const expr = `${bigBin}₍₂₎ − ${smallBin}₍₂₎ を2進法で計算せよ`;
  const answerExpr = `${result.toString(2)}₍₂₎`;
  return { expr, answerExpr, isNL: true };
};

const subscript = (base: number): string => {
  const subDigits: Record<string, string> = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  };
  return "₍" + `${base}`.split("").map((d) => subDigits[d] ?? d).join("") + "₎";
};
