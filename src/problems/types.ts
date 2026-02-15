import type { ComponentType } from "react";

export interface OperatorRoute {
  operator: string;      // "addition", "subtraction", etc.
  label: string;         // "たし算", "ひき算", etc.
}

export interface ProblemGroup {
  id: string;            // "grid100", "hissan"
  label: string;         // "百マス計算", "ひっ算"
  operators: OperatorRoute[];
  Component: ComponentType<{ operator: string }>;
}
