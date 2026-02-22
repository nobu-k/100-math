import { mulberry32 } from "../random";

export type SamplingMode = "concept" | "estimation" | "mixed";

export interface SamplingProblem {
  type: "concept" | "estimation";
  question: string;
  answer: string | number;
  answerDisplay: string;
}

const conceptQuestions = [
  {
    q: "工場で作られた電球の寿命を調べる調査は、全数調査と標本調査のどちらが適切？",
    a: "標本調査",
    reason: "全数検査すると製品がなくなる",
  },
  {
    q: "学校の全生徒の身長を調べる調査は、全数調査と標本調査のどちらが適切？",
    a: "全数調査",
    reason: "全員測定可能",
  },
  {
    q: "湖の魚の数を推定する調査は、全数調査と標本調査のどちらが適切？",
    a: "標本調査",
    reason: "全数は不可能",
  },
  {
    q: "テレビの視聴率調査は、全数調査と標本調査のどちらが適切？",
    a: "標本調査",
    reason: "全世帯調査は現実的でない",
  },
  {
    q: "クラスの生徒の通学時間を調べる調査は、全数調査と標本調査のどちらが適切？",
    a: "全数調査",
    reason: "人数が少なく全員調査可能",
  },
  {
    q: "ネジの強度試験は、全数調査と標本調査のどちらが適切？",
    a: "標本調査",
    reason: "破壊検査のため全数は不可能",
  },
  {
    q: "選挙の出口調査は、全数調査と標本調査のどちらが適切？",
    a: "標本調査",
    reason: "全有権者への調査は現実的でない",
  },
  {
    q: "国勢調査は、全数調査と標本調査のどちらが適切？",
    a: "全数調査",
    reason: "国の基本統計のため全数が必要",
  },
];

export function generateSampling(
  seed: number,
  mode: SamplingMode = "mixed",
): SamplingProblem[] {
  const rng = mulberry32(seed);
  const problems: SamplingProblem[] = [];
  const seen = new Set<string>();
  const types: ("concept" | "estimation")[] =
    mode === "mixed" ? ["concept", "estimation"] : [mode as any];

  for (let i = 0; i < 8; i++) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const type = types[Math.floor(rng() * types.length)];

      if (type === "concept") {
        const idx = Math.floor(rng() * conceptQuestions.length);
        const cq = conceptQuestions[idx];
        const key = `concept-${idx}`;
        if (!seen.has(key) || attempt === 29) {
          seen.add(key);
          problems.push({
            type: "concept",
            question: cq.q,
            answer: cq.a,
            answerDisplay: cq.a,
          });
          break;
        }
      } else {
        // Estimation problems
        const variant = Math.floor(rng() * 3);

        if (variant === 0) {
          // Capture-recapture
          const marked = (2 + Math.floor(rng() * 4)) * 50; // 100-250
          const recaptured = (3 + Math.floor(rng() * 6)) * 10; // 30-80
          const markedInRecap = Math.floor(rng() * 5) + 2; // 2-6
          const actualMarkedInRecap = markedInRecap;
          const actualRecaptured = recaptured;
          const est = Math.round((marked * actualRecaptured) / actualMarkedInRecap);

          const question = `池の魚の数を推定する。${marked}匹に印をつけて放した。後日 ${actualRecaptured}匹を捕まえたら印付きが ${actualMarkedInRecap}匹。推定数は？`;
          const key = `est-capture-${marked}-${actualRecaptured}-${actualMarkedInRecap}`;
          if (!seen.has(key) || attempt === 29) {
            seen.add(key);
            problems.push({
              type: "estimation",
              question,
              answer: est,
              answerDisplay: `約${est}匹`,
            });
            break;
          }
        } else if (variant === 1) {
          // Proportion estimation
          const total = (5 + Math.floor(rng() * 16)) * 20; // 100-400
          const sample = 20 + Math.floor(rng() * 31); // 20-50
          const targetInSample = 2 + Math.floor(rng() * (sample / 3));
          const estimate = Math.round((total * targetInSample) / sample);

          const question = `袋に ${total}個の玉がある。${sample}個取り出したら白玉が ${targetInSample}個。全体の白玉の推定数は？`;
          const key = `est-prop-${total}-${sample}-${targetInSample}`;
          if (!seen.has(key) || attempt === 29) {
            seen.add(key);
            problems.push({
              type: "estimation",
              question,
              answer: estimate,
              answerDisplay: `約${estimate}個`,
            });
            break;
          }
        } else {
          // Defect rate estimation
          const totalProducts = (10 + Math.floor(rng() * 40)) * 100; // 1000-5000
          const sampleSize = 50 + Math.floor(rng() * 151); // 50-200
          const defects = 1 + Math.floor(rng() * 8); // 1-8
          const defectRate = defects / sampleSize;
          const estimatedDefects = Math.round(totalProducts * defectRate);

          const question = `${totalProducts}個の製品から ${sampleSize}個を検査したら ${defects}個が不良品。全体の不良品の推定数は？`;
          const key = `est-defect-${totalProducts}-${sampleSize}-${defects}`;
          if (!seen.has(key) || attempt === 29) {
            seen.add(key);
            problems.push({
              type: "estimation",
              question,
              answer: estimatedDefects,
              answerDisplay: `約${estimatedDefects}個`,
            });
            break;
          }
        }
      }
    }
  }
  return problems;
}
