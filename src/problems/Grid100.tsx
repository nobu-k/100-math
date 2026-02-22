import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { ProblemGroup } from "./types";
import { mulberry32, randomSeed, seedToHex, hexToSeed } from "./random";
import "../App.css";

type Operator = "add" | "sub" | "mul";

interface Problem {
  rowHeaders: number[];
  colHeaders: number[];
}

const operatorFromPath = (path: string): Operator => {
  if (path === "subtraction") return "sub";
  if (path === "multiplication") return "mul";
  return "add";
};

const seededShuffle = (arr: number[], rng: () => number): number[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const generateProblem = (seed: number): Problem => {
  const rng = mulberry32(seed);
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return {
    rowHeaders: seededShuffle(digits, rng),
    colHeaders: seededShuffle(digits, rng),
  };
};

const updateUrl = (seed: number, showAnswers: boolean) => {
  const url = new URL(window.location.href);
  url.searchParams.set("q", seedToHex(seed));
  if (showAnswers) {
    url.searchParams.set("answers", "1");
  } else {
    url.searchParams.delete("answers");
  }
  window.history.replaceState(null, "", url.toString());
};

const getInitialSeed = (): number => {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (q) {
    const parsed = hexToSeed(q);
    if (parsed !== null) return parsed;
  }
  const seed = randomSeed();
  updateUrl(seed, false);
  return seed;
};

const Grid100 = ({ operator: operatorPath }: { operator: string }) => {
  const operator = operatorFromPath(operatorPath);
  const [seed, setSeed] = useState(getInitialSeed);
  const [showAnswers, setShowAnswers] = useState(() => {
    return new URLSearchParams(window.location.search).get("answers") === "1";
  });

  const problem = useMemo(() => generateProblem(seed), [seed]);

  const handleNewProblem = useCallback(() => {
    const newSeed = randomSeed();
    updateUrl(newSeed, false);
    setSeed(newSeed);
    setShowAnswers(false);
  }, []);

  const handleToggleAnswers = useCallback(() => {
    setShowAnswers((prev) => {
      updateUrl(seed, !prev);
      return !prev;
    });
  }, [seed]);

  const { rowHeaders, colHeaders } = problem;

  const qrUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("q", seedToHex(seed));
    url.searchParams.set("answers", "1");
    return url.toString();
  }, [seed]);

  return (
    <>
      <div className="no-print controls">
        <button onClick={handleNewProblem}>新しい問題</button>
        <button onClick={handleToggleAnswers}>
          {showAnswers ? "答えを隠す" : "答え"}
        </button>
      </div>
      <table className="grid">
        <thead>
          <tr>
            <th className="corner-cell">
              {operator === "mul" ? "×" : operator === "sub" ? "−" : "+"}
            </th>
            {colHeaders.map((num, i) => (
              <th key={i} className="header-cell">
                {operator === "sub" ? num + 10 : num}
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
                      : operator === "sub"
                        ? colNum + 10 - rowNum
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
        <span className="qr-label">答え</span>
      </div>
    </>
  );
};

export const grid100: ProblemGroup = {
  id: "grid100",
  label: "百マス計算",
  operators: [
    { operator: "addition", label: "たし算", grades: [1, 2], category: "computation" },
    { operator: "subtraction", label: "ひき算", grades: [1, 2], category: "computation" },
    { operator: "multiplication", label: "かけ算", grades: [2, 3], category: "computation" },
  ],
  Component: Grid100,
};
