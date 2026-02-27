import type { ProblemGroup } from "./types";
import PermutationCombination from "./mathA/PermutationCombination";
import Probability from "./mathA/Probability";
import EuclideanGcd from "./mathA/EuclideanGcd";
import BaseConversion from "./mathA/BaseConversion";

export const mathA: ProblemGroup = {
  id: "mathA",
  label: "数学A",
  operators: [
    { operator: "permutation-combination", label: "順列・組合せ", grades: [10], category: "mathA", Component: PermutationCombination },
    { operator: "probability", label: "確率", grades: [10], category: "mathA", Component: Probability },
    { operator: "euclidean-gcd", label: "ユークリッドの互除法", grades: [10], category: "mathA", Component: EuclideanGcd },
    { operator: "base-conversion", label: "n進法", grades: [10], category: "mathA", Component: BaseConversion },
  ],
};
