import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { ProblemTypeDefinition } from "./types";
import { mulberry32, randomSeed, seedToHex, hexToSeed } from "./random";
import "../App.css";

type Problem = number[];

const generateNumber = (rng: () => number, minDigits: number, maxDigits: number): number => {
  const digits = minDigits + Math.floor(rng() * (maxDigits - minDigits + 1));
  const lo = digits === 1 ? 1 : Math.pow(10, digits - 1);
  const hi = Math.pow(10, digits) - 1;
  return Math.floor(rng() * (hi - lo + 1)) + lo;
};

interface HissanConfig {
  minDigits: number;
  maxDigits: number;
  numOperands: number;
  consecutiveCarries: boolean;
}

/** Pick a random integer in [lo, hi] inclusive. */
const randInt = (rng: () => number, lo: number, hi: number): number =>
  lo + Math.floor(rng() * (hi - lo + 1));

/** Generate n digits (each 0-9) whose sum >= minSum. */
const digitsWithMinSum = (rng: () => number, n: number, minSum: number): number[] => {
  const result: number[] = [];
  let need = minSum;
  for (let i = 0; i < n; i++) {
    const left = n - i - 1;
    const lo = Math.max(0, need - left * 9);
    const d = randInt(rng, lo, 9);
    result.push(d);
    need = Math.max(0, need - d);
  }
  return result;
};

/** Generate n digits (each 0-9) whose sum = exactSum. */
const digitsWithExactSum = (rng: () => number, n: number, exactSum: number): number[] => {
  const result: number[] = [];
  let remaining = exactSum;
  for (let i = 0; i < n; i++) {
    const left = n - i - 1;
    const lo = Math.max(0, remaining - left * 9);
    const hi = Math.min(9, remaining);
    const d = randInt(rng, lo, hi);
    result.push(d);
    remaining -= d;
  }
  return result;
};

/**
 * Constructively generate a problem with carries in every column.
 * - Ones column: digit sum >= 10 (produces carry).
 * - Middle columns: digit sum = 10 - carry_in (corner case, total = 10, carry out = 1).
 * - Highest column: digit sum + carry_in >= 10 (carries out).
 */
const generateCarryChainProblem = (rng: () => number, cfg: HissanConfig): Problem => {
  const width = cfg.maxDigits;
  const numOps = cfg.numOperands;
  const minVal = cfg.minDigits <= 1 ? 1 : Math.pow(10, cfg.minDigits - 1);

  for (let attempt = 0; attempt < 100; attempt++) {
    const opDigits: number[][] = Array.from({ length: numOps }, () => []);
    let carry = 0;

    for (let col = 0; col < width; col++) {
      let colDigits: number[];
      if (col === 0) {
        colDigits = digitsWithMinSum(rng, numOps, 10);
      } else if (col < width - 1) {
        colDigits = digitsWithExactSum(rng, numOps, 10 - carry);
      } else {
        colDigits = digitsWithMinSum(rng, numOps, 10 - carry);
      }
      const total = colDigits.reduce((a, b) => a + b, 0) + carry;
      carry = Math.floor(total / 10);
      for (let op = 0; op < numOps; op++) opDigits[op].push(colDigits[op]);
    }

    const numbers = opDigits.map((digits) =>
      digits.reduce((num, d, col) => num + d * Math.pow(10, col), 0),
    );
    if (numbers.every((n) => n >= minVal)) return numbers;
  }

  // Fallback (should rarely happen)
  return Array.from({ length: numOps }, () =>
    generateNumber(rng, cfg.minDigits, cfg.maxDigits),
  );
};

const generateProblem = (rng: () => number, cfg: HissanConfig): Problem => {
  if (cfg.consecutiveCarries) return generateCarryChainProblem(rng, cfg);
  return Array.from({ length: cfg.numOperands }, () =>
    generateNumber(rng, cfg.minDigits, cfg.maxDigits),
  );
};

const generateProblems = (seed: number, cfg: HissanConfig): Problem[] => {
  const rng = mulberry32(seed);
  return Array.from({ length: 12 }, () => generateProblem(rng, cfg));
};

const updateUrl = (seed: number, showAnswers: boolean, cfg: HissanConfig) => {
  const url = new URL(window.location.href);
  url.searchParams.set("hq", seedToHex(seed));
  if (showAnswers) {
    url.searchParams.set("answers", "1");
  } else {
    url.searchParams.delete("answers");
  }
  url.searchParams.set("hmin", String(cfg.minDigits));
  url.searchParams.set("hmax", String(cfg.maxDigits));
  url.searchParams.set("hops", String(cfg.numOperands));
  if (cfg.consecutiveCarries) {
    url.searchParams.set("hcc", "1");
  } else {
    url.searchParams.delete("hcc");
  }
  window.history.replaceState(null, "", url.toString());
};

