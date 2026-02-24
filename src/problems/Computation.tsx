import type { ProblemGroup } from "./types";
import FillBlank from "./computation/FillBlank";
import KukuBlank from "./computation/KukuBlank";
import Mushikui from "./computation/Mushikui";
import Division from "./computation/Division";
import MentalMath from "./computation/MentalMath";
import MixedCalc from "./computation/MixedCalc";
import DivCheck from "./computation/DivCheck";
import CalcTrick from "./computation/CalcTrick";
import Estimate from "./computation/Estimate";
import FracMixedCalc from "./computation/FracMixedCalc";
import PosNegAddSub from "./computation/PosNegAddSub";
import PosNegMulDiv from "./computation/PosNegMulDiv";
import PosNegMixed from "./computation/PosNegMixed";
import PolyAddSub from "./computation/PolyAddSub";
import MonoMulDiv from "./computation/MonoMulDiv";

export const computation: ProblemGroup = {
  id: "computation",
  label: "計算",
  operators: [
    { operator: "fill-blank", label: "穴埋め加減", grades: [1], category: "computation", Component: FillBlank },
    { operator: "kuku-blank", label: "九九の穴埋め", grades: [2], category: "computation", Component: KukuBlank },
    { operator: "mushikui", label: "虫食い算", grades: [2], category: "computation", Component: Mushikui },
    { operator: "division", label: "わり算", grades: [3], category: "computation", Component: Division },
    { operator: "mental-math", label: "暗算", grades: [3], category: "computation", Component: MentalMath },
    { operator: "mixed-calc", label: "四則混合", grades: [4], category: "computation", Component: MixedCalc },
    { operator: "div-check", label: "わり算の検算", grades: [4], category: "computation", Component: DivCheck },
    { operator: "calc-trick", label: "計算のくふう", grades: [4], category: "computation", Component: CalcTrick },
    { operator: "estimate", label: "見積もり", grades: [4], category: "computation", Component: Estimate },
    { operator: "frac-mixed-calc", label: "分数の四則混合", grades: [6], category: "computation", Component: FracMixedCalc },
    { operator: "pos-neg-add-sub", label: "正負の加減", grades: [7], category: "computation", Component: PosNegAddSub },
    { operator: "pos-neg-mul-div", label: "正負の乗除", grades: [7], category: "computation", Component: PosNegMulDiv },
    { operator: "pos-neg-mixed", label: "正負の四則混合", grades: [7], category: "computation", Component: PosNegMixed },
    { operator: "poly-add-sub", label: "多項式の加減", grades: [8], category: "computation", Component: PolyAddSub },
    { operator: "mono-mul-div", label: "単項式の乗除", grades: [8], category: "computation", Component: MonoMulDiv },
  ],
};
