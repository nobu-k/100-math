import type { ProblemGroup } from "./types";
import Multiples from "./integer/Multiples";
import Factors from "./integer/Factors";
import Lcm from "./integer/Lcm";
import Gcd from "./integer/Gcd";

export const integer: ProblemGroup = {
  id: "integer",
  label: "整数",
  operators: [
    { operator: "multiples", label: "倍数", grades: [5], category: "numbers", Component: Multiples },
    { operator: "factors", label: "約数", grades: [5], category: "numbers", Component: Factors },
    { operator: "lcm", label: "最小公倍数", grades: [5], category: "numbers", Component: Lcm },
    { operator: "gcd", label: "最大公約数", grades: [5], category: "numbers", Component: Gcd },
  ],
};
