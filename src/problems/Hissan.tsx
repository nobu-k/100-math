import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { ProblemTypeDefinition } from "./types";
import { mulberry32, randomSeed, seedToHex, hexToSeed } from "./random";
import "../App.css";

interface Problem {
  a: number;
  b: number;
}

const generateProblems = (
  seed: number,
  minDigits: number,
  maxDigits: number,
): Problem[] => {
  const rng = mulberry32(seed);
  const min = minDigits === 1 ? 1 : Math.pow(10, minDigits - 1);
  const max = Math.pow(10, maxDigits) - 1;
  const range = max - min + 1;
  return Array.from({ length: 12 }, () => ({
    a: Math.floor(rng() * range) + min,
    b: Math.floor(rng() * range) + min,
  }));
};

const updateUrl = (
  seed: number,
  showAnswers: boolean,
  minDigits: number,
  maxDigits: number,
) => {
  const url = new URL(window.location.href);
  url.searchParams.set("hq", seedToHex(seed));
  if (showAnswers) {
    url.searchParams.set("answers", "1");
  } else {
    url.searchParams.delete("answers");
  }
  url.searchParams.set("hmin", String(minDigits));
  url.searchParams.set("hmax", String(maxDigits));
  window.history.replaceState(null, "", url.toString());
};

const getInitialDigits = (): { minDigits: number; maxDigits: number } => {
  const params = new URLSearchParams(window.location.search);
  let minDigits = parseInt(params.get("hmin") || "", 10);
  let maxDigits = parseInt(params.get("hmax") || "", 10);
  if (!(minDigits >= 1 && minDigits <= 4)) minDigits = 1;
  if (!(maxDigits >= 1 && maxDigits <= 4)) maxDigits = 2;
  if (minDigits > maxDigits) maxDigits = minDigits;
  return { minDigits, maxDigits };
};

const getInitialSeed = (): number => {
  const params = new URLSearchParams(window.location.search);
  const hq = params.get("hq");
  if (hq) {
    const parsed = hexToSeed(hq);
    if (parsed !== null) return parsed;
  }
  const seed = randomSeed();
  const { minDigits, maxDigits } = getInitialDigits();
  updateUrl(seed, false, minDigits, maxDigits);
  return seed;
};

/** Convert a number to an array of digits, padded to `width` with empty strings on the left. */
const toDigitCells = (n: number, width: number): (number | "")[] => {
  const str = String(n);
  const cells: (number | "")[] = Array(width).fill("");
  for (let i = 0; i < str.length; i++) {
    cells[width - str.length + i] = parseInt(str[i], 10);
  }
  return cells;
};

function HissanProblem({
  index,
  problem,
  showAnswers,
  maxDigits,
}: {
  index: number;
  problem: Problem;
  showAnswers: boolean;
  maxDigits: number;
}) {
  const { a, b } = problem;
  const sum = a + b;

  // totalCols = maxDigits + 1 (extra column for operator / potential carry)
  const totalCols = maxDigits + 1;
  const aDigits = toDigitCells(a, totalCols);
  const bDigits = toDigitCells(b, totalCols);
  const sumDigits = toDigitCells(sum, totalCols);

  return (
    <div className="hissan-problem">
      <span className="hissan-number">({index + 1})</span>
      <table className="hissan-grid">
        <tbody>
          <tr>
            {aDigits.map((d, i) => (
              <td key={i} className="hissan-cell">
                {d}
              </td>
            ))}
          </tr>
          <tr className="hissan-operator-row">
            <td className="hissan-cell">+</td>
            {bDigits.slice(1).map((d, i) => (
              <td key={i} className="hissan-cell">
                {d}
              </td>
            ))}
          </tr>
          <tr>
            {sumDigits.map((d, i) => (
              <td key={i} className="hissan-cell">
                {showAnswers ? d : ""}
              </td>
            ))}
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
  const [minDigits, setMinDigits] = useState(() => getInitialDigits().minDigits);
  const [maxDigits, setMaxDigits] = useState(() => getInitialDigits().maxDigits);

  const problems = useMemo(
    () => generateProblems(seed, minDigits, maxDigits),
    [seed, minDigits, maxDigits],
  );

  const handleNewProblems = useCallback(() => {
    const newSeed = randomSeed();
    updateUrl(newSeed, false, minDigits, maxDigits);
    setSeed(newSeed);
    setShowAnswers(false);
  }, [minDigits, maxDigits]);

  const handleToggleAnswers = useCallback(() => {
    setShowAnswers((prev) => {
      updateUrl(seed, !prev, minDigits, maxDigits);
      return !prev;
    });
  }, [seed, minDigits, maxDigits]);

  const handleMinDigitsChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newMin = parseInt(e.target.value, 10);
      const newMax = newMin > maxDigits ? newMin : maxDigits;
      const newSeed = randomSeed();
      setMinDigits(newMin);
      setMaxDigits(newMax);
      setSeed(newSeed);
      setShowAnswers(false);
      updateUrl(newSeed, false, newMin, newMax);
    },
    [maxDigits],
  );

  const handleMaxDigitsChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newMax = parseInt(e.target.value, 10);
      const newMin = newMax < minDigits ? newMax : minDigits;
      const newSeed = randomSeed();
      setMinDigits(newMin);
      setMaxDigits(newMax);
      setSeed(newSeed);
      setShowAnswers(false);
      updateUrl(newSeed, false, newMin, newMax);
    },
    [minDigits],
  );

  const qrUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("hq", seedToHex(seed));
    url.searchParams.set("answers", "1");
    url.searchParams.set("hmin", String(minDigits));
    url.searchParams.set("hmax", String(maxDigits));
    return url.toString();
  }, [seed, minDigits, maxDigits]);

  return (
    <>
      <div className="no-print controls">
        <button onClick={handleNewProblems}>新しい問題 / New Problems</button>
        <button onClick={handleToggleAnswers}>
          {showAnswers ? "答えを隠す / Hide Answers" : "答え / Show Answers"}
        </button>
        <select
          className="operator-select"
          value={minDigits}
          onChange={handleMinDigitsChange}
        >
          {[1, 2, 3, 4].map((d) => (
            <option key={d} value={d}>
              最小 {d} 桁
            </option>
          ))}
        </select>
        <select
          className="operator-select"
          value={maxDigits}
          onChange={handleMaxDigitsChange}
        >
          {[1, 2, 3, 4].map((d) => (
            <option key={d} value={d}>
              最大 {d} 桁
            </option>
          ))}
        </select>
      </div>
      <div className="hissan-page">
        {problems.map((problem, i) => (
          <HissanProblem
            key={i}
            index={i}
            problem={problem}
            showAnswers={showAnswers}
            maxDigits={maxDigits}
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
