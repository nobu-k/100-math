import type { ProblemGroup } from "./types";
import ArithmeticSeq from "./mathB/ArithmeticSeq";
import GeometricSeq from "./mathB/GeometricSeq";
import SigmaSum from "./mathB/SigmaSum";
import BinomialDist from "./mathB/BinomialDist";
import NormalDist from "./mathB/NormalDist";
import Recurrence from "./mathB/Recurrence";
import MathInduction from "./mathB/MathInduction";
import ConfidenceHypothesis from "./mathB/ConfidenceHypothesis";

export const mathB: ProblemGroup = {
  id: "mathB",
  label: "数学B",
  operators: [
    { operator: "arithmetic-seq", label: "等差数列", grades: [13], category: "hs-sequence", subcategory: "数列", Component: ArithmeticSeq },
    { operator: "geometric-seq", label: "等比数列", grades: [13], category: "hs-sequence", subcategory: "数列", Component: GeometricSeq },
    { operator: "sigma-sum", label: "Σ計算", grades: [13], category: "hs-sequence", subcategory: "数列", Component: SigmaSum },
    { operator: "recurrence", label: "漸化式", grades: [13], category: "hs-sequence", subcategory: "数列", Component: Recurrence },
    { operator: "math-induction", label: "数学的帰納法", grades: [13], category: "hs-sequence", subcategory: "数列", Component: MathInduction },
    { operator: "binomial-dist", label: "二項分布", grades: [13], category: "hs-statistics", subcategory: "統計的な推測", Component: BinomialDist },
    { operator: "normal-dist", label: "正規分布", grades: [13], category: "hs-statistics", subcategory: "統計的な推測", Component: NormalDist },
    { operator: "confidence-hypothesis", label: "区間推定・仮説検定", grades: [13], category: "hs-statistics", subcategory: "統計的な推測", Component: ConfidenceHypothesis },
  ],
};
