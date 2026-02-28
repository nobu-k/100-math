import type { ProblemGroup } from "./types";
import VectorCalc from "./mathC/VectorCalc";
import ComplexPlane from "./mathC/ComplexPlane";
import VectorGeometry from "./mathC/VectorGeometry";
import ConicSections from "./mathC/ConicSections";
import ParametricPolar from "./mathC/ParametricPolar";

export const mathC: ProblemGroup = {
  id: "mathC",
  label: "数学C",
  operators: [
    { operator: "vector-calc", label: "ベクトルの演算", grades: [15], category: "hs-geometry", subcategory: "ベクトル", Component: VectorCalc },
    { operator: "vector-geometry", label: "ベクトルと図形", grades: [15], category: "hs-geometry", subcategory: "ベクトル", Component: VectorGeometry },
    { operator: "complex-plane", label: "複素数平面", grades: [15], category: "hs-complex", subcategory: "複素数平面", Component: ComplexPlane },
    { operator: "conic-sections", label: "二次曲線", grades: [15], category: "hs-geometry", subcategory: "平面上の曲線", Component: ConicSections },
    { operator: "parametric-polar", label: "媒介変数・極座標", grades: [15], category: "hs-geometry", subcategory: "平面上の曲線", Component: ParametricPolar },
  ],
};
