import React, { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { ProblemTypeDefinition } from "./types";
import { randomSeed, hexToSeed } from "./random";
import {
  type Problem,
  type HissanOperator,
  type HissanConfig,
  generateProblems,
  parseConfig,
  buildParams,
  toDigitCells,
  computeIndicators,
  computeMulDetails,
  computeDivDetails,
} from "./hissan-logic";
import "../App.css";

const updateUrl = (seed: number, showAnswers: boolean, cfg: HissanConfig) => {
  const url = new URL(window.location.href);
  const params = buildParams(seed, showAnswers, cfg);
  // Replace all hissan-related params on the existing URL
  for (const key of ["hq", "answers", "hmin", "hmax", "hops", "hcc", "hgrid", "hop", "hmmin", "hmmax", "hdmin", "hdmax", "hdr"]) {
    url.searchParams.delete(key);
  }
  for (const [key, value] of params) {
    url.searchParams.set(key, value);
  }
  window.history.replaceState(null, "", url.toString());
};

const getInitialConfig = (): HissanConfig => {
  return parseConfig(new URLSearchParams(window.location.search));
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

  const { indicators, borrowOut, borrowDisplay } = computeIndicators(problem, maxDigits, operator);

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

function HissanMulProblem({
  index,
  problem,
  showAnswers,
  cfg,
}: {
  index: number;
  problem: Problem;
  showAnswers: boolean;
  cfg: HissanConfig;
}) {
  const [multiplicand, multiplier] = problem;
  const { partials, finalAnswer } = computeMulDetails(multiplicand, multiplier);
  const totalCols = cfg.maxDigits + cfg.mulMaxDigits;
  const mcandDigits = toDigitCells(multiplicand, totalCols);
  const mplierDigits = toDigitCells(multiplier, totalCols);
  const answerDigits = toDigitCells(finalAnswer, totalCols);
  const singleDigitMultiplier = String(multiplier).length === 1;
  const mcandLen = String(multiplicand).length;

  /** Build a per-column carry map for a partial product.
   *  carries[i] is the carry OUT of multiplicand digit i (left-to-right).
   *  That carry is added INTO the column one position to the left. */
  const carryMap = (carries: number[], shift: number): (number | null)[] => {
    const map: (number | null)[] = Array(totalCols).fill(null);
    const startCol = totalCols - mcandLen - shift;
    for (let i = 0; i < carries.length; i++) {
      const targetCol = startCol + i - 1;
      if (targetCol >= 0 && carries[i] > 0) {
        map[targetCol] = carries[i];
      }
    }
    return map;
  };

  const renderPartialRow = (pp: typeof partials[0]) => {
    const digits: (number | "")[] = [
      ...toDigitCells(pp.value, totalCols - pp.shift),
      ...Array(pp.shift).fill(""),
    ];
    const carries = carryMap(pp.carries, pp.shift);
    const firstDigitCol = digits.findIndex((d) => d !== "");
    return digits.map((d, i) => (
      <td key={i} className="hissan-cell">
        {showAnswers && i > firstDigitCol && carries[i] != null && <span className="hissan-cell-carry">{carries[i]}</span>}
        {showAnswers ? d : ""}
      </td>
    ));
  };

  return (
    <div className="hissan-problem">
      <span className="hissan-number">({index + 1})</span>
      <table className="hissan-grid">
        <tbody>
          {/* Multiplicand row */}
          <tr>
            {mcandDigits.map((d, i) => (
              <td key={i} className="hissan-cell">{d}</td>
            ))}
          </tr>
          {/* Multiplier row (with operator) */}
          <tr className={singleDigitMultiplier ? "hissan-operator-row" : "hissan-mul-operator-row"}>
            {mplierDigits.map((d, i) => (
              <td key={i} className="hissan-cell">{i === 0 ? "\u00d7" : d}</td>
            ))}
          </tr>
          {singleDigitMultiplier ? (
            /* Single-digit multiplier: answer directly below with carries */
            <tr className="hissan-answer-row">
              {renderPartialRow(partials[0])}
            </tr>
          ) : (
            <>
              {/* Partial products with inline carries */}
              {partials.map((pp, pi) => (
                <tr key={pi} className={`hissan-answer-row${pi === partials.length - 1 ? " hissan-partial-last-row" : ""}`}>
                  {renderPartialRow(pp)}
                </tr>
              ))}
              {/* Final answer */}
              <tr className="hissan-answer-row">
                {answerDigits.map((d, i) => (
                  <td key={i} className="hissan-cell">
                    {showAnswers ? d : ""}
                  </td>
                ))}
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}

function HissanDivProblem({
  index,
  problem,
  showAnswers,
}: {
  index: number;
  problem: Problem;
  showAnswers: boolean;
}) {
  const [dividend, divisor] = problem;
  const { quotient, remainder, steps } = computeDivDetails(dividend, divisor);
  const dividendStr = String(dividend);
  const dividendDigits = dividendStr.split("").map(Number);
  const quotientStr = String(quotient);
  const totalCols = 1 + dividendDigits.length; // col 0 = divisor, cols 1+ = dividend

  // Map quotient digits to their column positions (right-aligned to dividend)
  const quotientCols: (number | "")[] = Array(totalCols).fill("");
  for (let i = 0; i < quotientStr.length; i++) {
    const col = totalCols - quotientStr.length + i;
    quotientCols[col] = parseInt(quotientStr[i], 10);
  }

  // Build work rows from steps (always, so students have space to calculate)
  const workRows: { cells: (number | "")[], hasBottomBorder: boolean }[] = [];
  for (let si = 0; si < steps.length; si++) {
    const step = steps[si];
    const endCol = step.position + 1; // 1-based column in totalCols

    // Subtract row: product right-aligned ending at endCol
    const subtractCells: (number | "")[] = Array(totalCols).fill("");
    if (showAnswers) {
      const prodStr = String(step.product);
      for (let i = 0; i < prodStr.length; i++) {
        const col = endCol - prodStr.length + 1 + i;
        if (col >= 0) subtractCells[col] = parseInt(prodStr[i], 10);
      }
    }
    workRows.push({ cells: subtractCells, hasBottomBorder: true });

    // Remainder row: remainder digits + next brought-down digit
    const remainderCells: (number | "")[] = Array(totalCols).fill("");
    if (showAnswers) {
      const nextDigitIndex = step.position + 1;
      let remStr: string;
      if (si < steps.length - 1) {
        remStr = String(step.remainder * 10 + dividendDigits[nextDigitIndex]);
      } else {
        remStr = String(step.remainder);
      }
      const remEndCol = si < steps.length - 1 ? nextDigitIndex + 1 : endCol;
      for (let i = 0; i < remStr.length; i++) {
        const col = remEndCol - remStr.length + 1 + i;
        if (col >= 0) remainderCells[col] = parseInt(remStr[i], 10);
      }
    }
    workRows.push({ cells: remainderCells, hasBottomBorder: false });
  }

  return (
    <div className="hissan-problem">
      <span className="hissan-number">({index + 1})</span>
      <table className="hissan-grid hissan-div-grid">
        <tbody>
          {/* Quotient row */}
          <tr className="hissan-div-bracket-top">
            {quotientCols.map((d, i) => (
              <td key={i} className={i === 0 ? "hissan-div-cell" : "hissan-div-cell"}>
                {showAnswers ? d : ""}
              </td>
            ))}
          </tr>
          {/* Divisor + Dividend row */}
          <tr>
            <td className="hissan-div-cell hissan-div-divisor">{divisor}</td>
            {dividendDigits.map((d, i) => (
              <td key={i} className={`hissan-div-cell${i === 0 ? " hissan-div-bracket-left" : ""}`}>{d}</td>
            ))}
          </tr>
          {/* Work rows */}
          {workRows.map((row, ri) => (
            <tr key={ri} className={row.hasBottomBorder ? "hissan-div-subtract-row" : ""}>
              {row.cells.map((d, i) => (
                <td key={i} className="hissan-div-cell hissan-div-work-cell">{d}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {showAnswers && remainder > 0 && (
        <span className="hissan-div-remainder">あまり {remainder}</span>
      )}
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
        if (field === "operator" && (next.operator === "sub" || next.operator === "mul" || next.operator === "div"))
          next.numOperands = 2;
        if (field === "operator" && next.operator === "mul") {
          if (next.maxDigits > 3) next.maxDigits = 3;
          if (next.minDigits > next.maxDigits) next.minDigits = next.maxDigits;
        }
        if (field === "operator" && next.operator === "div") {
          if (next.minDigits < 2) next.minDigits = 2;
          if (next.maxDigits < next.minDigits) next.maxDigits = next.minDigits;
        }
        if (field === "minDigits" && next.minDigits > next.maxDigits)
          next.maxDigits = next.minDigits;
        if (field === "maxDigits" && next.maxDigits < next.minDigits)
          next.minDigits = next.maxDigits;
        if (field === "mulMinDigits" && next.mulMinDigits > next.mulMaxDigits)
          next.mulMaxDigits = next.mulMinDigits;
        if (field === "mulMaxDigits" && next.mulMaxDigits < next.mulMinDigits)
          next.mulMinDigits = next.mulMaxDigits;
        if (field === "divMinDigits" && next.divMinDigits > next.divMaxDigits)
          next.divMaxDigits = next.divMinDigits;
        if (field === "divMaxDigits" && next.divMaxDigits < next.divMinDigits)
          next.divMinDigits = next.divMaxDigits;
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
    // Clear all hissan params before rebuilding
    for (const key of ["hq", "answers", "hmin", "hmax", "hops", "hcc", "hgrid", "hop", "hmmin", "hmmax", "hdmin", "hdmax", "hdr"]) {
      url.searchParams.delete(key);
    }
    const params = buildParams(seed, true, cfg);
    for (const [key, value] of params) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  }, [seed, cfg]);

  return (
    <>
      <div className="no-print controls">
        <select className="operator-select" value={cfg.operator} onChange={handleConfigChange("operator")}>
          <option value="add">たし算</option>
          <option value="sub">ひき算</option>
          <option value="mul">かけ算</option>
          <option value="div">わり算</option>
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
            {cfg.operator === "mul" ? "かけられる数" : cfg.operator === "div" ? "割られる数" : "桁数"} 最小{" "}
            <select className="operator-select" value={cfg.minDigits} onChange={handleConfigChange("minDigits")}>
              {(cfg.operator === "mul" ? [1, 2, 3] : cfg.operator === "div" ? [2, 3, 4] : [1, 2, 3, 4]).map((d) => <option key={d} value={d}>{d} 桁</option>)}
            </select>
          </label>
          <label>
            最大{" "}
            <select className="operator-select" value={cfg.maxDigits} onChange={handleConfigChange("maxDigits")}>
              {(cfg.operator === "mul" ? [1, 2, 3] : cfg.operator === "div" ? [2, 3, 4] : [1, 2, 3, 4]).map((d) => <option key={d} value={d}>{d} 桁</option>)}
            </select>
          </label>
          {cfg.operator === "mul" && (
            <>
              <label>
                かける数 最小{" "}
                <select className="operator-select" value={cfg.mulMinDigits} onChange={handleConfigChange("mulMinDigits")}>
                  {[1, 2, 3].map((d) => <option key={d} value={d}>{d} 桁</option>)}
                </select>
              </label>
              <label>
                最大{" "}
                <select className="operator-select" value={cfg.mulMaxDigits} onChange={handleConfigChange("mulMaxDigits")}>
                  {[1, 2, 3].map((d) => <option key={d} value={d}>{d} 桁</option>)}
                </select>
              </label>
            </>
          )}
          {cfg.operator === "div" && (
            <>
              <label>
                わる数 最小{" "}
                <select className="operator-select" value={cfg.divMinDigits} onChange={handleConfigChange("divMinDigits")}>
                  {[1, 2].map((d) => <option key={d} value={d}>{d} 桁</option>)}
                </select>
              </label>
              <label>
                最大{" "}
                <select className="operator-select" value={cfg.divMaxDigits} onChange={handleConfigChange("divMaxDigits")}>
                  {[1, 2].map((d) => <option key={d} value={d}>{d} 桁</option>)}
                </select>
              </label>
              <label>
                <input type="checkbox" checked={cfg.divAllowRemainder} onChange={handleConfigChange("divAllowRemainder")} />
                あまりあり
              </label>
            </>
          )}
          {cfg.operator === "add" && (
            <label>
              項数{" "}
              <select className="operator-select" value={cfg.numOperands} onChange={handleConfigChange("numOperands")}>
                {[2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          )}
          {cfg.operator !== "mul" && cfg.operator !== "div" && (
            <label>
              <input type="checkbox" checked={cfg.consecutiveCarries} onChange={handleConfigChange("consecutiveCarries")} />
              {cfg.operator === "sub" ? "連続繰り下がり" : "連続繰り上がり"}
            </label>
          )}
          <label>
            <input type="checkbox" checked={cfg.showGrid} onChange={handleToggleGrid} />
            補助グリッド
          </label>
        </div>
      )}
      <div className={`hissan-page${cfg.showGrid ? "" : " hissan-no-grid"}${cfg.operator === "mul" && cfg.mulMaxDigits >= 2 ? " hissan-mul-wide" : ""}${cfg.operator === "div" ? " hissan-div-page" : ""}`}>
        {problems.map((problem, i) =>
          cfg.operator === "div" ? (
            <HissanDivProblem
              key={i}
              index={i}
              problem={problem}
              showAnswers={showAnswers}
            />
          ) : cfg.operator === "mul" ? (
            <HissanMulProblem
              key={i}
              index={i}
              problem={problem}
              showAnswers={showAnswers}
              cfg={cfg}
            />
          ) : (
            <HissanProblem
              key={i}
              index={i}
              problem={problem}
              showAnswers={showAnswers}
              maxDigits={cfg.maxDigits}
              operator={cfg.operator}
            />
          ),
        )}
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
