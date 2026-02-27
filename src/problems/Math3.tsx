import type { ProblemGroup } from "./types";
import SeqLimit from "./math3/SeqLimit";
import ProductQuotientDiff from "./math3/ProductQuotientDiff";
import ChainRuleDiff from "./math3/ChainRuleDiff";
import BasicDerivative from "./math3/BasicDerivative";
import BasicIntegral from "./math3/BasicIntegral";
import SubstitutionIntegral from "./math3/SubstitutionIntegral";
import ByPartsIntegral from "./math3/ByPartsIntegral";

export const math3: ProblemGroup = {
  id: "math3",
  label: "数学III",
  operators: [
    { operator: "seq-limit", label: "数列の極限", grades: [14], category: "hs-sequence", subcategory: "極限", Component: SeqLimit },
    { operator: "product-quotient-diff", label: "積・商の微分", grades: [14], category: "hs-diff", subcategory: "微分法", Component: ProductQuotientDiff },
    { operator: "chain-rule-diff", label: "合成関数の微分", grades: [14], category: "hs-diff", subcategory: "微分法", Component: ChainRuleDiff },
    { operator: "basic-derivative", label: "基本微分", grades: [14], category: "hs-diff", subcategory: "微分法", Component: BasicDerivative },
    { operator: "basic-integral", label: "基本積分", grades: [14], category: "hs-integral", subcategory: "積分法", Component: BasicIntegral },
    { operator: "substitution-integral", label: "置換積分", grades: [14], category: "hs-integral", subcategory: "積分法", Component: SubstitutionIntegral },
    { operator: "by-parts-integral", label: "部分積分", grades: [14], category: "hs-integral", subcategory: "積分法", Component: ByPartsIntegral },
  ],
};
