import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { ProblemTypeDefinition } from "./types";
import { mulberry32, randomSeed, seedToHex, hexToSeed } from "./random";
import "../App.css";

interface Problem {
  a: number;
  b: number;
}

const generateProblems = (seed: number): Problem[] => {
  const rng = mulberry32(seed);
  return Array.from({ length: 12 }, () => ({
    a: Math.floor(rng() * 99) + 1,
    b: Math.floor(rng() * 99) + 1,
  }));
};

const updateUrl = (seed: number, showAnswers: boolean) => {
  const url = new URL(window.location.href);
  url.searchParams.set("hq", seedToHex(seed));
  if (showAnswers) {
    url.searchParams.set("answers", "1");
  } else {
    url.searchParams.delete("answers");
  }
  window.history.replaceState(null, "", url.toString());
};

const getInitialSeed = (): number => {
  const params = new URLSearchParams(window.location.search);
  const hq = params.get("hq");
  if (hq) {
    const parsed = hexToSeed(hq);
    if (parsed !== null) return parsed;
  }
  const seed = randomSeed();
  updateUrl(seed, false);
  return seed;
};

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
  const [seed, setSeed] = useState(getInitialSeed);
  const [showAnswers, setShowAnswers] = useState(() => {
    return new URLSearchParams(window.location.search).get("answers") === "1";
  });

  const problems = useMemo(() => generateProblems(seed), [seed]);

  const handleNewProblems = useCallback(() => {
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

  const qrUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("hq", seedToHex(seed));
    url.searchParams.set("answers", "1");
    return url.toString();
  }, [seed]);

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
