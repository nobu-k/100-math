import type { ProblemGroup } from "./types";
import IrrationalCalc from "./math1/IrrationalCalc";
import QuadraticFactor from "./math1/QuadraticFactor";
import LinearInequality from "./math1/LinearInequality";
import TrigRatio from "./math1/TrigRatio";
import QuadraticFunc from "./math1/QuadraticFunc";
import QuadraticEqIneq from "./math1/QuadraticEqIneq";
import SetsLogic from "./math1/SetsLogic";
import SineCosineLaw from "./math1/SineCosineLaw";
import VarianceSd from "./math1/VarianceSd";

export const math1: ProblemGroup = {
  id: "math1",
  label: "数学I",
  operators: [
    { operator: "irrational-calc", label: "無理数の計算", grades: [10], category: "hs-expr", subcategory: "数と式", Component: IrrationalCalc },
    { operator: "quadratic-factor", label: "展開と因数分解", grades: [10], category: "hs-expr", subcategory: "数と式", Component: QuadraticFactor },
    { operator: "sets-logic", label: "集合と命題", grades: [10], category: "hs-expr", subcategory: "数と式", Component: SetsLogic },
    { operator: "quadratic-func", label: "二次関数", grades: [10], category: "hs-function", subcategory: "二次関数", Component: QuadraticFunc },
    { operator: "linear-inequality", label: "一次不等式", grades: [10], category: "hs-equation", subcategory: "方程式・不等式", Component: LinearInequality },
    { operator: "quadratic-eq-ineq", label: "二次方程式・不等式", grades: [10], category: "hs-equation", subcategory: "方程式・不等式", Component: QuadraticEqIneq },
    { operator: "trig-ratio", label: "三角比", grades: [10], category: "hs-trig", subcategory: "三角比", Component: TrigRatio },
    { operator: "sine-cosine-law", label: "正弦定理・余弦定理", grades: [10], category: "hs-trig", subcategory: "図形と計量", Component: SineCosineLaw },
    { operator: "variance-sd", label: "分散・標準偏差", grades: [10], category: "hs-data", subcategory: "データの分析", Component: VarianceSd },
  ],
};
