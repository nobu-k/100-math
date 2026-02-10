import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import "./App.css";

type Operator = "add" | "mul";

interface Problem {
  rowHeaders: number[];
  colHeaders: number[];
}

function shuffleArray(arr: number[]): number[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function encodeProblem(problem: Problem): string {
  return (
    problem.rowHeaders.join("") + "-" + problem.colHeaders.join("")
  );
}

function decodeProblem(encoded: string): Problem | null {
  const parts = encoded.split("-");
  if (parts.length !== 2) return null;
  const rows = parts[0].split("").map(Number);
  const cols = parts[1].split("").map(Number);
  if (rows.length !== 9 || cols.length !== 9) return null;
  const isValidPerm = (arr: number[]) => {
    const sorted = [...arr].sort();
    return sorted.every((v, i) => v === i + 1);
  };
  if (!isValidPerm(rows) || !isValidPerm(cols)) return null;
  return { rowHeaders: rows, colHeaders: cols };
}

function generateProblem(): Problem {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return {
    rowHeaders: shuffleArray(digits),
    colHeaders: shuffleArray(digits),
  };
}

function updateUrl(problem: Problem, showAnswers: boolean, operator: Operator) {
  const url = new URL(window.location.href);
  url.searchParams.set("q", encodeProblem(problem));
  if (showAnswers) {
    url.searchParams.set("answers", "1");
  } else {
    url.searchParams.delete("answers");
  }
  url.searchParams.set("op", operator);
  window.history.replaceState(null, "", url.toString());
}

function getInitialOperator(): Operator {
  const params = new URLSearchParams(window.location.search);
  const op = params.get("op");
  return op === "mul" ? "mul" : "add";
}

function getInitialProblem(): Problem {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (q) {
    const decoded = decodeProblem(q);
    if (decoded) return decoded;
  }
  const problem = generateProblem();
  updateUrl(problem, false, getInitialOperator());
  return problem;
}

interface ProblemType {
  id: string;
  label: string;
  labelEn: string;
}

const problemTypes: ProblemType[] = [
  { id: "100grid", label: "百マス計算", labelEn: "100 Grid Math" },
];

function App() {
  const [selectedType, setSelectedType] = useState("100grid");
  const [problem, setProblem] = useState(getInitialProblem);
  const [operator, setOperator] = useState<Operator>(getInitialOperator);
  const [showAnswers, setShowAnswers] = useState(() => {
    return new URLSearchParams(window.location.search).get("answers") === "1";
  });

  const currentType = problemTypes.find((t) => t.id === selectedType)!;

  const handleNewProblem = useCallback(() => {
    const newProblem = generateProblem();
    updateUrl(newProblem, false, operator);
    setProblem(newProblem);
    setShowAnswers(false);
  }, [operator]);

  const handleToggleAnswers = useCallback(() => {
    setShowAnswers((prev) => {
      updateUrl(problem, !prev, operator);
      return !prev;
    });
  }, [problem, operator]);

  const handleSetOperator = useCallback(
    (op: Operator) => {
      setOperator(op);
      updateUrl(problem, showAnswers, op);
    },
    [problem, showAnswers],
  );

  const { rowHeaders, colHeaders } = problem;

  const qrUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("q", encodeProblem(problem));
    url.searchParams.set("answers", "1");
    url.searchParams.set("op", operator);
    return url.toString();
  }, [problem, operator]);

  return (
    <div className="layout">
      <nav className="sidebar no-print">
        <h2 className="sidebar-title">問題の種類 / Type</h2>
        <ul className="sidebar-menu">
          {problemTypes.map((type) => (
            <li
              key={type.id}
              className={`sidebar-item${type.id === selectedType ? " active" : ""}`}
              onClick={() => setSelectedType(type.id)}
            >
              <span className="sidebar-item-label">{type.label}</span>
              <span className="sidebar-item-label-en">{type.labelEn}</span>
            </li>
          ))}
        </ul>
      </nav>
      <div className="app">
        <h1 className="print-title">
          {currentType.label} / {currentType.labelEn}
        </h1>
        <div className="no-print controls">
          <div className="operator-toggle">
            <button
              className={operator === "add" ? "active" : ""}
              onClick={() => handleSetOperator("add")}
            >
              たし算 / +
            </button>
            <button
              className={operator === "mul" ? "active" : ""}
              onClick={() => handleSetOperator("mul")}
            >
              かけ算 / ×
            </button>
          </div>
          <button onClick={handleNewProblem}>新しい問題 / New Problem</button>
          <button onClick={handleToggleAnswers}>
            {showAnswers ? "答えを隠す / Hide Answers" : "答え / Show Answers"}
          </button>
        </div>
        <table className="grid">
          <thead>
            <tr>
              <th className="corner-cell">
                {operator === "mul" ? "×" : "+"}
              </th>
              {colHeaders.map((num, i) => (
                <th key={i} className="header-cell">
                  {num}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowHeaders.map((rowNum, ri) => (
              <tr key={ri}>
                <th className="header-cell">{rowNum}</th>
                {colHeaders.map((colNum, ci) => (
                  <td key={ci} className="answer-cell">
                    {showAnswers
                      ? operator === "mul"
                        ? rowNum * colNum
                        : rowNum + colNum
                      : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="qr-section">
          <QRCodeSVG value={qrUrl} size={80} />
          <span className="qr-label">答え / Answers</span>
        </div>
      </div>
    </div>
  );
}

export default App;
