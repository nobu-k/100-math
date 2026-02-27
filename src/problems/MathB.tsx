import type { ProblemGroup } from "./types";
import ArithGeoSeq from "./mathB/ArithGeoSeq";
import BinomialDist from "./mathB/BinomialDist";
import NormalDist from "./mathB/NormalDist";

export const mathB: ProblemGroup = {
  id: "mathB",
  label: "数学B",
  operators: [
    { operator: "arith-geo-seq", label: "等差・等比数列", grades: [11], category: "mathB", Component: ArithGeoSeq },
    { operator: "binomial-dist", label: "二項分布", grades: [11], category: "mathB", Component: BinomialDist },
    { operator: "normal-dist", label: "正規分布", grades: [11], category: "mathB", Component: NormalDist },
  ],
};
