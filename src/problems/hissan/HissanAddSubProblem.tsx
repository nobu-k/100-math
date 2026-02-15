import React from "react";
import type { Problem, HissanOperator } from "./common";
import { toDigitCells, toDecimalDigitCells, computeIndicators } from "./common";
import { cx } from "./render-utils";

export function HissanAddSubProblem({
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
  const isSub = operator === "sub";
  const operatorSymbol = isSub ? "\u2212" : "+";
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
    const answer = isSub
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
                        <td key={i} className={cx("hissan-cell", [i === totalIntCols - 1 && showDot, "hissan-dot-after"], [slashed, "hissan-slashed"])}>
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
                        <td key={`d${i}`} className={cx("hissan-cell", [slashed, "hissan-slashed"])}>
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
                    <td key={i} className={cx("hissan-cell", [i === totalIntCols - 2 && showDot, "hissan-dot-after"])}>{d}</td>
                  ))}
                  {decPart.map((d, i) => (
                    <td key={`d${i}`} className="hissan-cell">{d}</td>
                  ))}
                </tr>
              );
            })}
            <tr className="hissan-answer-row">
              {trimmedAnswer.slice(0, totalIntCols).map((d, i) => (
                <td key={i} className={cx("hissan-cell", [i === totalIntCols - 1 && showAnswers && hasDecDigits(trimmedAnswer), "hissan-dot-after"])}>{showAnswers ? d : ""}</td>
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

  // Integer rendering path
  const answer = isSub
    ? problem[0] - problem.slice(1).reduce((a, b) => a + b, 0)
    : problem.reduce((a, b) => a + b, 0);

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
                  ? (isSub ? borrowDisplay[i] : c)
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
                    <td key={i} className={cx(
                      "hissan-cell",
                      [showAnswers && isSub && ri === 0 && indicators[i] > 0, "hissan-slashed"],
                      [showAnswers && isSub && ri === 0 && borrowOut[i] > 0 && indicators[i] === 0, "hissan-borrow-in"],
                    )}>{d}</td>
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
