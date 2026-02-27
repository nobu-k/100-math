import type { ComponentType } from "react";

export interface OperatorRoute {
  operator: string;      // "addition", "subtraction", etc.
  label: string;         // "たし算", "ひき算", etc.
  grades?: number[];     // which grades this operator is appropriate for
  category?: string;     // mathematical topic: "computation", "numbers", etc.
  subcategory?: string;  // sub-heading within grade view (e.g., "数と式")
  Component: ComponentType<object>;  // per-operator self-contained component
}

export interface ProblemGroup {
  id: string;            // "grid100", "hissan"
  label: string;         // "百マス計算", "ひっ算"
  operators: OperatorRoute[];
}
