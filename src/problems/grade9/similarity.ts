import { mulberry32 } from "../random";

export type SimilarityMode = "ratio" | "parallel-line" | "midpoint" | "mixed";

export interface SimilarityProblem {
  type: SimilarityMode;
  question: string;
  answer: number;
  answerDisplay: string;
}

export function generateSimilarity(
  seed: number,
  mode: SimilarityMode = "mixed",
): SimilarityProblem[] {
  const rng = mulberry32(seed);
  const problems: SimilarityProblem[] = [];
  const seen = new Set<string>();
  const types: SimilarityMode[] =
    mode === "mixed"
      ? ["ratio", "parallel-line", "midpoint"]
      : [mode];

  for (let i = 0; i < 10; i++) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const type = types[Math.floor(rng() * types.length)];

      let question: string;
      let answer: number;
      let answerDisplay: string;

      if (type === "ratio") {
        // Similarity ratio problems
        const ratioA = 2 + Math.floor(rng() * 4); // 2-5
        let ratioB = ratioA + 1 + Math.floor(rng() * 4); // > ratioA
        // Ensure coprime
        while (gcd(ratioA, ratioB) > 1) ratioB++;

        const variant = Math.floor(rng() * 3);
        if (variant === 0) {
          // Find a side
          const sideA = ratioA * (2 + Math.floor(rng() * 5));
          const sideB = (sideA / ratioA) * ratioB;
          question = `△ABC ∽ △DEF で相似比が ${ratioA}:${ratioB}。AB = ${sideA}cm のとき DE = ?`;
          answer = sideB;
          answerDisplay = `${sideB}cm`;
        } else if (variant === 1) {
          // Perimeter
          const perimA = ratioA * (3 + Math.floor(rng() * 6));
          const perimB = (perimA / ratioA) * ratioB;
          question = `相似比 ${ratioA}:${ratioB} で、小さい方の周の長さが ${perimA}cm。大きい方は？`;
          answer = perimB;
          answerDisplay = `${perimB}cm`;
        } else {
          // Area ratio
          const areaA = ratioA * ratioA * (1 + Math.floor(rng() * 4));
          const areaB = (areaA / (ratioA * ratioA)) * ratioB * ratioB;
          question = `相似比 ${ratioA}:${ratioB} で、小さい方の面積が ${areaA}cm²。大きい方の面積は？`;
          answer = areaB;
          answerDisplay = `${areaB}cm²`;
        }
      } else if (type === "parallel-line") {
        // DE // BC, AD:DB = m:n, find EC given AE
        const m = 1 + Math.floor(rng() * 4); // 1-4
        const n = 1 + Math.floor(rng() * 4);
        if (m === n) continue;

        const ae = m * (1 + Math.floor(rng() * 4)); // multiple of m
        const ec = (ae / m) * n;
        if (ec !== Math.floor(ec)) continue;

        question = `△ABCで DE // BC、AD = ${ae * n / m}、DB = ${ec * m / n}... AD:DB = ${m}:${n}、AE = ${ae} のとき EC = ?`;
        // Simplify: AD:DB = m:n → AE:EC = m:n
        question = `△ABCで DE // BC、AD:DB = ${m}:${n}、AE = ${ae} のとき EC = ?`;
        answer = ec;
        answerDisplay = `${ec}`;
      } else {
        // Midpoint theorem: MN = BC/2
        const bc = (2 + Math.floor(rng() * 10)) * 2; // even number 4-22
        question = `△ABCで M, N がそれぞれ AB, AC の中点。BC = ${bc}cm のとき MN = ?`;
        answer = bc / 2;
        answerDisplay = `${bc / 2}cm`;
      }

      const key = question;
      if (!seen.has(key) || attempt === 29) {
        seen.add(key);
        problems.push({ type, question, answer, answerDisplay });
        break;
      }
    }
  }
  return problems;
}

function gcd(a: number, b: number): number {
  while (b) { [a, b] = [b, a % b]; }
  return a;
}
