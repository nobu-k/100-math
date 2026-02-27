import type { ProblemGroup } from "./types";
import SeqLimit from "./math3/SeqLimit";
import Differentiation from "./math3/Differentiation";
import Integration from "./math3/Integration";

export const math3: ProblemGroup = {
  id: "math3",
  label: "数学III",
  operators: [
    { operator: "seq-limit", label: "数列の極限", grades: [14], category: "hs-sequence", subcategory: "極限", Component: SeqLimit },
    { operator: "differentiation", label: "微分法", grades: [14], category: "hs-diff", subcategory: "微分法", Component: Differentiation },
    { operator: "integration", label: "積分法", grades: [14], category: "hs-integral", subcategory: "積分法", Component: Integration },
  ],
};
