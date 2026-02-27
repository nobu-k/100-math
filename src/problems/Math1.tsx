import type { ProblemGroup } from "./types";
import IrrationalCalc from "./math1/IrrationalCalc";
import QuadraticFactor from "./math1/QuadraticFactor";
import LinearInequality from "./math1/LinearInequality";
import TrigRatio from "./math1/TrigRatio";
import QuadraticFunc from "./math1/QuadraticFunc";
import QuadraticEqIneq from "./math1/QuadraticEqIneq";

export const math1: ProblemGroup = {
  id: "math1",
  label: "数学I",
  operators: [
    { operator: "irrational-calc", label: "無理数の計算", grades: [10], category: "math1", Component: IrrationalCalc },
    { operator: "quadratic-factor", label: "展開と因数分解", grades: [10], category: "math1", Component: QuadraticFactor },
    { operator: "linear-inequality", label: "一次不等式", grades: [10], category: "math1", Component: LinearInequality },
    { operator: "trig-ratio", label: "三角比", grades: [10], category: "math1", Component: TrigRatio },
    { operator: "quadratic-func", label: "二次関数", grades: [10], category: "math1", Component: QuadraticFunc },
    { operator: "quadratic-eq-ineq", label: "二次方程式・不等式", grades: [10], category: "math1", Component: QuadraticEqIneq },
  ],
};
