import type { ProblemGroup } from "./types";
import AddSub1 from "./word-problems/AddSub1";

export const wordProblems: ProblemGroup = {
  id: "word-problems",
  label: "文章題",
  operators: [
    { operator: "add-sub-1", label: "たし算・ひき算", grades: [1], category: "word-problems", Component: AddSub1 },
  ],
};
