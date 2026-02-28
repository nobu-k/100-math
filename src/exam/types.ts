import type { ReactNode } from "react";

export interface ExamOperatorDef {
  key: string;
  label: string;
  groupLabel: string;
  instruction: string;
  defaultCount: number;
  maxCount: number;
  generate: (seed: number, count: number) => unknown[];
  render: (problems: unknown[], showAnswers: boolean) => ReactNode;
}

export interface ExamSection {
  id: string;
  operatorKey: string;
  count: number;
}

export interface ExamState {
  seed: number;
  title: string;
  sections: ExamSection[];
  showAnswers: boolean;
}
