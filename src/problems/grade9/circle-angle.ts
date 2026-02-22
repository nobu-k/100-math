import { mulberry32 } from "../random";

export type CircleAngleMode = "basic" | "inscribed" | "mixed";

export interface CircleAngleProblem {
  type: "central-to-inscribed" | "inscribed-to-central" | "semicircle" | "inscribed-quadrilateral";
  question: string;
  answer: number;
  answerDisplay: string;
}

export function generateCircleAngle(
  seed: number,
  mode: CircleAngleMode = "mixed",
): CircleAngleProblem[] {
  const rng = mulberry32(seed);
  const problems: CircleAngleProblem[] = [];
  const seen = new Set<string>();

  const allTypes: CircleAngleProblem["type"][] = [
    "central-to-inscribed",
    "inscribed-to-central",
    "semicircle",
    "inscribed-quadrilateral",
  ];

  for (let i = 0; i < 10; i++) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const type = mode === "inscribed"
        ? (["inscribed-quadrilateral", "semicircle"] as const)[Math.floor(rng() * 2)]
        : allTypes[Math.floor(rng() * allTypes.length)];

      let question: string;
      let answer: number;

      if (type === "central-to-inscribed") {
        // Central angle given, find inscribed angle
        const central = (2 + Math.floor(rng() * 170 / 2)) * 2; // even, 4-340
        if (central > 340 || central < 20) continue;
        question = `弧ABに対する中心角が ${central}° のとき、円周角は？`;
        answer = central / 2;
      } else if (type === "inscribed-to-central") {
        const inscribed = 10 + Math.floor(rng() * 80); // 10-89
        question = `弧ABに対する円周角が ${inscribed}° のとき、中心角は？`;
        answer = inscribed * 2;
      } else if (type === "semicircle") {
        // Inscribed angle in semicircle = 90°
        const variant = rng() < 0.5;
        if (variant) {
          question = "半円の弧に対する円周角は何度？";
          answer = 90;
        } else {
          const otherAngle = 20 + Math.floor(rng() * 60); // 20-79
          question = `半円に内接する三角形ABCで ∠A = ${otherAngle}°、∠B = 90° のとき ∠C = ?`;
          answer = 90 - otherAngle;
        }
      } else {
        // Inscribed quadrilateral: opposite angles sum to 180°
        const angleA = 40 + Math.floor(rng() * 101); // 40-140
        const variant = rng() < 0.5;
        if (variant) {
          question = `円に内接する四角形ABCDで ∠A = ${angleA}° のとき ∠C = ?`;
          answer = 180 - angleA;
        } else {
          question = `円に内接する四角形ABCDで ∠B = ${angleA}° のとき ∠D = ?`;
          answer = 180 - angleA;
        }
      }

      const key = `${type}-${question}`;
      if (!seen.has(key) || attempt === 29) {
        seen.add(key);
        problems.push({ type, question, answer, answerDisplay: `${answer}°` });
        break;
      }
    }
  }
  return problems;
}
