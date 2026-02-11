import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { ProblemTypeDefinition } from "./types";
import { randomSeed, seedToHex, hexToSeed } from "./random";
import {
  type Problem,
  type HissanOperator,
  type HissanConfig,
  generateProblems,
  parseConfig,
  buildParams,
  toDigitCells,
  computeIndicators,
} from "./hissan-logic";
import "../App.css";

const updateUrl = (seed: number, showAnswers: boolean, cfg: HissanConfig) => {
  const url = new URL(window.location.href);
  const params = buildParams(seed, showAnswers, cfg);
  // Replace all hissan-related params on the existing URL
  for (const key of ["hq", "answers", "hmin", "hmax", "hops", "hcc", "hgrid", "hop"]) {
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
