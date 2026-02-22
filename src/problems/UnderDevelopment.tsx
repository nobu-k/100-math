import type { ProblemGroup } from "./types";
import Grade1 from "./Grade1";

export const underDevelopment: ProblemGroup = {
  id: "dev",
  label: "1年（開発中）",
  operators: [
    { operator: "decomposition", label: "数の分解", grades: [1], category: "numbers" },
    { operator: "fill-blank", label: "穴埋め加減", grades: [1], category: "computation" },
    { operator: "comparison", label: "大小くらべ", grades: [1], category: "numbers" },
    { operator: "sequence", label: "数のならび", grades: [1], category: "numbers" },
    { operator: "clock", label: "時計のよみ方", grades: [1], category: "measurement" },
  ],
  Component: Grade1,
};
