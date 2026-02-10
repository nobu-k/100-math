import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { ProblemTypeDefinition } from "./types";
import "../App.css";

interface Problem {
  a: number;
  b: number;
}

function encodeProblems(problems: Problem[]): string {
  return problems
    .map((p) => String(p.a).padStart(2, "0") + String(p.b).padStart(2, "0"))
    .join("");
}

function decodeProblems(encoded: string): Problem[] | null {
  if (encoded.length !== 48) return null;
  const problems: Problem[] = [];
  for (let i = 0; i < 48; i += 4) {
    const a = parseInt(encoded.slice(i, i + 2), 10);
    const b = parseInt(encoded.slice(i + 2, i + 4), 10);
    if (a < 1 || a > 99 || b < 1 || b > 99) return null;
    problems.push({ a, b });
  }
  return problems;
}

function generateProblems(): Problem[] {
  return Array.from({ length: 12 }, () => ({
    a: Math.floor(Math.random() * 99) + 1,
    b: Math.floor(Math.random() * 99) + 1,
  }));
}

function updateUrl(problems: Problem[], showAnswers: boolean) {
  const url = new URL(window.location.href);
  url.searchParams.set("hq", encodeProblems(problems));
  if (showAnswers) {
    url.searchParams.set("answers", "1");
  } else {
    url.searchParams.delete("answers");
  }
  window.history.replaceState(null, "", url.toString());
}

function getInitialProblems(): Problem[] {
  const params = new URLSearchParams(window.location.search);
  const hq = params.get("hq");
  if (hq) {
    const decoded = decodeProblems(hq);
    if (decoded) return decoded;
  }
  const problems = generateProblems();
  updateUrl(problems, false);
  return problems;
}

function HissanProblem({
  index,
  problem,
  showAnswers,
}: {
  index: number;
  problem: Problem;
  showAnswers: boolean;
}) {
  const { a, b } = problem;
  const sum = a + b;

  const aTens = a >= 10 ? Math.floor(a / 10) : "";
  const aOnes = a % 10;
  const bTens = b >= 10 ? Math.floor(b / 10) : "";
  const bOnes = b % 10;

  const sumHundreds = sum >= 100 ? Math.floor(sum / 100) : "";
  const sumTens = sum >= 10 ? Math.floor((sum % 100) / 10) : "";
  const sumOnes = sum % 10;

  return (
    <div className="hissan-problem">
      <span className="hissan-number">({index + 1})</span>
      <table className="hissan-grid">
        <tbody>
          <tr>
            <td className="hissan-cell"></td>
            <td className="hissan-cell">{aTens}</td>
            <td className="hissan-cell">{aOnes}</td>
          </tr>
          <tr className="hissan-operator-row">
            <td className="hissan-cell">+</td>
            <td className="hissan-cell">{bTens}</td>
            <td className="hissan-cell">{bOnes}</td>
          </tr>
          <tr>
            <td className="hissan-cell">
              {showAnswers ? sumHundreds : ""}
            </td>
            <td className="hissan-cell">
              {showAnswers ? sumTens : ""}
            </td>
            <td className="hissan-cell">
              {showAnswers ? sumOnes : ""}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Hissan() {
  const [problems, setProblems] = useState(getInitialProblems);
  const [showAnswers, setShowAnswers] = useState(() => {
    return new URLSearchParams(window.location.search).get("answers") === "1";
  });

  const handleNewProblems = useCallback(() => {
    const newProblems = generateProblems();
    updateUrl(newProblems, false);
    setProblems(newProblems);
    setShowAnswers(false);
  }, []);

  const handleToggleAnswers = useCallback(() => {
    setShowAnswers((prev) => {
      updateUrl(problems, !prev);
      return !prev;
    });
  }, [problems]);

  const qrUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("hq", encodeProblems(problems));
    url.searchParams.set("answers", "1");
    return url.toString();
  }, [problems]);

  return (
    <>
      <div className="no-print controls">
        <button onClick={handleNewProblems}>新しい問題 / New Problems</button>
        <button onClick={handleToggleAnswers}>
          {showAnswers ? "答えを隠す / Hide Answers" : "答え / Show Answers"}
        </button>
      </div>
      <div className="hissan-page">
        {problems.map((problem, i) => (
          <HissanProblem
            key={i}
            index={i}
            problem={problem}
            showAnswers={showAnswers}
          />
        ))}
      </div>
      <div className="qr-section">
        <QRCodeSVG value={qrUrl} size={80} />
        <span className="qr-label">答え / Answers</span>
      </div>
    </>
  );
}

export const hissan: ProblemTypeDefinition = {
  id: "hissan",
  label: "ひっ算",
  labelEn: "Column Addition",
  Component: Hissan,
};
