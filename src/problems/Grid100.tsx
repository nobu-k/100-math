import type { ProblemGroup } from "./types";
import Addition from "./grid100/Addition";
import Subtraction from "./grid100/Subtraction";
import Multiplication from "./grid100/Multiplication";

export const grid100: ProblemGroup = {
  id: "grid100",
  label: "百マス計算",
  operators: [
    { operator: "addition", label: "たし算", grades: [1, 2], category: "computation", Component: Addition },
    { operator: "subtraction", label: "ひき算", grades: [1, 2], category: "computation", Component: Subtraction },
    { operator: "multiplication", label: "かけ算", grades: [2, 3], category: "computation", Component: Multiplication },
  ],
};
