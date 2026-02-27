import React, { useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { mulberry32, seedToHex } from "../random";
import { type Problem, randInt } from "./common";
import { generateSubtractionProblem, generateBorrowChainProblem } from "./sub";
import { HissanAddSubProblem } from "./HissanAddSubProblem";
import { cx } from "./render-utils";
import { useHissanState } from "./useHissanState";
import "./hissan.css";

export interface SubConfig {
  minDigits: number;
  maxDigits: number;
  consecutiveCarries: boolean;
  showGrid: boolean;
  useDecimals: boolean;
}

export const PARAM_KEYS = ["q", "answers", "min", "max", "cc", "grid", "dec"];

export const parseConfig = (params: URLSearchParams): SubConfig => {
  let minDigits = parseInt(params.get("min") || "", 10);
  let maxDigits = parseInt(params.get("max") || "", 10);
  if (!(minDigits >= 1 && minDigits <= 4)) minDigits = 1;
  if (!(maxDigits >= 1 && maxDigits <= 4)) maxDigits = 2;
  if (minDigits > maxDigits) maxDigits = minDigits;
  const consecutiveCarries = params.get("cc") === "1";
  const showGrid = params.get("grid") !== "0";
  const useDecimals = params.get("dec") === "1";
  return { minDigits, maxDigits, consecutiveCarries, showGrid, useDecimals };
};

export const buildParams = (seed: number, showAnswers: boolean, cfg: SubConfig): URLSearchParams => {
  const params = new URLSearchParams();
  params.set("q", seedToHex(seed));
  if (showAnswers) params.set("answers", "1");
  params.set("min", String(cfg.minDigits));
  params.set("max", String(cfg.maxDigits));
  if (cfg.consecutiveCarries) params.set("cc", "1");
  if (!cfg.showGrid) params.set("grid", "0");
  if (cfg.useDecimals) params.set("dec", "1");
  return params;
};

export interface GenerateResult {
  problems: Problem[];
  decimalPlaces: number[][];
}

export const generateProblems = (seed: number, cfg: SubConfig): GenerateResult => {
  const rng = mulberry32(seed);
  const count = cfg.useDecimals ? 8 : 12;
  const subCfg = { ...cfg, numOperands: 2 };

  const problems = Array.from({ length: count }, () => {
    if (cfg.consecutiveCarries) return generateBorrowChainProblem(rng, subCfg);
    return generateSubtractionProblem(rng, subCfg);
  });

  let decimalPlaces: number[][];
  if (cfg.useDecimals) {
    decimalPlaces = problems.map((problem) => {
      const dps = problem.map((op) => {
        const numDigits = String(op).length;
        const opMinDP = Math.max(1, numDigits - 2);
        const opMaxDP = numDigits;
        if (opMinDP === opMaxDP) return opMinDP;
        const r = rng();
        if (r < 0.2) return opMaxDP;
        return randInt(rng, opMinDP, opMaxDP - 1);
      });
      // Ensure minuend dp <= subtrahend dp for non-negative decimal answer
      if (dps[0] > dps[1]) {
        [dps[0], dps[1]] = [dps[1], dps[0]];
      }
      return dps;
    });
  } else {
    decimalPlaces = problems.map((problem) => problem.map(() => 0));
  }

  return { problems, decimalPlaces };
};

const handleConfigChange = (
  field: keyof SubConfig,
  e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  prev: SubConfig,
): SubConfig => {
  const raw = e.target.value;
  const value = e.target instanceof HTMLInputElement && e.target.type === "checkbox"
    ? e.target.checked
    : isNaN(parseInt(raw, 10)) ? raw : parseInt(raw, 10);
  const next = { ...prev, [field]: value };
  if (field === "useDecimals" && next.useDecimals) next.consecutiveCarries = false;
  if (field === "minDigits" && next.minDigits > next.maxDigits) next.maxDigits = next.minDigits;
  if (field === "maxDigits" && next.maxDigits < next.minDigits) next.minDigits = next.maxDigits;
  return next;
};

const Subtraction = () => {
  const { seed, showAnswers, cfg, setCfg, showSettings, setShowSettings, handleNewProblems, handleToggleAnswers, handleToggleGrid, qrUrl, resetWithConfig } =
    useHissanState<SubConfig>({ parseConfig, buildParams, paramKeys: PARAM_KEYS });

  const { problems, decimalPlaces } = useMemo(() => generateProblems(seed, cfg), [seed, cfg]);

  const onChange = useCallback(
    (field: keyof SubConfig) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      setCfg((prev) => {
        const next = handleConfigChange(field, e, prev);
        resetWithConfig(next);
        return next;
      });
    },
    [setCfg, resetWithConfig],
  );

  const onToggleGrid = useCallback(() => {
    handleToggleGrid((c) => c.showGrid, (c, v) => ({ ...c, showGrid: v }));
  }, [handleToggleGrid]);

  return (
    <>
      <div className="no-print controls">
        <button onClick={handleNewProblems}>新しい問題</button>
        <button onClick={handleToggleAnswers}>{showAnswers ? "答えを隠す" : "答え"}</button>
        <button onClick={() => setShowSettings((prev) => !prev)}>設定</button>
      </div>
      {showSettings && (
        <div className="no-print settings-panel">
          <label>
            桁数 最小{" "}
            <select className="operator-select" value={cfg.minDigits} onChange={onChange("minDigits")}>
              {[1, 2, 3, 4].map((d) => <option key={d} value={d}>{d} 桁</option>)}
            </select>
          </label>
          <label>
            最大{" "}
            <select className="operator-select" value={cfg.maxDigits} onChange={onChange("maxDigits")}>
              {[1, 2, 3, 4].map((d) => <option key={d} value={d}>{d} 桁</option>)}
            </select>
          </label>
          <label>
            <input type="checkbox" checked={cfg.useDecimals} onChange={onChange("useDecimals")} />
            小数
          </label>
          {!cfg.useDecimals && (
            <label>
              <input type="checkbox" checked={cfg.consecutiveCarries} onChange={onChange("consecutiveCarries")} />
              連続繰り下がり
            </label>
          )}
          <label>
            <input type="checkbox" checked={cfg.showGrid} onChange={onToggleGrid} />
            補助グリッド
          </label>
        </div>
      )}
      <div className={cx(
        "hissan-page",
        [!cfg.showGrid, "hissan-no-grid"],
        [showAnswers, "hissan-show-answers"],
        [cfg.useDecimals, "hissan-dec-wide"],
      )}>
        {problems.map((problem, i) => (
          <HissanAddSubProblem
            key={i}
            index={i}
            problem={problem}
            showAnswers={showAnswers}
            maxDigits={cfg.maxDigits}
            operator="sub"
            dps={decimalPlaces[i]}
          />
        ))}
      </div>
      <div className="qr-section">
        <QRCodeSVG value={qrUrl} size={80} />
        <span className="qr-label">答え</span>
      </div>
    </>
  );
};

export default Subtraction;
