import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { ProblemTypeDefinition } from "./types";
import { mulberry32, randomSeed, seedToHex, hexToSeed } from "./random";
import "../App.css";

type Problem = number[];
type HissanOperator = "add" | "sub";

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
  showGrid: boolean;
  operator: HissanOperator;
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
  const numOps = cfg.numOperands;

  for (let attempt = 0; attempt < 100; attempt++) {
    // Choose digit count for each operand independently
    const opWidths = Array.from({ length: numOps }, () =>
      cfg.minDigits + Math.floor(rng() * (cfg.maxDigits - cfg.minDigits + 1)),
    );
    const width = Math.max(...opWidths);
    // Carry chain spans 2..width columns from ones (or 1 if width=1)
    const minChain = Math.min(2, width);
    const chainLen = minChain + Math.floor(rng() * (width - minChain + 1));
    const opDigits: number[][] = Array.from({ length: numOps }, () => []);
    let carry = 0;

    for (let col = 0; col < width; col++) {
      const active: number[] = [];
      for (let op = 0; op < numOps; op++) {
        if (col < opWidths[op]) active.push(op);
      }

      let colDigits: number[];
      if (col < chainLen) {
        // Carry chain: each column must produce a carry
        if (col === 0) {
          colDigits = digitsWithMinSum(rng, active.length, 10);
        } else if (col === 1 || col < chainLen - 1) {
          // Tens column is always a corner case (digit sum = 9);
          // other middle chain columns likewise
          colDigits = digitsWithExactSum(rng, active.length, 10 - carry);
        } else {
          colDigits = digitsWithMinSum(rng, active.length, 10 - carry);
        }
      } else {
        // Beyond the chain: random digits, carry absorbed naturally
        colDigits = active.map(() => randInt(rng, 0, 9));
      }

      const total = colDigits.reduce((a, b) => a + b, 0) + carry;
      carry = Math.floor(total / 10);
      let ai = 0;
      for (let op = 0; op < numOps; op++) {
        opDigits[op].push(col < opWidths[op] ? colDigits[ai++] : 0);
      }
    }

    const numbers = opDigits.map((digits) =>
      digits.reduce((num, d, col) => num + d * Math.pow(10, col), 0),
    );
    // Verify each operand actually has its intended digit count
    if (numbers.every((n, i) => n >= (opWidths[i] <= 1 ? 1 : Math.pow(10, opWidths[i] - 1)))) {
      return numbers;
    }
  }

  // Fallback (should rarely happen)
  return Array.from({ length: numOps }, () =>
    generateNumber(rng, cfg.minDigits, cfg.maxDigits),
  );
};

/** Generate a subtraction problem where minuend - subtrahend1 - subtrahend2 - ... >= 0. */
const generateSubtractionProblem = (rng: () => number, cfg: HissanConfig): Problem => {
  for (let attempt = 0; attempt < 100; attempt++) {
    const minuend = generateNumber(rng, cfg.minDigits, cfg.maxDigits);
    const subtrahends: number[] = [];
    let budget = minuend - 1; // ensure result >= 0 (strictly: sum of subtrahends < minuend)
    let ok = true;
    for (let i = 1; i < cfg.numOperands; i++) {
      const lo = cfg.minDigits === 1 ? 1 : Math.pow(10, cfg.minDigits - 1);
      const hi = Math.min(Math.pow(10, cfg.maxDigits) - 1, budget - (cfg.numOperands - 1 - i));
      if (hi < lo) { ok = false; break; }
      const sub = randInt(rng, lo, hi);
      subtrahends.push(sub);
      budget -= sub;
    }
    if (ok) return [minuend, ...subtrahends];
  }
  // Fallback: simple guaranteed valid problem
  const minuend = generateNumber(rng, cfg.minDigits, cfg.maxDigits);
  return [minuend, ...Array.from({ length: cfg.numOperands - 1 }, () => 1)];
};

/**
 * Constructively generate a subtraction problem with borrows in every column.
 * Column-by-column (right-to-left): choose minuend digit and subtrahend digits
 * such that minuendDigit - subDigitSum - borrowIn < 0, forcing a borrow.
 */
