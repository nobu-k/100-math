import type { ComponentType } from "react";

export interface ProblemTypeDefinition {
  id: string;
  label: string;
  labelEn: string;
  Component: ComponentType;
}
