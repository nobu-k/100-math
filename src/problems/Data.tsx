import type { ProblemGroup } from "./types";
import TableRead from "./data/TableRead";
import BarGraph from "./data/BarGraph";
import LineGraph from "./data/LineGraph";
import CrossTable from "./data/CrossTable";
import Representative from "./data/Representative";
import Counting from "./data/Counting";
import FreqTable from "./data/FreqTable";
import DataAnalysis from "./data/DataAnalysis";
import Probability from "./data/Probability";
import Sampling from "./data/Sampling";

export const data: ProblemGroup = {
  id: "data",
  label: "データ・統計",
  operators: [
    { operator: "table-read", label: "表の読み取り", grades: [2], category: "data", Component: TableRead },
    { operator: "bar-graph", label: "棒グラフ", grades: [3], category: "data", Component: BarGraph },
    { operator: "line-graph", label: "折れ線グラフ", grades: [4], category: "data", Component: LineGraph },
    { operator: "cross-table", label: "二次元の表", grades: [4], category: "data", Component: CrossTable },
    { operator: "representative", label: "代表値", grades: [6], category: "data", Component: Representative },
    { operator: "counting", label: "場合の数", grades: [6], category: "data", Component: Counting },
    { operator: "freq-table", label: "度数分布表", grades: [6], category: "data", Component: FreqTable },
    { operator: "data-analysis", label: "データの分析", grades: [7], category: "data", Component: DataAnalysis },
    { operator: "probability", label: "確率", grades: [8], category: "data", Component: Probability },
    { operator: "sampling", label: "標本調査", grades: [9], category: "data", Component: Sampling },
  ],
};
