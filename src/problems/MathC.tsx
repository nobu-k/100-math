import type { ProblemGroup } from "./types";
import VectorCalc from "./mathC/VectorCalc";
import ComplexPlane from "./mathC/ComplexPlane";

export const mathC: ProblemGroup = {
  id: "mathC",
  label: "数学C",
  operators: [
    { operator: "vector-calc", label: "ベクトルの演算", grades: [12], category: "mathC", Component: VectorCalc },
    { operator: "complex-plane", label: "複素数平面", grades: [12], category: "mathC", Component: ComplexPlane },
  ],
};
