import type { ProblemGroup } from "./types";
import CubicExpandFactor from "./math2/CubicExpandFactor";
import ComplexNumber from "./math2/ComplexNumber";
import Exponent from "./math2/Exponent";
import LogCalc from "./math2/LogCalc";
import Radian from "./math2/Radian";
import TrigFunc from "./math2/TrigFunc";
import DerivativePoly from "./math2/DerivativePoly";
import IntegralPoly from "./math2/IntegralPoly";
import CoordGeometry from "./math2/CoordGeometry";

export const math2: ProblemGroup = {
  id: "math2",
  label: "数学II",
  operators: [
    { operator: "cubic-expand-factor", label: "三次式の展開・因数分解", grades: [12], category: "hs-expr", subcategory: "式と証明", Component: CubicExpandFactor },
    { operator: "complex-number", label: "複素数と方程式", grades: [12], category: "hs-equation", subcategory: "式と証明", Component: ComplexNumber },
    { operator: "exponent", label: "指数の拡張", grades: [12], category: "hs-function", subcategory: "指数・対数", Component: Exponent },
    { operator: "log-calc", label: "対数の計算", grades: [12], category: "hs-function", subcategory: "指数・対数", Component: LogCalc },
    { operator: "radian", label: "弧度法", grades: [12], category: "hs-trig", subcategory: "三角関数", Component: Radian },
    { operator: "trig-func", label: "三角関数", grades: [12], category: "hs-trig", subcategory: "三角関数", Component: TrigFunc },
    { operator: "derivative-poly", label: "多項式の微分", grades: [12], category: "hs-diff", subcategory: "微分・積分", Component: DerivativePoly },
    { operator: "integral-poly", label: "多項式の積分", grades: [12], category: "hs-integral", subcategory: "微分・積分", Component: IntegralPoly },
    { operator: "coord-geometry", label: "座標幾何", grades: [12], category: "hs-geometry", subcategory: "図形と方程式", Component: CoordGeometry },
  ],
};