const generateBorrowChainProblem = (rng: () => number, cfg: HissanConfig): Problem => {
  const numSubs = cfg.numOperands - 1;

  for (let attempt = 0; attempt < 100; attempt++) {
    // Choose digit count for minuend = maxDigits, subtrahends within [minDigits, maxDigits]
    const minuendWidth = cfg.minDigits + Math.floor(rng() * (cfg.maxDigits - cfg.minDigits + 1));
    const subWidths = Array.from({ length: numSubs }, () =>
      cfg.minDigits + Math.floor(rng() * (cfg.maxDigits - cfg.minDigits + 1)),
    );
    const width = Math.max(minuendWidth, ...subWidths);
    const minChain = Math.min(2, width);
    const chainLen = minChain + Math.floor(rng() * (width - minChain + 1));

    const minuendDigits: number[] = [];
    const subDigits: number[][] = Array.from({ length: numSubs }, () => []);
    let borrow = 0;

    for (let col = 0; col < width; col++) {
      const activeSubs: number[] = [];
      for (let s = 0; s < numSubs; s++) {
        if (col < subWidths[s]) activeSubs.push(s);
      }
      const minuendActive = col < minuendWidth;

      if (col < chainLen && minuendActive) {
        // Borrow chain: need minuendDigit < subDigitSum + borrow (forces borrow out)
        // subDigitSum must be >= minuendDigit - borrow + 1 for a borrow to occur
        // Pick minuend digit, then choose sub digits that exceed it
        const mDigit = randInt(rng, 0, 8); // leave room for sub digits to exceed
        const minSubSum = mDigit + 1 - borrow; // need subSum > mDigit - borrow, so subSum >= mDigit - borrow + 1
        if (minSubSum > activeSubs.length * 9 || minSubSum < 0) {
          // Can't force a borrow with these constraints at this column
          // Use simpler approach: mDigit=0, subDigits sum to at least 1
          minuendDigits.push(0);
          const colSubs = activeSubs.length > 0
            ? digitsWithMinSum(rng, activeSubs.length, Math.max(1 - borrow, 0))
            : [];
          let si = 0;
          for (let s = 0; s < numSubs; s++) {
            subDigits[s].push(col < subWidths[s] ? colSubs[si++] : 0);
          }
          const diff = 0 - colSubs.reduce((a, b) => a + b, 0) - borrow;
          borrow = diff < 0 ? 1 : 0;
        } else {
          minuendDigits.push(mDigit);
          const safeMinSubSum = Math.max(0, minSubSum);
          const colSubs = activeSubs.length > 0
            ? digitsWithMinSum(rng, activeSubs.length, safeMinSubSum)
            : [];
          let si = 0;
          for (let s = 0; s < numSubs; s++) {
            subDigits[s].push(col < subWidths[s] ? colSubs[si++] : 0);
          }
          const diff = mDigit - colSubs.reduce((a, b) => a + b, 0) - borrow;
          borrow = diff < 0 ? 1 : 0;
        }
      } else {
        // Beyond chain or minuend not active: free digits, no forced borrow
        const mDigit = minuendActive ? randInt(rng, 0, 9) : 0;
        minuendDigits.push(mDigit);
        const colSubs = activeSubs.map(() => randInt(rng, 0, 9));
        let si = 0;
        for (let s = 0; s < numSubs; s++) {
          subDigits[s].push(col < subWidths[s] ? colSubs[si++] : 0);
        }
        // Don't force borrow beyond chain
        borrow = 0;
      }
    }

    const minuend = minuendDigits.reduce((num, d, col) => num + d * Math.pow(10, col), 0);
    const subs = subDigits.map((digits) =>
      digits.reduce((num, d, col) => num + d * Math.pow(10, col), 0),
    );
    const result = minuend - subs.reduce((a, b) => a + b, 0);

    // Verify: result >= 0, each number has intended digit count
    const minuendOk = minuend >= (minuendWidth <= 1 ? 1 : Math.pow(10, minuendWidth - 1));
    const subsOk = subs.every((s, i) => s >= (subWidths[i] <= 1 ? 1 : Math.pow(10, subWidths[i] - 1)));
    if (result >= 0 && minuendOk && subsOk) {
      return [minuend, ...subs];
    }
  }

  // Fallback
  return generateSubtractionProblem(rng, cfg);
};

