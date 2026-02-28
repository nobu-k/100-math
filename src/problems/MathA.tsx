import type { ProblemGroup } from "./types";
import PermutationCombination from "./mathA/PermutationCombination";
import Probability from "./mathA/Probability";
import EuclideanGcd from "./mathA/EuclideanGcd";
import BaseConversion from "./mathA/BaseConversion";
import TriangleProperties from "./mathA/TriangleProperties";
import CircleProperties from "./mathA/CircleProperties";

export const mathA: ProblemGroup = {
  id: "mathA",
  label: "数学A",
  operators: [
    { operator: "permutation-combination", label: "順列・組合せ", grades: [11], category: "hs-prob", subcategory: "場合の数・確率", Component: PermutationCombination },
    { operator: "probability", label: "確率", grades: [11], category: "hs-prob", subcategory: "場合の数・確率", Component: Probability },
    { operator: "euclidean-gcd", label: "ユークリッドの互除法", grades: [11], category: "hs-integer", subcategory: "整数の性質", Component: EuclideanGcd },
    { operator: "base-conversion", label: "n進法", grades: [11], category: "hs-integer", subcategory: "整数の性質", Component: BaseConversion },
    { operator: "triangle-properties", label: "三角形の性質", grades: [11], category: "hs-geometry", subcategory: "図形の性質", Component: TriangleProperties },
    { operator: "circle-properties", label: "円の性質", grades: [11], category: "hs-geometry", subcategory: "図形の性質", Component: CircleProperties },
  ],
};
