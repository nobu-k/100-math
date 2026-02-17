import { mulberry32 } from "../random";

export interface EvenOddProblem {
  numbers: number[];
  evenAnswers: number[];
  oddAnswers: number[];
}

/* ---- even-odd ---- */
export function generateEvenOdd(
  seed: number,
  range: number,
): EvenOddProblem[] {
  const rng = mulberry32(seed);
  const problems: EvenOddProblem[] = [];

  for (let i = 0; i < 15; i++) {
    const count = 8 + Math.floor(rng() * 5); // 8-12 numbers
    const numbers: number[] = [];
    for (let j = 0; j < count; j++) {
      numbers.push(1 + Math.floor(rng() * range));
    }
    const evenAnswers = numbers.filter(n => n % 2 === 0).sort((a, b) => a - b);
    const oddAnswers = numbers.filter(n => n % 2 !== 0).sort((a, b) => a - b);
    problems.push({ numbers, evenAnswers, oddAnswers });
  }
  return problems;
}
