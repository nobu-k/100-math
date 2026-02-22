import { mulberry32 } from "../random";

export type PythagoreanMode = "basic" | "special" | "applied" | "mixed";

export interface PythagoreanProblem {
  type: PythagoreanMode;
  question: string;
  answerDisplay: string;
}

function simplifyRoot(n: number): [number, number] {
  let outer = 1;
  let inner = n;
  for (let d = 2; d * d <= inner; d++) {
    while (inner % (d * d) === 0) {
      outer *= d;
      inner /= d * d;
    }
  }
  return [outer, inner];
}

function fmtRoot(outer: number, inner: number): string {
  if (inner === 1) return `${outer}`;
  if (outer === 1) return `√${inner}`;
  return `${outer}√${inner}`;
}

// Pythagorean triples for integer-answer problems
const TRIPLES = [
  [3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25],
  [6, 8, 10], [9, 12, 15], [12, 16, 20], [15, 20, 25],
  [9, 40, 41], [11, 60, 61], [20, 21, 29],
];

export function generatePythagorean(
  seed: number,
  mode: PythagoreanMode = "mixed",
): PythagoreanProblem[] {
  const rng = mulberry32(seed);
  const problems: PythagoreanProblem[] = [];
  const seen = new Set<string>();
  const types: PythagoreanMode[] =
    mode === "mixed" ? ["basic", "special", "applied"] : [mode];

  for (let i = 0; i < 12; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const type = types[Math.floor(rng() * types.length)];

      let question: string;
      let answerDisplay: string;

      if (type === "basic") {
        const triple = TRIPLES[Math.floor(rng() * TRIPLES.length)];
        const variant = Math.floor(rng() * 3);

        if (variant === 0) {
          // Find hypotenuse
          question = `直角三角形の2辺が ${triple[0]}cm と ${triple[1]}cm のとき斜辺は？`;
          answerDisplay = `${triple[2]}cm`;
        } else if (variant === 1) {
          // Find a leg
          question = `直角三角形の斜辺が ${triple[2]}cm、一辺が ${triple[0]}cm のとき他の辺は？`;
          answerDisplay = `${triple[1]}cm`;
        } else {
          // Non-integer answer: use two sides that aren't a triple
          const a = 2 + Math.floor(rng() * 8); // 2-9
          const b = 2 + Math.floor(rng() * 8);
          const cSq = a * a + b * b;
          const sqrtC = Math.sqrt(cSq);
          if (sqrtC === Math.floor(sqrtC)) continue; // skip triples
          const [outer, inner] = simplifyRoot(cSq);
          question = `直角三角形の2辺が ${a}cm と ${b}cm のとき斜辺は？`;
          answerDisplay = `${fmtRoot(outer, inner)}cm`;
        }
      } else if (type === "special") {
        const specialType = Math.floor(rng() * 3);

        if (specialType === 0) {
          // 45-45-90: sides 1:1:√2
          const side = 2 + Math.floor(rng() * 8); // 2-9
          const variant = rng() < 0.5;
          if (variant) {
            question = `直角二等辺三角形の一辺が ${side}cm のとき斜辺は？`;
            answerDisplay = `${side}√2cm`;
          } else {
            const hyp = side; // hypotenuse given
            question = `直角二等辺三角形の斜辺が ${hyp}√2cm のとき他の辺は？`;
            answerDisplay = `${hyp}cm`;
          }
        } else if (specialType === 1) {
          // 30-60-90: sides 1:√3:2
          const short = 2 + Math.floor(rng() * 6); // 2-7
          const variant = Math.floor(rng() * 3);
          if (variant === 0) {
            question = `30°-60°-90° の三角形で短い辺が ${short}cm のとき斜辺は？`;
            answerDisplay = `${short * 2}cm`;
          } else if (variant === 1) {
            question = `30°-60°-90° の三角形で短い辺が ${short}cm のとき長い辺は？`;
            answerDisplay = `${short}√3cm`;
          } else {
            question = `30°-60°-90° の三角形で斜辺が ${short * 2}cm のとき短い辺は？`;
            answerDisplay = `${short}cm`;
          }
        } else {
          // Equilateral triangle height
          const side = 2 + Math.floor(rng() * 8); // 2-9
          // Height = (√3/2) × side
          if (side % 2 === 0) {
            const half = side / 2;
            question = `一辺 ${side}cm の正三角形の高さは？`;
            answerDisplay = `${half}√3cm`;
          } else {
            question = `一辺 ${side}cm の正三角形の高さは？`;
            // side√3 / 2
            answerDisplay = `${side}√3/2cm`;
          }
        }
      } else {
        // Applied: distance between two points, cuboid diagonal
        const appType = Math.floor(rng() * 2);

        if (appType === 0) {
          // Distance between 2 points
          const x1 = Math.floor(rng() * 9) - 4;
          const y1 = Math.floor(rng() * 9) - 4;
          const x2 = x1 + 1 + Math.floor(rng() * 6);
          const y2 = y1 + (rng() < 0.5 ? 1 : -1) * (1 + Math.floor(rng() * 6));
          const dx = x2 - x1;
          const dy = y2 - y1;
          const distSq = dx * dx + dy * dy;
          const sqrtDist = Math.sqrt(distSq);
          question = `2点 (${x1}, ${y1}) と (${x2}, ${y2}) の距離は？`;
          if (sqrtDist === Math.floor(sqrtDist)) {
            answerDisplay = `${sqrtDist}`;
          } else {
            const [outer, inner] = simplifyRoot(distSq);
            answerDisplay = fmtRoot(outer, inner);
          }
        } else {
          // Cuboid diagonal
          const a = 2 + Math.floor(rng() * 8);
          const b = 2 + Math.floor(rng() * 8);
          const c = 2 + Math.floor(rng() * 8);
          const diagSq = a * a + b * b + c * c;
          const sqrtDiag = Math.sqrt(diagSq);
          question = `直方体（${a}cm × ${b}cm × ${c}cm）の対角線の長さは？`;
          if (sqrtDiag === Math.floor(sqrtDiag)) {
            answerDisplay = `${sqrtDiag}cm`;
          } else {
            const [outer, inner] = simplifyRoot(diagSq);
            answerDisplay = `${fmtRoot(outer, inner)}cm`;
          }
        }
      }

      const key = question;
      if (!seen.has(key) || attempt === 39) {
        seen.add(key);
        problems.push({ type, question, answerDisplay });
        break;
      }
    }
  }
  return problems;
}
