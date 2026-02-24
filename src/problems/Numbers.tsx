import type { ProblemGroup } from "./types";
import Decomposition from "./numbers/Decomposition";
import Comparison from "./numbers/Comparison";
import Sequence from "./numbers/Sequence";
import LargeNum from "./numbers/LargeNum";
import LargeNum3 from "./numbers/LargeNum3";
import LargeNum4 from "./numbers/LargeNum4";
import Rounding from "./numbers/Rounding";
import DecimalPlace from "./numbers/DecimalPlace";
import EvenOdd from "./numbers/EvenOdd";
import AbsoluteValue from "./numbers/AbsoluteValue";
import Prime from "./numbers/Prime";
import SquareRoot from "./numbers/SquareRoot";

export const numbers: ProblemGroup = {
  id: "numbers",
  label: "数の性質",
  operators: [
    { operator: "decomposition", label: "数の分解", grades: [1], category: "numbers", Component: Decomposition },
    { operator: "comparison", label: "大小くらべ", grades: [1], category: "numbers", Component: Comparison },
    { operator: "sequence", label: "数のならび", grades: [1], category: "numbers", Component: Sequence },
    { operator: "large-num", label: "大きな数", grades: [2], category: "numbers", Component: LargeNum },
    { operator: "large-num3", label: "大きな数（万の位）", grades: [3], category: "numbers", Component: LargeNum3 },
    { operator: "large-num4", label: "大きな数（億・兆）", grades: [4], category: "numbers", Component: LargeNum4 },
    { operator: "rounding", label: "四捨五入", grades: [4], category: "numbers", Component: Rounding },
    { operator: "decimal-place", label: "小数の位取り", grades: [4], category: "numbers", Component: DecimalPlace },
    { operator: "even-odd", label: "偶数と奇数", grades: [5], category: "numbers", Component: EvenOdd },
    { operator: "absolute-value", label: "絶対値", grades: [7], category: "numbers", Component: AbsoluteValue },
    { operator: "prime", label: "素数・素因数分解", grades: [7], category: "numbers", Component: Prime },
    { operator: "square-root", label: "平方根", grades: [9], category: "numbers", Component: SquareRoot },
  ],
};
