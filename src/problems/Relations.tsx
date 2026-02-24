import type { ProblemGroup } from "./types";
import PatternTable from "./relations/PatternTable";
import Percent from "./relations/Percent";
import Ratio from "./relations/Ratio";
import ProportionTable from "./relations/ProportionTable";
import ProportionEq from "./relations/ProportionEq";
import Coordinate from "./relations/Coordinate";
import LinearFunc from "./relations/LinearFunc";
import QuadraticFunc from "./relations/QuadraticFunc";

export const relations: ProblemGroup = {
  id: "relations",
  label: "変化と関係",
  operators: [
    { operator: "pattern-table", label: "変わり方と表", grades: [4], category: "relations", Component: PatternTable },
    { operator: "percent", label: "割合と百分率", grades: [5], category: "relations", Component: Percent },
    { operator: "ratio", label: "比", grades: [6], category: "relations", Component: Ratio },
    { operator: "proportion-table", label: "比例と反比例", grades: [6], category: "relations", Component: ProportionTable },
    { operator: "proportion-eq", label: "比例・反比例", grades: [7], category: "relations", Component: ProportionEq },
    { operator: "coordinate", label: "座標", grades: [7], category: "relations", Component: Coordinate },
    { operator: "linear-func", label: "一次関数", grades: [8], category: "relations", Component: LinearFunc },
    { operator: "quadratic-func", label: "関数 y=ax²", grades: [9], category: "relations", Component: QuadraticFunc },
  ],
};
