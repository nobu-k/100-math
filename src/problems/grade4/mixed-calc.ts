import { mulberry32 } from "../random";

export interface MixedCalcProblem {
  display: string;
  answer: number;
}

export function generateMixedCalc(
  seed: number,
  withParen: boolean,
): MixedCalcProblem[] {
  const rng = mulberry32(seed);
  const problems: MixedCalcProblem[] = [];

  for (let i = 0; i < 12; i++) {
    const useParen = withParen && rng() < 0.5;

    if (useParen) {
      const leftParen = rng() < 0.5;
      if (leftParen) {
        const op2IsMul = rng() < 0.5;
        if (op2IsMul) {
          const c = 2 + Math.floor(rng() * 8);
          const useAdd = rng() < 0.5;
          if (useAdd) {
            const a = 1 + Math.floor(rng() * 20);
            const b = 1 + Math.floor(rng() * 20);
            const ans = (a + b) * c;
            problems.push({ display: `(${a} ＋ ${b}) × ${c}`, answer: ans });
          } else {
            const b = 1 + Math.floor(rng() * 15);
            const a = b + 1 + Math.floor(rng() * 15);
            const ans = (a - b) * c;
            problems.push({ display: `(${a} − ${b}) × ${c}`, answer: ans });
          }
        } else {
          const c = 2 + Math.floor(rng() * 8);
          const quot = 1 + Math.floor(rng() * 10);
          const sum = quot * c;
          const useAdd = rng() < 0.5;
          if (useAdd) {
            const a = 1 + Math.floor(rng() * (sum - 1));
            const b = sum - a;
            if (b > 0) {
              problems.push({ display: `(${a} ＋ ${b}) ÷ ${c}`, answer: quot });
            }
          } else {
            const b = 1 + Math.floor(rng() * 20);
            const a = sum + b;
            problems.push({ display: `(${a} − ${b}) ÷ ${c}`, answer: quot });
          }
        }
      } else {
        const op2IsMul = rng() < 0.5;
        if (op2IsMul) {
          const a = 2 + Math.floor(rng() * 8);
          const useAdd = rng() < 0.5;
          if (useAdd) {
            const b = 1 + Math.floor(rng() * 15);
            const c = 1 + Math.floor(rng() * 15);
            const ans = a * (b + c);
            problems.push({ display: `${a} × (${b} ＋ ${c})`, answer: ans });
          } else {
            const c = 1 + Math.floor(rng() * 10);
            const b = c + 1 + Math.floor(rng() * 15);
            const ans = a * (b - c);
            problems.push({ display: `${a} × (${b} − ${c})`, answer: ans });
          }
        } else {
          const b = 2 + Math.floor(rng() * 8);
          const c = 2 + Math.floor(rng() * 8);
          const inner = b * c;
          const a = inner + 1 + Math.floor(rng() * 50);
          const ans = a - inner;
          problems.push({ display: `${a} − (${b} × ${c})`, answer: ans });
        }
      }
    } else {
      const pattern = Math.floor(rng() * 4);
      switch (pattern) {
        case 0: {
          const b = 2 + Math.floor(rng() * 9);
          const c = 2 + Math.floor(rng() * 9);
          const a = 1 + Math.floor(rng() * 50);
          problems.push({ display: `${a} ＋ ${b} × ${c}`, answer: a + b * c });
          break;
        }
        case 1: {
          const b = 2 + Math.floor(rng() * 5);
          const c = 2 + Math.floor(rng() * 5);
          const prod = b * c;
          const a = prod + 1 + Math.floor(rng() * 50);
          problems.push({ display: `${a} − ${b} × ${c}`, answer: a - prod });
          break;
        }
        case 2: {
          const a = 2 + Math.floor(rng() * 9);
          const b = 2 + Math.floor(rng() * 9);
          const c = 1 + Math.floor(rng() * 50);
          problems.push({ display: `${a} × ${b} ＋ ${c}`, answer: a * b + c });
          break;
        }
        default: {
          const a = 2 + Math.floor(rng() * 9);
          const b = 2 + Math.floor(rng() * 9);
          const prod = a * b;
          const c = 1 + Math.floor(rng() * (prod - 1));
          problems.push({ display: `${a} × ${b} − ${c}`, answer: prod - c });
          break;
        }
      }
    }
  }
  while (problems.length < 12) {
    const a = 2 + Math.floor(rng() * 9);
    const b = 2 + Math.floor(rng() * 9);
    const c = 1 + Math.floor(rng() * 50);
    problems.push({ display: `${a} × ${b} ＋ ${c}`, answer: a * b + c });
  }
  return problems.slice(0, 12);
}
