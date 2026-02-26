import type { ProblemGroup } from "./types";
import DecimalComp from "./fractions/DecimalComp";
import DecimalShift from "./fractions/DecimalShift";

export const decimals: ProblemGroup = {
  id: "decimals",
  label: "小数",
  operators: [
    { operator: "decimal-comp", label: "小数の大小比較", grades: [3], category: "decimals", Component: DecimalComp },
    { operator: "decimal-shift", label: "小数点の移動", grades: [5], category: "decimals", Component: DecimalShift },
  ],
};
