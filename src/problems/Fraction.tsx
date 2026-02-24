import type { ProblemGroup } from "./types";
import Addition from "./fraction/Addition";
import Reduction from "./fraction/Reduction";
import CommonDenominator from "./fraction/CommonDenominator";

export const fraction: ProblemGroup = {
  id: "fraction",
  label: "分数",
  operators: [
    { operator: "addition", label: "たし算", grades: [4, 5, 6], category: "fractions", Component: Addition },
    { operator: "reduction", label: "約分", grades: [5, 6], category: "fractions", Component: Reduction },
    { operator: "common-denominator", label: "通分", grades: [5, 6], category: "fractions", Component: CommonDenominator },
  ],
};
