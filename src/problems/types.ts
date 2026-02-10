import type { ComponentType } from "react";

export interface ProblemTypeDefinition {
  id: string;
  label: string;
  Component: ComponentType;
}
