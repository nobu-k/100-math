import type { Problem } from "./common";
import { toDigitCells, decimalDisplayWidth } from "./common";
import { computeMulDetails } from "./mul";
import { cx } from "./render-utils";

export const HissanMulProblem = ({
  index,
  problem,
  showAnswers,
  maxDigits,
  mulMaxDigits,
  dps,
}: {
  index: number;
  problem: Problem;
  showAnswers: boolean;
  maxDigits: number;
  mulMaxDigits: number;
  dps: number[];
}) => {
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
    const mcandDisplayWidth = decimalDisplayWidth(mcandLen, dp1);
    const mplierDisplayWidth = decimalDisplayWidth(mplierLen, dp2);
    const answerLen = String(finalAnswer).length;
    const answerDisplayWidth = decimalDisplayWidth(answerLen, dpTotal);
    const maxPartialWidth = Math.max(...partials.map(pp => String(pp.value).length + pp.shift));
    totalCols = Math.max(mcandDisplayWidth + 1, mplierDisplayWidth + 1, maxPartialWidth, answerDisplayWidth);
  } else {
    totalCols = maxDigits + mulMaxDigits;
  }

  /** Build digit cells for a number with dp decimal places.
   *  Pads with leading zeros when dp >= numDigits (e.g. 25 with dp=3 → "0.025"). */
  const toDecimalMulCells = (n: number, dp: number): (number | "")[] => {
    if (dp === 0) return toDigitCells(n, totalCols);
    const numDig = String(n).length;
    const displayWidth = decimalDisplayWidth(numDig, dp);
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
      <td key={i} className={cx("hissan-cell", [dotCol !== undefined && i === dotCol, "hissan-dot-after"])}>
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
              <td key={i} className={cx("hissan-cell", [i === mcandDotCol, "hissan-dot-after"])}>{d}</td>
            ))}
          </tr>
          {/* Multiplier row (with operator) */}
          <tr className={singleDigitMultiplier ? "hissan-operator-row" : "hissan-mul-operator-row"}>
            {mplierCells.map((d, i) => (
              <td key={i} className={cx("hissan-cell", [i === mplierDotCol, "hissan-dot-after"])}>{i === 0 ? "\u00d7" : d}</td>
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
                <tr key={pi} className={cx("hissan-answer-row", [pi === partials.length - 1, "hissan-partial-last-row"])}>
                  {renderPartialRow(pp)}
                </tr>
              ))}
              {/* Final answer */}
              <tr className="hissan-answer-row">
                {answerCells.map((d, i) => (
                  <td key={i} className={cx("hissan-cell", [showAnswers && i === answerDotCol, "hissan-dot-after"])}>
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
};
