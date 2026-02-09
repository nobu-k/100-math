import { useState, useCallback } from "react";
import "./App.css";

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

function updateUrl(problem: Problem) {
  const encoded = encodeProblem(problem);
  const url = new URL(window.location.href);
  url.searchParams.set("q", encoded);
  window.history.replaceState(null, "", url.toString());
}

function getInitialProblem(): Problem {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (q) {
    const decoded = decodeProblem(q);
    if (decoded) return decoded;
  }
  const problem = generateProblem();
  updateUrl(problem);
  return problem;
}

function App() {
  const [problem, setProblem] = useState(getInitialProblem);
  const [showAnswers, setShowAnswers] = useState(false);

  const handleNewProblem = useCallback(() => {
    const newProblem = generateProblem();
    updateUrl(newProblem);
    setProblem(newProblem);
    setShowAnswers(false);
  }, []);

  const handleToggleAnswers = useCallback(() => {
    setShowAnswers((prev) => !prev);
  }, []);

  const { rowHeaders, colHeaders } = problem;

  return (
    <div className="app">
      <div className="no-print controls">
        <button onClick={handleNewProblem}>新しい問題 / New Problem</button>
        <button onClick={handleToggleAnswers}>
          {showAnswers ? "答えを隠す / Hide Answers" : "答え / Show Answers"}
        </button>
      </div>
      <table className="grid">
        <thead>
          <tr>
            <th className="corner-cell">
              <svg viewBox="0 0 100 100" className="corner-svg">
                <line
                  x1="0"
                  y1="0"
                  x2="100"
                  y2="100"
                  stroke="black"
                  strokeWidth="2"
                />
                <text x="68" y="38" fontSize="32" textAnchor="middle">
                  →
                </text>
                <text x="32" y="78" fontSize="32" textAnchor="middle">
                  ↓
                </text>
              </svg>
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
                  {showAnswers ? rowNum + colNum : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
