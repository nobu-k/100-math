import type { ProblemGroup } from "./types";
import Grade1 from "./grade1/Grade1";

export const underDevelopment: ProblemGroup = {
  id: "dev",
  label: "開発中",
  operators: [
    { operator: "decomposition", label: "数の分解" },
    { operator: "fill-blank", label: "穴埋め加減" },
    { operator: "comparison", label: "大小くらべ" },
    { operator: "sequence", label: "数のならび" },
    { operator: "clock", label: "時計のよみ方" },
  ],
  Component: Grade1,
};
