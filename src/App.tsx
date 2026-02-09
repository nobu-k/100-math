import { useState, useCallback } from "react";
import "./App.css";

function shuffleArray(arr: number[]): number[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateProblem(): { rowHeaders: number[]; colHeaders: number[] } {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return {
    rowHeaders: shuffleArray(digits),
    colHeaders: shuffleArray(digits),
  };
}

function App() {
  const [problem, setProblem] = useState(generateProblem);

  const handleNewProblem = useCallback(() => {
    setProblem(generateProblem());
  }, []);

  const { rowHeaders, colHeaders } = problem;

  return (
    <div className="app">
      <div className="no-print controls">
        <button onClick={handleNewProblem}>新しい問題 / New Problem</button>
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
              {colHeaders.map((_, ci) => (
                <td key={ci} className="answer-cell" />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
