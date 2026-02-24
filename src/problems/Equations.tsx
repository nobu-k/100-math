import type { ProblemGroup } from "./types";
import BoxEq from "./equations/BoxEq";
import PatternEq from "./equations/PatternEq";
import LiteralExpr from "./equations/LiteralExpr";
import ExprValue from "./equations/ExprValue";
import LinearExpr from "./equations/LinearExpr";
import LinearEq from "./equations/LinearEq";
import SimultaneousEq from "./equations/SimultaneousEq";
import Expansion from "./equations/Expansion";
import Factoring from "./equations/Factoring";
import QuadraticEq from "./equations/QuadraticEq";

export const equations: ProblemGroup = {
  id: "equations",
  label: "式・方程式",
  operators: [
    { operator: "box-eq", label: "□を使った式", grades: [3], category: "equations", Component: BoxEq },
    { operator: "pattern-eq", label: "きまりの式", grades: [5], category: "equations", Component: PatternEq },
    { operator: "literal-expr", label: "文字式の値", grades: [6], category: "equations", Component: LiteralExpr },
    { operator: "expr-value", label: "式の値", grades: [7], category: "equations", Component: ExprValue },
    { operator: "linear-expr", label: "一次式の計算", grades: [7], category: "equations", Component: LinearExpr },
    { operator: "linear-eq", label: "一次方程式", grades: [7], category: "equations", Component: LinearEq },
    { operator: "simultaneous-eq", label: "連立方程式", grades: [8], category: "equations", Component: SimultaneousEq },
    { operator: "expansion", label: "式の展開", grades: [9], category: "equations", Component: Expansion },
    { operator: "factoring", label: "因数分解", grades: [9], category: "equations", Component: Factoring },
    { operator: "quadratic-eq", label: "二次方程式", grades: [9], category: "equations", Component: QuadraticEq },
  ],
};
