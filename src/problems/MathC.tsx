import type { ProblemGroup } from "./types";
import VectorCalc from "./mathC/VectorCalc";
import ComplexPlane from "./mathC/ComplexPlane";

export const mathC: ProblemGroup = {
  id: "mathC",
  label: "数学C",
  operators: [
    { operator: "vector-calc", label: "ベクトルの演算", grades: [15], category: "hs-geometry", subcategory: "ベクトル", Component: VectorCalc },
    { operator: "complex-plane", label: "複素数平面", grades: [15], category: "hs-complex", subcategory: "複素数平面", Component: ComplexPlane },
  ],
};
