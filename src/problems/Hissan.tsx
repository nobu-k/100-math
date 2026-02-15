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
  toDecimalDigitCells,
  computeIndicators,
  computeMulDetails,
  computeDivDetails,
} from "./hissan";
import "../App.css";

const updateUrl = (seed: number, showAnswers: boolean, cfg: HissanConfig) => {
  const url = new URL(window.location.href);
  const params = buildParams(seed, showAnswers, cfg);
  // Replace all hissan-related params on the existing URL
  for (const key of ["hq", "answers", "hmin", "hmax", "hops", "hcc", "hgrid", "hop", "hmmin", "hmmax", "hdmin", "hdmax", "hdr", "hdre", "hdec"]) {
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
  dps,
}: {
  index: number;
  problem: Problem;
  showAnswers: boolean;
  maxDigits: number;
  operator: HissanOperator;
  dps: number[];
}) {
  const maxDP = Math.max(...dps);
  const operatorSymbol = operator === "sub" ? "\u2212" : "+";
  const last = problem.length - 1;

  if (maxDP > 0) {
    // Decimal rendering path
    const maxIntDigits = Math.max(
      ...problem.map((op, i) => {
        const numDigits = String(op).length;
        return dps[i] >= numDigits ? 1 : numDigits - dps[i];
      }),
    );
    const effectiveMaxDigits = maxIntDigits + maxDP;
    const totalIntCols = maxIntDigits + 1; // +1 for operator/carry overflow
    const totalDecCols = maxDP;

    const aligned = problem.map((op, i) => op * Math.pow(10, maxDP - dps[i]));
    const answer = operator === "sub"
      ? aligned[0] - aligned.slice(1).reduce((a, b) => a + b, 0)
      : aligned.reduce((a, b) => a + b, 0);
    const { indicators, borrowOut, borrowDisplay } = computeIndicators(aligned, effectiveMaxDigits, operator);
    const answerCells = toDecimalDigitCells(answer, maxDP, totalIntCols, totalDecCols);

    // Clear trailing zeros in the decimal portion of a cell array
    const trimDecZeros = (cells: (number | "")[]) => {
      const out = [...cells];
      for (let i = out.length - 1; i >= totalIntCols; i--) {
        if (out[i] === 0) out[i] = "";
        else break;
      }
      return out;
    };
    const hasDecDigits = (cells: (number | "")[]) =>
      cells.slice(totalIntCols).some((d) => d !== "");

    const trimmedAnswer = trimDecZeros(answerCells);
    const isSub = operator === "sub";

    return (
      <div className="hissan-problem">
        <span className="hissan-number">({index + 1})</span>
        <table className="hissan-grid">
          <tbody>
            <tr className="hissan-carry-row">
              {indicators.map((c, i) => (
                <td key={i}>
                  {showAnswers && c > 0
                    ? (isSub ? borrowDisplay[i] : c)
                    : ""}
                </td>
              ))}
            </tr>
            {problem.map((operand, ri) => {
              const rawCells = toDecimalDigitCells(operand, dps[ri], totalIntCols, totalDecCols);
              const trimmedCells = trimDecZeros(rawCells);
              // Keep trailing zeros on minuend when showing subtraction answers
              // so borrow marks render on the padded zero positions.
              const cells = (showAnswers && isSub && ri === 0) ? rawCells : trimmedCells;
              const intPart = cells.slice(0, totalIntCols);
              const decPart = cells.slice(totalIntCols);
              const showDot = hasDecDigits(cells);
              const isSub0 = showAnswers && isSub && ri === 0;

              if (ri < last) {
                return (
                  <tr key={ri}>
                    {intPart.map((d, i) => {
                      const slashed = isSub0 && indicators[i] > 0;
                      const borrowIn = isSub0 && borrowOut[i] > 0 && indicators[i] === 0;
                      return (
                        <td key={i} className={`hissan-cell${i === totalIntCols - 1 && showDot ? " hissan-dot-after" : ""}${slashed ? " hissan-slashed" : ""}`}>
                          {borrowIn ? <><span className="hissan-dec-borrow">1</span>{d === "" ? 0 : d}</> : d}
                        </td>
                      );
                    })}
                    {decPart.map((d, i) => {
                      const ci = totalIntCols + i;
                      const slashed = isSub0 && indicators[ci] > 0;
                      const borrowIn = isSub0 && borrowOut[ci] > 0 && indicators[ci] === 0;
                      // Padded trailing zero: was "" after trimming but 0 in raw cells.
                      // When borrowed, show fully red "10" since the zero wasn't in the original number.
                      const paddedZero = isSub0 && trimmedCells[ci] === "" && rawCells[ci] === 0;
                      return (
                        <td key={`d${i}`} className={`hissan-cell${slashed ? " hissan-slashed" : ""}`}>
                          {borrowIn
                            ? (paddedZero
                              ? <span className="hissan-dec-borrow">10</span>
                              : <><span className="hissan-dec-borrow">1</span>{d}</>)
                            : d}
                        </td>
                      );
                    })}
                  </tr>
                );
              }
              return (
                <tr key={ri} className="hissan-operator-row">
                  <td className="hissan-cell">{operatorSymbol}</td>
                  {intPart.slice(1).map((d, i) => (
                    <td key={i} className={`hissan-cell${i === totalIntCols - 2 && showDot ? " hissan-dot-after" : ""}`}>{d}</td>
                  ))}
                  {decPart.map((d, i) => (
                    <td key={`d${i}`} className="hissan-cell">{d}</td>
                  ))}
                </tr>
              );
            })}
            <tr className="hissan-answer-row">
              {trimmedAnswer.slice(0, totalIntCols).map((d, i) => (
                <td key={i} className={`hissan-cell${i === totalIntCols - 1 && showAnswers && hasDecDigits(trimmedAnswer) ? " hissan-dot-after" : ""}`}>{showAnswers ? d : ""}</td>
              ))}
              {trimmedAnswer.slice(totalIntCols).map((d, i) => (
                <td key={`d${i}`} className="hissan-cell">{showAnswers ? d : ""}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // Integer rendering path (existing logic)
  const answer = operator === "sub"
    ? problem[0] - problem.slice(1).reduce((a, b) => a + b, 0)
    : problem.reduce((a, b) => a + b, 0);

  // totalCols = maxDigits + 1 (extra column for operator / potential carry)
  const totalCols = maxDigits + 1;
  const answerDigits = toDigitCells(answer, totalCols);

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
  dps,
}: {
  index: number;
  problem: Problem;
  showAnswers: boolean;
  cfg: HissanConfig;
  dps: number[];
}) {
  const [multiplicand, multiplier] = problem;
  const [dp1, dp2] = dps;
  const dpTotal = dp1 + dp2;
  const maxDP = Math.max(dp1, dp2);
  const { partials, finalAnswer } = computeMulDetails(multiplicand, multiplier);

  const mcandLen = String(multiplicand).length;
  const mplierLen = String(multiplier).length;
  const singleDigitMultiplier = mplierLen === 1;

  // Compute totalCols: for decimal mode, account for leading zeros on numbers < 1
  let totalCols: number;
  if (maxDP > 0) {
    const mcandDisplayWidth = dp1 > 0 ? Math.max(mcandLen, dp1 + 1) : mcandLen;
    const mplierDisplayWidth = dp2 > 0 ? Math.max(mplierLen, dp2 + 1) : mplierLen;
    const answerLen = String(finalAnswer).length;
    const answerDisplayWidth = dpTotal > 0 ? Math.max(answerLen, dpTotal + 1) : answerLen;
    const maxPartialWidth = Math.max(...partials.map(pp => String(pp.value).length + pp.shift));
    totalCols = Math.max(mcandDisplayWidth + 1, mplierDisplayWidth + 1, maxPartialWidth, answerDisplayWidth);
  } else {
    totalCols = cfg.maxDigits + cfg.mulMaxDigits;
  }

  /** Build digit cells for a number with dp decimal places.
   *  Pads with leading zeros when dp >= numDigits (e.g. 25 with dp=3 → "0.025"). */
  const toDecimalMulCells = (n: number, dp: number): (number | "")[] => {
    if (dp === 0) return toDigitCells(n, totalCols);
    const numDig = String(n).length;
    const displayWidth = Math.max(numDig, dp + 1);
    const padded = String(n).padStart(displayWidth, "0");
    const cells: (number | "")[] = Array(totalCols).fill("");
    for (let i = 0; i < padded.length; i++) {
      cells[totalCols - padded.length + i] = parseInt(padded[i], 10);
    }
    return cells;
  };

  const mcandCells = toDecimalMulCells(multiplicand, dp1);
  const mplierCells = toDecimalMulCells(multiplier, dp2);
  const answerCells = toDecimalMulCells(finalAnswer, dpTotal);

  // Dot column positions (-1 = no dot)
  const mcandDotCol = dp1 > 0 ? totalCols - 1 - dp1 : -1;
  const mplierDotCol = dp2 > 0 ? totalCols - 1 - dp2 : -1;
  const answerDotCol = dpTotal > 0 ? totalCols - 1 - dpTotal : -1;

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

  const renderPartialRow = (pp: typeof partials[0], dotCol?: number, dp?: number) => {
    let digits: (number | "")[];
    if (dp !== undefined && dp > 0) {
      // Decimal answer: pad with leading zeros for numbers < 1
      digits = toDecimalMulCells(pp.value, dp);
    } else {
      digits = [
        ...toDigitCells(pp.value, totalCols - pp.shift),
        ...Array(pp.shift).fill(""),
      ];
    }
    const carries = carryMap(pp.carries, pp.shift);
    const firstDigitCol = digits.findIndex((d) => d !== "");
    return digits.map((d, i) => (
      <td key={i} className={`hissan-cell${dotCol !== undefined && i === dotCol ? " hissan-dot-after" : ""}`}>
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
            {mcandCells.map((d, i) => (
              <td key={i} className={`hissan-cell${i === mcandDotCol ? " hissan-dot-after" : ""}`}>{d}</td>
            ))}
          </tr>
          {/* Multiplier row (with operator) */}
          <tr className={singleDigitMultiplier ? "hissan-operator-row" : "hissan-mul-operator-row"}>
            {mplierCells.map((d, i) => (
              <td key={i} className={`hissan-cell${i === mplierDotCol ? " hissan-dot-after" : ""}`}>{i === 0 ? "\u00d7" : d}</td>
            ))}
          </tr>
          {singleDigitMultiplier ? (
            /* Single-digit multiplier: answer directly below with carries */
            <tr className="hissan-answer-row">
              {renderPartialRow(
                partials[0],
                showAnswers && answerDotCol >= 0 ? answerDotCol : undefined,
                dpTotal > 0 ? dpTotal : undefined,
              )}
            </tr>
          ) : (
            <>
              {/* Partial products with inline carries (no dot) */}
              {partials.map((pp, pi) => (
                <tr key={pi} className={`hissan-answer-row${pi === partials.length - 1 ? " hissan-partial-last-row" : ""}`}>
                  {renderPartialRow(pp)}
                </tr>
              ))}
              {/* Final answer */}
              <tr className="hissan-answer-row">
                {answerCells.map((d, i) => (
                  <td key={i} className={`hissan-cell${showAnswers && i === answerDotCol ? " hissan-dot-after" : ""}`}>
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
  dps,
  extraDigits = 0,
  cycleStart,
  cycleLength,
}: {
  index: number;
  problem: Problem;
  showAnswers: boolean;
  dps: number[];
  extraDigits?: number;
  cycleStart?: number;
  cycleLength?: number;
}) {
  const [dividend, divisor] = problem;
  const { quotient, remainder, steps, extraStepCount } = computeDivDetails(dividend, divisor, extraDigits);
  const dividendDigits = String(dividend).split("").map(Number);
  const divisorDigits = String(divisor).split("").map(Number);
  const quotientStr = String(quotient);
  const divCols = divisorDigits.length;

  const dividendDP = dps[0] || 0;
  const dividendDisplayWidth = dividendDP > 0
    ? Math.max(dividendDigits.length, dividendDP + 1)
    : dividendDigits.length;
  const dividendOffset = dividendDisplayWidth - dividendDigits.length;
  const totalCols = divCols + dividendDisplayWidth + extraDigits;
  // Dot column: always at the same position relative to the original dividend area
  const dotCol = dividendDP > 0 ? divCols + dividendDisplayWidth - 1 - dividendDP : -1;

  // Build extended quotient string including extra step digits
  let extQuotientStr = quotientStr;
  if (extraStepCount > 0) {
    const extraSteps = steps.slice(steps.length - extraStepCount);
    extQuotientStr += extraSteps.map(s => String(s.quotientDigit)).join("");
  }

  // Map quotient digits to their column positions (right-aligned to full grid)
  const quotientDP = dividendDP + extraDigits;
  const quotientCols: (number | "")[] = Array(totalCols).fill("");
  const quotientDisplayStr = quotientDP > 0
    ? extQuotientStr.padStart(Math.max(extQuotientStr.length, quotientDP + 1), "0")
    : extQuotientStr;
  for (let i = 0; i < quotientDisplayStr.length; i++) {
    const col = totalCols - quotientDisplayStr.length + i;
    quotientCols[col] = parseInt(quotientDisplayStr[i], 10);
  }

  // Build dividend display string (with leading zeros when dp >= numDigits)
  const dividendDisplayStr = dividendDP > 0
    ? String(dividend).padStart(dividendDisplayWidth, "0")
    : String(dividend);

  // Cycle dot columns (for repeating decimal notation)
  const cycleDotCols = new Set<number>();
  if (cycleStart !== undefined && cycleLength !== undefined && showAnswers) {
    const firstCycleCol = divCols + dividendDisplayWidth + cycleStart;
    if (cycleLength === 1) {
      cycleDotCols.add(firstCycleCol);
    } else {
      cycleDotCols.add(firstCycleCol);
      cycleDotCols.add(firstCycleCol + cycleLength - 1);
    }
  }

  // Build work rows from steps (always, so students have space to calculate)
  const workRows: { cells: (number | "")[], hasBottomBorder: boolean }[] = [];
  for (let si = 0; si < steps.length; si++) {
    const step = steps[si];
    const endCol = divCols + dividendOffset + step.position;

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
        // Bring down next digit: from dividend array, or 0 for extra extension steps
        const nextDigit = nextDigitIndex < dividendDigits.length ? dividendDigits[nextDigitIndex] : 0;
        remStr = String(step.remainder * 10 + nextDigit);
      } else {
        remStr = String(step.remainder);
      }
      const remEndCol = si < steps.length - 1 ? divCols + dividendOffset + nextDigitIndex : endCol;
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
          <tr>
            {quotientCols.map((d, i) => (
              <td key={i} className={`hissan-div-cell${i < divCols ? " hissan-div-outside" : " hissan-div-bracket-top-line"}${i === divCols ? " hissan-div-bracket-top-start" : ""}${showAnswers && i === dotCol ? " hissan-div-dot-after" : ""}${cycleDotCols.has(i) ? " hissan-div-cycle-dot" : ""}`}>
                {showAnswers ? d : ""}
              </td>
            ))}
            {showAnswers && remainder > 0 && cycleStart === undefined && (
              <td className="hissan-div-cell hissan-div-outside hissan-div-remainder">…{remainder}</td>
            )}
          </tr>
          {/* Divisor + Dividend row */}
          <tr>
            {divisorDigits.map((d, i) => (
              <td key={`div${i}`} className="hissan-div-cell hissan-div-outside">{d}</td>
            ))}
            {dividendDisplayStr.split("").map((ch, i) => (
              <td key={i} className={`hissan-div-cell${divCols + i === dotCol ? " hissan-div-dot-after" : ""}`}>
                {i === 0 && (
                  <svg className="hissan-div-bracket-curve" viewBox="0 0 10 30" preserveAspectRatio="none">
                    <path d="M0,0 C10,8 10,22 0,30" stroke="#000" strokeWidth="3" fill="none" />
                  </svg>
                )}
                {parseInt(ch, 10)}
              </td>
            ))}
            {Array.from({ length: extraDigits }, (_, i) => (
              <td key={`ext${i}`} className="hissan-div-cell" />
            ))}
          </tr>
          {/* Work rows */}
          {workRows.map((row, ri) => (
            <tr key={ri}>
              {row.cells.map((d, i) => (
                <td key={i} className={`hissan-div-cell hissan-div-work-cell${i < divCols ? " hissan-div-outside" : ""}${row.hasBottomBorder && i >= divCols ? " hissan-div-subtract-line" : ""}`}>{d}</td>
              ))}
            </tr>
          ))}
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

  const { problems, decimalPlaces, divExtra } = useMemo(() => generateProblems(seed, cfg), [seed, cfg]);

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
        if (field === "useDecimals" && next.useDecimals)
          next.consecutiveCarries = false;
        if (field === "useDecimals" && !next.useDecimals)
          next.divAllowRepeating = false;
        if (next.operator === "div" && next.useDecimals)
          next.divAllowRemainder = false;
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
    for (const key of ["hq", "answers", "hmin", "hmax", "hops", "hcc", "hgrid", "hop", "hmmin", "hmmax", "hdmin", "hdmax", "hdr", "hdre", "hdec"]) {
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
              {!cfg.useDecimals && (
                <label>
                  <input type="checkbox" checked={cfg.divAllowRemainder} onChange={handleConfigChange("divAllowRemainder")} />
                  あまりあり
                </label>
              )}
              {cfg.useDecimals && (
                <label>
                  <input type="checkbox" checked={cfg.divAllowRepeating} onChange={handleConfigChange("divAllowRepeating")} />
                  循環小数
                </label>
              )}
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
          {(cfg.operator === "add" || cfg.operator === "sub" || cfg.operator === "mul" || cfg.operator === "div") && (
            <label>
              <input type="checkbox" checked={cfg.useDecimals} onChange={handleConfigChange("useDecimals")} />
              小数
            </label>
          )}
          {cfg.operator !== "mul" && cfg.operator !== "div" && !cfg.useDecimals && (
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
      <div className={`hissan-page${cfg.showGrid ? "" : " hissan-no-grid"}${cfg.operator === "mul" && (cfg.mulMaxDigits >= 2 || cfg.useDecimals) ? " hissan-mul-wide" : ""}${cfg.operator === "div" && !cfg.useDecimals ? " hissan-div-page" : ""}${cfg.useDecimals ? " hissan-dec-wide" : ""}`}>
        {problems.map((problem, i) =>
          cfg.operator === "div" ? (
            <HissanDivProblem
              key={i}
              index={i}
              problem={problem}
              showAnswers={showAnswers}
              dps={decimalPlaces[i]}
              extraDigits={divExtra?.[i]?.extraDigits}
              cycleStart={divExtra?.[i]?.cycleStart}
              cycleLength={divExtra?.[i]?.cycleLength}
            />
          ) : cfg.operator === "mul" ? (
            <HissanMulProblem
              key={i}
              index={i}
              problem={problem}
              showAnswers={showAnswers}
              cfg={cfg}
              dps={decimalPlaces[i]}
            />
          ) : (
            <HissanProblem
              key={i}
              index={i}
              problem={problem}
              showAnswers={showAnswers}
              maxDigits={cfg.maxDigits}
              operator={cfg.operator}
              dps={decimalPlaces[i]}
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
