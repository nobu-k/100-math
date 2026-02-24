import type { ProblemGroup } from "./types";
import Addition from "./hissan/Addition";
import Subtraction from "./hissan/Subtraction";
import Multiplication from "./hissan/Multiplication";
import Division from "./hissan/Division";

export const hissan: ProblemGroup = {
  id: "hissan",
  label: "ひっ算",
  operators: [
    { operator: "addition", label: "たし算", grades: [2, 3], category: "computation", Component: Addition },
    { operator: "subtraction", label: "ひき算", grades: [2, 3], category: "computation", Component: Subtraction },
    { operator: "multiplication", label: "かけ算", grades: [3, 4], category: "computation", Component: Multiplication },
    { operator: "division", label: "わり算", grades: [3, 4], category: "computation", Component: Division },
  ],
};