const generateProblem = (rng: () => number, cfg: HissanConfig): Problem => {
  if (cfg.operator === "sub") {
    if (cfg.consecutiveCarries) return generateBorrowChainProblem(rng, cfg);
    return generateSubtractionProblem(rng, cfg);
  }
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
  if (cfg.operator === "add") {
    url.searchParams.set("hops", String(cfg.numOperands));
  } else {
    url.searchParams.delete("hops");
  }
  if (cfg.consecutiveCarries) {
    url.searchParams.set("hcc", "1");
  } else {
    url.searchParams.delete("hcc");
  }
  if (!cfg.showGrid) {
    url.searchParams.set("hgrid", "0");
  } else {
    url.searchParams.delete("hgrid");
  }
  if (cfg.operator === "sub") {
    url.searchParams.set("hop", "sub");
  } else {
    url.searchParams.delete("hop");
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
  const showGrid = params.get("hgrid") !== "0";
  const operator: HissanOperator = params.get("hop") === "sub" ? "sub" : "add";
  if (operator === "sub") numOperands = 2;
  return { minDigits, maxDigits, numOperands, consecutiveCarries, showGrid, operator };
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
  operator,
}: {
  index: number;
  problem: Problem;
  showAnswers: boolean;
  maxDigits: number;
  operator: HissanOperator;
}) {
  const answer = operator === "sub"
    ? problem[0] - problem.slice(1).reduce((a, b) => a + b, 0)
    : problem.reduce((a, b) => a + b, 0);

  // totalCols = maxDigits + 1 (extra column for operator / potential carry)
  const totalCols = maxDigits + 1;
  const answerDigits = toDigitCells(answer, totalCols);
  const last = problem.length - 1;
  const operatorSymbol = operator === "sub" ? "\u2212" : "+";

  // Compute carries/borrows: iterate columns right-to-left
  const operandDigits = problem.map((op) => toDigitCells(op, totalCols));
  const indicators = new Array<number>(totalCols).fill(0);
  // For subtraction: borrowOut[col]=1 means this column borrows from its left neighbor
  const borrowOut = new Array<number>(totalCols).fill(0);
  // For subtraction: display value above slashed digit
  const borrowDisplay = new Array<number | "">(totalCols).fill("");

  if (operator === "sub") {
    // Compute borrows
    let borrow = 0;
    for (let col = totalCols - 1; col >= 0; col--) {
      const minuendDigit = operandDigits[0][col] === "" ? 0 : operandDigits[0][col] as number;
      let subSum = 0;
      for (let s = 1; s < operandDigits.length; s++) {
        const d = operandDigits[s][col];
        if (d !== "") subSum += d;
      }
      indicators[col] = borrow;
      const diff = minuendDigit - subSum - borrow;
      borrowOut[col] = diff < 0 ? 1 : 0;
      if (borrow > 0) {
        // digit - 1, plus 10 if this column also borrows from left
        borrowDisplay[col] = minuendDigit - 1 + borrowOut[col] * 10;
      }
      borrow = borrowOut[col];
    }
  } else {
    // Compute carries
    let carry = 0;
    for (let col = totalCols - 1; col >= 0; col--) {
      let colSum = carry;
      for (const digits of operandDigits) {
        const d = digits[col];
        if (d !== "") colSum += d;
      }
      indicators[col] = carry;
      carry = Math.floor(colSum / 10);
    }
  }

  return (
    <div className="hissan-problem">
      <span className="hissan-number">({index + 1})</span>
      <table className="hissan-grid">
        <tbody>
          <tr className="hissan-carry-row">
            {indicators.map((c, i) => (
              <td key={i}>
                {showAnswers && c > 0
                  ? (operator === "sub" ? borrowDisplay[i] : c)
                  : ""}
              </td>
            ))}
          </tr>
          {problem.map((operand, ri) => {
            const digits = toDigitCells(operand, totalCols);
            if (ri < last) {
              return (
                <tr key={ri}>
                  {digits.map((d, i) => (
                    <td key={i} className={
                      `hissan-cell${showAnswers && operator === "sub" && ri === 0 && indicators[i] > 0 ? " hissan-slashed" : ""}${showAnswers && operator === "sub" && ri === 0 && borrowOut[i] > 0 && indicators[i] === 0 ? " hissan-borrow-in" : ""}`
                    }>{d}</td>
                  ))}
                </tr>
              );
            }
            return (
              <tr key={ri} className="hissan-operator-row">
                <td className="hissan-cell">{operatorSymbol}</td>
                {digits.slice(1).map((d, i) => (
                  <td key={i} className="hissan-cell">{d}</td>
                ))}
              </tr>
            );
          })}
          <tr className="hissan-answer-row">
            {answerDigits.map((d, i) => (
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
        const raw = e.target.value;
        const value = e.target instanceof HTMLInputElement && e.target.type === "checkbox"
          ? e.target.checked
          : isNaN(parseInt(raw, 10)) ? raw : parseInt(raw, 10);
        const next = { ...prev, [field]: value };
        if (field === "operator" && next.operator === "sub")
          next.numOperands = 2;
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

  const handleToggleGrid = useCallback(() => {
    setCfg((prev) => {
      const next = { ...prev, showGrid: !prev.showGrid };
      updateUrl(seed, showAnswers, next);
      return next;
    });
  }, [seed, showAnswers]);

  const qrUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("hq", seedToHex(seed));
    url.searchParams.set("answers", "1");
    url.searchParams.set("hmin", String(cfg.minDigits));
    url.searchParams.set("hmax", String(cfg.maxDigits));
    if (cfg.operator === "add") url.searchParams.set("hops", String(cfg.numOperands));
    if (cfg.consecutiveCarries) url.searchParams.set("hcc", "1");
    if (!cfg.showGrid) url.searchParams.set("hgrid", "0");
    if (cfg.operator === "sub") url.searchParams.set("hop", "sub");
    return url.toString();
  }, [seed, cfg]);

  return (
    <>
      <div className="no-print controls">
        <select className="operator-select" value={cfg.operator} onChange={handleConfigChange("operator")}>
          <option value="add">たし算</option>
          <option value="sub">ひき算</option>
        </select>
        <button onClick={handleNewProblems}>新しい問題</button>
        <button onClick={handleToggleAnswers}>
          {showAnswers ? "答えを隠す" : "答え"}
        </button>
        <button onClick={() => setShowSettings((prev) => !prev)}>
          設定
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
          {cfg.operator !== "sub" && (
            <label>
              項数{" "}
              <select className="operator-select" value={cfg.numOperands} onChange={handleConfigChange("numOperands")}>
                {[2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          )}
          <label>
            <input type="checkbox" checked={cfg.consecutiveCarries} onChange={handleConfigChange("consecutiveCarries")} />
            {cfg.operator === "sub" ? "連続繰り下がり" : "連続繰り上がり"}
          </label>
          <label>
            <input type="checkbox" checked={cfg.showGrid} onChange={handleToggleGrid} />
            補助グリッド
          </label>
        </div>
      )}
      <div className={`hissan-page${cfg.showGrid ? "" : " hissan-no-grid"}`}>
        {problems.map((problem, i) => (
          <HissanProblem
            key={i}
            index={i}
            problem={problem}
            showAnswers={showAnswers}
            maxDigits={cfg.maxDigits}
            operator={cfg.operator}
          />
        ))}
      </div>
      <div className="qr-section">
        <QRCodeSVG value={qrUrl} size={80} />
        <span className="qr-label">答え</span>
      </div>
    </>
  );
}

export const hissan: ProblemTypeDefinition = {
  id: "hissan",
  label: "ひっ算",
  Component: Hissan,
};
