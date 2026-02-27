import type { ProblemGroup } from "./types";
import CubicExpandFactor from "./math2/CubicExpandFactor";
import ComplexNumber from "./math2/ComplexNumber";
import Exponent from "./math2/Exponent";
import LogCalc from "./math2/LogCalc";
import Radian from "./math2/Radian";
import GeneralAngle from "./math2/GeneralAngle";
import AdditionFormula from "./math2/AdditionFormula";
import DoubleAngle from "./math2/DoubleAngle";
import TrigSynthesis from "./math2/TrigSynthesis";
import DerivativePoly from "./math2/DerivativePoly";
import TangentLine from "./math2/TangentLine";
import IntegralPoly from "./math2/IntegralPoly";
import PointDistance from "./math2/PointDistance";
import SectionPoint from "./math2/SectionPoint";
import LineEquation from "./math2/LineEquation";
import PointLineDistance from "./math2/PointLineDistance";

export const math2: ProblemGroup = {
  id: "math2",
  label: "数学II",
  operators: [
    { operator: "cubic-expand-factor", label: "三次式の展開・因数分解", grades: [12], category: "hs-expr", subcategory: "式と証明", Component: CubicExpandFactor },
    { operator: "complex-number", label: "複素数と方程式", grades: [12], category: "hs-equation", subcategory: "式と証明", Component: ComplexNumber },
    { operator: "exponent", label: "指数の拡張", grades: [12], category: "hs-function", subcategory: "指数・対数", Component: Exponent },
    { operator: "log-calc", label: "対数の計算", grades: [12], category: "hs-function", subcategory: "指数・対数", Component: LogCalc },
    { operator: "radian", label: "弧度法", grades: [12], category: "hs-trig", subcategory: "三角関数", Component: Radian },
    { operator: "general-angle", label: "一般角", grades: [12], category: "hs-trig", subcategory: "三角関数", Component: GeneralAngle },
    { operator: "addition-formula", label: "加法定理", grades: [12], category: "hs-trig", subcategory: "三角関数", Component: AdditionFormula },
    { operator: "double-angle", label: "倍角公式", grades: [12], category: "hs-trig", subcategory: "三角関数", Component: DoubleAngle },
    { operator: "trig-synthesis", label: "三角関数の合成", grades: [12], category: "hs-trig", subcategory: "三角関数", Component: TrigSynthesis },
    { operator: "derivative-poly", label: "微分計算・極値", grades: [12], category: "hs-diff", subcategory: "微分・積分", Component: DerivativePoly },
    { operator: "tangent-line", label: "接線の方程式", grades: [12], category: "hs-diff", subcategory: "微分・積分", Component: TangentLine },
    { operator: "integral-poly", label: "多項式の積分", grades: [12], category: "hs-integral", subcategory: "微分・積分", Component: IntegralPoly },
    { operator: "point-distance", label: "2点間の距離", grades: [12], category: "hs-geometry", subcategory: "図形と方程式", Component: PointDistance },
    { operator: "section-point", label: "内分点", grades: [12], category: "hs-geometry", subcategory: "図形と方程式", Component: SectionPoint },
    { operator: "line-equation", label: "直線の方程式", grades: [12], category: "hs-geometry", subcategory: "図形と方程式", Component: LineEquation },
    { operator: "point-line-distance", label: "点と直線の距離", grades: [12], category: "hs-geometry", subcategory: "図形と方程式", Component: PointLineDistance },
  ],
};
