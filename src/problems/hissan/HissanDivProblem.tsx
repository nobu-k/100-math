import type { Problem } from "./common";
import { numberToDigits, decimalDisplayWidth } from "./common";
import { computeDivDetails } from "./div";
import { cx } from "./render-utils";

export function HissanDivProblem({
  index,
  problem,
  showAnswers,
  dps,
  extraDigits = 0,
}: {
  index: number;
  problem: Problem;
  showAnswers: boolean;
  dps: number[];
  extraDigits?: number;
}) {
  const [dividend, divisor] = problem;
  const divisorDigits = numberToDigits(divisor);
  const divCols = divisorDigits.length;

  const dividendDP = dps[0] || 0;
  const divisorDP = dps[1] || 0;

  // Normalization for decimal divisors: multiply both by 10^divisorDP
  const extraZeros = Math.max(0, divisorDP - dividendDP);
  const normalizedDividend = divisorDP > 0 ? dividend * Math.pow(10, extraZeros) : dividend;
  const newDividendDP = Math.max(0, dividendDP - divisorDP);

  // Use normalized dividend for computation
  const { quotient, remainder, steps, extraStepCount, cycleStart, cycleLength } =
    computeDivDetails(normalizedDividend, divisor, extraDigits);
  const normalizedDividendDigits = numberToDigits(normalizedDividend);
  const quotientStr = String(quotient);

  // Original dividend display (for the visible row)
  const origDividendDigits = numberToDigits(dividend);
  const origDividendDisplayWidth = decimalDisplayWidth(origDividendDigits.length, dividendDP);
  const origDividendDisplayStr = dividendDP > 0
    ? String(dividend).padStart(origDividendDisplayWidth, "0")
    : String(dividend);

  // Grid dividend area = original display + extra zeros (always >= normalized width)
  const dividendAreaWidth = origDividendDisplayWidth + extraZeros;
  const normalizedDividendOffset = dividendAreaWidth - normalizedDividendDigits.length;

  // Total columns: divisor cols + dividend area + extra extension digits
  const totalCols = divCols + dividendAreaWidth + extraDigits;

  // Quotient dot column (aligned with the normalized dividend's decimal position)
  const dotCol = newDividendDP > 0
    ? divCols + dividendAreaWidth - 1 - newDividendDP
    : (extraDigits > 0 ? divCols + dividendAreaWidth - 1 : -1);

  // Original dividend dot column (for display in the dividend row)
  const origDotCol = dividendDP > 0 ? divCols + origDividendDisplayWidth - 1 - dividendDP : -1;

  // New red dot position when divisorDP > 0 and newDividendDP > 0
  const newRedDotCol = divisorDP > 0 && newDividendDP > 0
    ? divCols + dividendAreaWidth - 1 - newDividendDP
    : -1;

  // Number of leading chars that disappear after normalization (e.g. "0" in "0.598" → "5.98")
  const normalizedDividendDisplayWidth = decimalDisplayWidth(normalizedDividendDigits.length, newDividendDP);
  const lostLeadingChars = dividendAreaWidth - normalizedDividendDisplayWidth;

  // Divisor dot column
  const divisorDotCol = divisorDP > 0 ? divCols - 1 - divisorDP : -1;

  // Build extended quotient string including extra step digits
  let extQuotientStr = quotientStr;
  if (extraStepCount > 0) {
    const extraSteps = steps.slice(steps.length - extraStepCount);
    extQuotientStr += extraSteps.map(s => String(s.quotientDigit)).join("");
  }

  // Map quotient digits to their column positions (right-aligned to full grid)
  const quotientDP = newDividendDP + extraDigits;
  const quotientCols: (number | "")[] = Array(totalCols).fill("");
  const quotientDisplayStr = quotientDP > 0
    ? extQuotientStr.padStart(Math.max(extQuotientStr.length, quotientDP + 1), "0")
    : extQuotientStr;
  for (let i = 0; i < quotientDisplayStr.length; i++) {
    const col = totalCols - quotientDisplayStr.length + i;
    quotientCols[col] = parseInt(quotientDisplayStr[i], 10);
  }

  // Cycle dot columns (for repeating decimal notation) — use computed cycle info
  const cycleDotCols = new Set<number>();
  if (cycleStart !== undefined && cycleLength !== undefined && showAnswers) {
    const firstCycleCol = divCols + dividendAreaWidth + cycleStart;
    if (cycleLength === 1) {
      cycleDotCols.add(firstCycleCol);
    } else {
      cycleDotCols.add(firstCycleCol);
      cycleDotCols.add(firstCycleCol + cycleLength - 1);
    }
  }

  // Build work rows from steps using normalized dividend
  const workRows: { cells: (number | "")[], hasBottomBorder: boolean }[] = [];
  for (let si = 0; si < steps.length; si++) {
    const step = steps[si];
    const endCol = divCols + normalizedDividendOffset + step.position;

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
        const nextDigit = nextDigitIndex < normalizedDividendDigits.length ? normalizedDividendDigits[nextDigitIndex] : 0;
        remStr = String(step.remainder * 10 + nextDigit);
      } else {
        remStr = String(step.remainder);
      }
      const remEndCol = si < steps.length - 1 ? divCols + normalizedDividendOffset + nextDigitIndex : endCol;
      for (let i = 0; i < remStr.length; i++) {
        const col = remEndCol - remStr.length + 1 + i;
        if (col >= 0) remainderCells[col] = parseInt(remStr[i], 10);
      }
    }
    workRows.push({ cells: remainderCells, hasBottomBorder: false });
  }

  // Build dividend row cells
  const dividendRowCells: React.ReactNode[] = [];
  if (divisorDP > 0) {
    // Show original digits, then answer-only annotations (slashed dot, red zeros, new red dot)
    const origChars = origDividendDisplayStr.split("");
    // Columns occupied by original dividend display
    for (let i = 0; i < origChars.length; i++) {
      const colIdx = divCols + i;
      const isOrigDot = colIdx === origDotCol;
      // When showing answers, slash the original dot; otherwise show it normally
      const dotClass = isOrigDot
        ? (showAnswers ? " hissan-div-slashed-dot" : " hissan-div-dot-after")
        : "";
      // Check if this position gets the new red dot
      const redDotClass = showAnswers && colIdx === newRedDotCol ? " hissan-div-dot-red" : "";
      // Leading zeros that disappear after normalization get slashed
      const isLostLeading = showAnswers && i < lostLeadingChars;
      const digit = parseInt(origChars[i], 10);
      dividendRowCells.push(
        <td key={i} className={`hissan-div-cell${dotClass}${redDotClass}`}>
          {i === 0 && (
            <svg className="hissan-div-bracket-curve" viewBox="0 0 10 30" preserveAspectRatio="none">
              <path d="M0,0 C10,8 10,22 0,30" stroke="#000" strokeWidth="3" fill="none" />
            </svg>
          )}
          {isLostLeading ? <span className="hissan-div-slashed-zero">{digit}</span> : digit}
        </td>
      );
    }
    // Extra zero columns appended after original dividend
    for (let i = 0; i < extraZeros; i++) {
      const colIdx = divCols + origChars.length + i;
      const redDotClass = showAnswers && colIdx === newRedDotCol ? " hissan-div-dot-red" : "";
      dividendRowCells.push(
        <td key={`z${i}`} className={`hissan-div-cell${redDotClass}`}>
          {showAnswers ? <span className="hissan-div-extra-zero">0</span> : ""}
        </td>
      );
    }
    // Extra extension digit columns (for decimal extension beyond normalization)
    for (let i = 0; i < extraDigits; i++) {
      dividendRowCells.push(<td key={`ext${i}`} className="hissan-div-cell" />);
    }
  } else {
    // No divisorDP — original rendering
    const displayStr = dividendDP > 0
      ? String(dividend).padStart(origDividendDisplayWidth, "0")
      : String(dividend);
    for (let i = 0; i < displayStr.length; i++) {
      const colIdx = divCols + i;
      dividendRowCells.push(
        <td key={i} className={cx("hissan-div-cell", [colIdx === origDotCol, "hissan-div-dot-after"])}>
          {i === 0 && (
            <svg className="hissan-div-bracket-curve" viewBox="0 0 10 30" preserveAspectRatio="none">
              <path d="M0,0 C10,8 10,22 0,30" stroke="#000" strokeWidth="3" fill="none" />
            </svg>
          )}
          {parseInt(displayStr[i], 10)}
        </td>
      );
    }
    for (let i = 0; i < extraDigits; i++) {
      dividendRowCells.push(<td key={`ext${i}`} className="hissan-div-cell" />);
    }
  }

  return (
    <div className="hissan-problem">
      <span className="hissan-number">({index + 1})</span>
      <table className="hissan-grid hissan-div-grid">
        <tbody>
          {/* Quotient row */}
          <tr className={showAnswers ? "hissan-div-answer" : ""}>
            {quotientCols.map((d, i) => (
              <td key={i} className={cx(
                "hissan-div-cell",
                [i < divCols, "hissan-div-outside"],
                [i >= divCols, "hissan-div-bracket-top-line"],
                [i >= divCols + origDividendDisplayWidth, "hissan-div-bracket-top-ext"],
                [i === divCols, "hissan-div-bracket-top-start"],
                [showAnswers && i === dotCol, "hissan-div-dot-after"],
                [cycleDotCols.has(i), "hissan-div-cycle-dot"],
              )}>
                {showAnswers ? d : ""}
              </td>
            ))}
            {showAnswers && remainder > 0 && cycleStart === undefined && (
              <td className="hissan-div-cell hissan-div-outside hissan-div-remainder">…{remainder}</td>
            )}
          </tr>
          {/* Divisor + Dividend row */}
          <tr>
            {divisorDigits.map((d, i) => {
              const isOrigDivisorDot = i === divisorDotCol;
              const dotClass = isOrigDivisorDot
                ? (showAnswers ? " hissan-div-slashed-dot" : " hissan-div-dot-after")
                : "";
              return (
                <td key={`div${i}`} className={`hissan-div-cell hissan-div-outside${dotClass}`}>{d}</td>
              );
            })}
            {dividendRowCells}
          </tr>
          {/* Work rows */}
          {workRows.map((row, ri) => (
            <tr key={ri}>
              {row.cells.map((d, i) => (
                <td key={i} className={cx(
                  "hissan-div-cell hissan-div-work-cell",
                  [i < divCols, "hissan-div-outside"],
                  [row.hasBottomBorder && i >= divCols, "hissan-div-subtract-line"],
                )}>{d}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
