import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { randomSeed } from "../random";
import { generateProblem, getInitialSeed, updateUrl, buildQrUrl } from "./generate";
import "../../App.css";

export const Grid100 = ({
  symbol,
  colHeader,
  compute,
}: {
  symbol: string;
  colHeader: (num: number) => number;
  compute: (rowNum: number, colNum: number) => number;
}) => {
  const [seed, setSeed] = useState(getInitialSeed);
  const [showAnswers, setShowAnswers] = useState(() => {
    return new URLSearchParams(window.location.search).get("answers") === "1";
  });

  const problem = useMemo(() => generateProblem(seed), [seed]);

  const handleNewProblem = useCallback(() => {
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

  const { rowHeaders, colHeaders } = problem;

  const qrUrl = useMemo(() => buildQrUrl(seed), [seed]);

  return (
    <>
      <div className="no-print controls">
        <button onClick={handleNewProblem}>新しい問題</button>
        <button onClick={handleToggleAnswers}>
          {showAnswers ? "答えを隠す" : "答え"}
        </button>
      </div>
      <table className="grid">
        <thead>
          <tr>
            <th className="corner-cell">{symbol}</th>
            {colHeaders.map((num, i) => (
              <th key={i} className="header-cell">
                {colHeader(num)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowHeaders.map((rowNum, ri) => (
            <tr key={ri}>
              <th className="header-cell">{rowNum}</th>
              {colHeaders.map((colNum, ci) => (
                <td key={ci} className="answer-cell">
                  {showAnswers ? compute(rowNum, colNum) : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="qr-section">
        <QRCodeSVG value={qrUrl} size={80} />
        <span className="qr-label">答え</span>
      </div>
    </>
  );
};