const getInitialConfig = (): HissanConfig => {
  const params = new URLSearchParams(window.location.search);
  let minDigits = parseInt(params.get("hmin") || "", 10);
  let maxDigits = parseInt(params.get("hmax") || "", 10);
  let numOperands = parseInt(params.get("hops") || "", 10);
  if (!(minDigits >= 1 && minDigits <= 4)) minDigits = 1;
  if (!(maxDigits >= 1 && maxDigits <= 4)) maxDigits = 2;
  if (minDigits > maxDigits) maxDigits = minDigits;
  if (!(numOperands >= 2 && numOperands <= 3)) numOperands = 2;
  const consecutiveCarries = params.get("hcc") === "1";
  return { minDigits, maxDigits, numOperands, consecutiveCarries };
};

const getInitialSeed = (): number => {
  const params = new URLSearchParams(window.location.search);
  const hq = params.get("hq");
  if (hq) {
    const parsed = hexToSeed(hq);
    if (parsed !== null) return parsed;
  }
  const seed = randomSeed();
  updateUrl(seed, false, getInitialConfig());
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
  const sum = problem.reduce((a, b) => a + b, 0);

  // totalCols = maxDigits + 1 (extra column for operator / potential carry)
  const totalCols = maxDigits + 1;
  const sumDigits = toDigitCells(sum, totalCols);
  const last = problem.length - 1;

  return (
    <div className="hissan-problem">
      <span className="hissan-number">({index + 1})</span>
      <table className="hissan-grid">
        <tbody>
          {problem.map((operand, ri) => {
            const digits = toDigitCells(operand, totalCols);
            if (ri === 0) {
              return (
                <tr key={ri}>
                  {digits.map((d, i) => (
                    <td key={i} className="hissan-cell">{d}</td>
                  ))}
                </tr>
              );
            }
            return (
              <tr key={ri} className={ri === last ? "hissan-operator-row" : undefined}>
                <td className="hissan-cell">+</td>
                {digits.slice(1).map((d, i) => (
                  <td key={i} className="hissan-cell">{d}</td>
                ))}
              </tr>
            );
          })}
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
  const [cfg, setCfg] = useState(getInitialConfig);
  const [showSettings, setShowSettings] = useState(false);

  const problems = useMemo(() => generateProblems(seed, cfg), [seed, cfg]);

  const handleNewProblems = useCallback(() => {
    const newSeed = randomSeed();
    updateUrl(newSeed, false, cfg);
    setSeed(newSeed);
    setShowAnswers(false);
  }, [cfg]);

  const handleToggleAnswers = useCallback(() => {
    setShowAnswers((prev) => {
      updateUrl(seed, !prev, cfg);
      return !prev;
    });
  }, [seed, cfg]);

  const handleConfigChange = useCallback(
    (field: keyof HissanConfig) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      setCfg((prev) => {
        const value = e.target instanceof HTMLInputElement && e.target.type === "checkbox"
          ? e.target.checked
          : parseInt(e.target.value, 10);
        const next = { ...prev, [field]: value };
        if (field === "minDigits" && next.minDigits > next.maxDigits)
          next.maxDigits = next.minDigits;
        if (field === "maxDigits" && next.maxDigits < next.minDigits)
          next.minDigits = next.maxDigits;
        const newSeed = randomSeed();
        setSeed(newSeed);
        setShowAnswers(false);
        updateUrl(newSeed, false, next);
        return next;
      });
    },
    [],
  );

  const qrUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("hq", seedToHex(seed));
    url.searchParams.set("answers", "1");
    url.searchParams.set("hmin", String(cfg.minDigits));
    url.searchParams.set("hmax", String(cfg.maxDigits));
    url.searchParams.set("hops", String(cfg.numOperands));
    if (cfg.consecutiveCarries) url.searchParams.set("hcc", "1");
    return url.toString();
  }, [seed, cfg]);

  return (
    <>
      <div className="no-print controls">
        <button onClick={handleNewProblems}>新しい問題 / New Problems</button>
        <button onClick={handleToggleAnswers}>
          {showAnswers ? "答えを隠す / Hide Answers" : "答え / Show Answers"}
        </button>
        <button onClick={() => setShowSettings((prev) => !prev)}>
          設定 / Settings
        </button>
      </div>
      {showSettings && (
        <div className="no-print settings-panel">
          <label>
            桁数 最小{" "}
            <select className="operator-select" value={cfg.minDigits} onChange={handleConfigChange("minDigits")}>
              {[1, 2, 3, 4].map((d) => <option key={d} value={d}>{d} 桁</option>)}
            </select>
          </label>
          <label>
            最大{" "}
            <select className="operator-select" value={cfg.maxDigits} onChange={handleConfigChange("maxDigits")}>
              {[1, 2, 3, 4].map((d) => <option key={d} value={d}>{d} 桁</option>)}
            </select>
          </label>
          <label>
            項数{" "}
            <select className="operator-select" value={cfg.numOperands} onChange={handleConfigChange("numOperands")}>
              {[2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label>
            <input type="checkbox" checked={cfg.consecutiveCarries} onChange={handleConfigChange("consecutiveCarries")} />
            連続繰り上がり
          </label>
        </div>
      )}
      <div className="hissan-page">
        {problems.map((problem, i) => (
          <HissanProblem
            key={i}
            index={i}
            problem={problem}
            showAnswers={showAnswers}
            maxDigits={cfg.maxDigits}
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
