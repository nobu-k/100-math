import type { ProblemGroup } from "./types";
import Addition from "./fractions/Addition";
import FracConv from "./fractions/FracConv";
import Reduction from "./fractions/Reduction";
import CommonDenominator from "./fractions/CommonDenominator";
import FracDecimal from "./fractions/FracDecimal";
import DiffFrac from "./fractions/DiffFrac";
import FracCompare from "./fractions/FracCompare";
import FracMul from "./fractions/FracMul";
import FracDiv from "./fractions/FracDiv";

export const fractions: ProblemGroup = {
  id: "fractions",
  label: "分数",
  operators: [
    { operator: "addition", label: "たし算", grades: [4, 5, 6], category: "fractions", Component: Addition },
    { operator: "frac-conv", label: "分数の変換", grades: [4], category: "fractions", Component: FracConv },
    { operator: "reduction", label: "約分", grades: [5, 6], category: "fractions", Component: Reduction },
    { operator: "common-denominator", label: "通分", grades: [5, 6], category: "fractions", Component: CommonDenominator },
    { operator: "frac-decimal", label: "分数と小数", grades: [5], category: "fractions", Component: FracDecimal },
    { operator: "diff-frac", label: "異分母分数の加減", grades: [5], category: "fractions", Component: DiffFrac },
    { operator: "frac-compare", label: "分数の大小比較", grades: [5], category: "fractions", Component: FracCompare },
    { operator: "frac-mul", label: "分数×分数", grades: [6], category: "fractions", Component: FracMul },
    { operator: "frac-div", label: "分数÷分数", grades: [6], category: "fractions", Component: FracDiv },
  ],
};
