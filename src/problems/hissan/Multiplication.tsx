import React, { useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { mulberry32, seedToHex } from "../random";
import { type Problem, randInt } from "./common";
import { generateMultiplicationProblem } from "./mul";
import { HissanMulProblem } from "./HissanMulProblem";
import { cx } from "./render-utils";
import { useHissanState } from "./useHissanState";
import "../../App.css";

export interface MulConfig {
  minDigits: number;
  maxDigits: number;
  mulMinDigits: number;
  mulMaxDigits: number;
  showGrid: boolean;
  useDecimals: boolean;
}

export const PARAM_KEYS = ["q", "answers", "min", "max", "mmin", "mmax", "grid", "dec"];

export const parseConfig = (params: URLSearchParams): MulConfig => {
  let minDigits = parseInt(params.get("min") || "", 10);
  let maxDigits = parseInt(params.get("max") || "", 10);
  if (!(minDigits >= 1 && minDigits <= 3)) minDigits = 1;
  if (!(maxDigits >= 1 && maxDigits <= 3)) maxDigits = 2;
  if (maxDigits > 3) maxDigits = 3;
  if (minDigits > maxDigits) maxDigits = minDigits;
  let mulMinDigits = parseInt(params.get("mmin") || "", 10);
  let mulMaxDigits = parseInt(params.get("mmax") || "", 10);
  if (!(mulMinDigits >= 1 && mulMinDigits <= 3)) mulMinDigits = 1;
  if (!(mulMaxDigits >= 1 && mulMaxDigits <= 3)) mulMaxDigits = 1;
  if (mulMinDigits > mulMaxDigits) mulMaxDigits = mulMinDigits;
  const showGrid = params.get("grid") !== "0";
  const useDecimals = params.get("dec") === "1";
  return { minDigits, maxDigits, mulMinDigits, mulMaxDigits, showGrid, useDecimals };
};

export const buildParams = (seed: number, showAnswers: boolean, cfg: MulConfig): URLSearchParams => {
  const params = new URLSearchParams();
  params.set("q", seedToHex(seed));
  if (showAnswers) params.set("answers", "1");
  params.set("min", String(cfg.minDigits));
  params.set("max", String(cfg.maxDigits));
  params.set("mmin", String(cfg.mulMinDigits));
  params.set("mmax", String(cfg.mulMaxDigits));
  if (!cfg.showGrid) params.set("grid", "0");
  if (cfg.useDecimals) params.set("dec", "1");
  return params;
};

export interface GenerateResult {
  problems: Problem[];
  decimalPlaces: number[][];
}

export const generateProblems = (seed: number, cfg: MulConfig): GenerateResult => {
  const rng = mulberry32(seed);
  const count = (cfg.mulMaxDigits >= 2 || cfg.useDecimals) ? 6 : 12;

  const problems = Array.from({ length: count }, () => generateMultiplicationProblem(rng, cfg));

  let decimalPlaces: number[][];
  if (cfg.useDecimals) {
    const pickDp = (n: number, forceNonZero: boolean): number => {
      if (n % 10 === 0) return 0;
      const numDigits = String(n).length;
      if (numDigits === 1) {
        if (forceNonZero) return 1;
        return rng() < 0.5 ? 0 : 1;
      }
      if (forceNonZero) {
        return rng() < 0.2 ? numDigits : randInt(rng, 1, numDigits - 1);
      }
      const r = rng();
      if (r < 0.2) return 0;
      if (r < 0.35) return numDigits;
      return randInt(rng, 1, numDigits - 1);
    };

    decimalPlaces = problems.map((problem) => {
      const [multiplicand, multiplier] = problem;
      let dp1 = pickDp(multiplicand, false);
      let dp2 = pickDp(multiplier, false);
      if (dp1 === 0 && dp2 === 0) {
        if (rng() < 0.5) {
          dp1 = pickDp(multiplicand, true);
          if (dp1 === 0) dp2 = pickDp(multiplier, true);
        } else {
          dp2 = pickDp(multiplier, true);
          if (dp2 === 0) dp1 = pickDp(multiplicand, true);
        }
      }
      return [dp1, dp2];
    });
  } else {
    decimalPlaces = problems.map((problem) => problem.map(() => 0));
  }

  return { problems, decimalPlaces };
};

const handleConfigChange = (
  field: keyof MulConfig,
  e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  prev: MulConfig,
): MulConfig => {
  const raw = e.target.value;
  const value = e.target instanceof HTMLInputElement && e.target.type === "checkbox"
    ? e.target.checked
    : isNaN(parseInt(raw, 10)) ? raw : parseInt(raw, 10);
  const next = { ...prev, [field]: value };
  if (next.maxDigits > 3) next.maxDigits = 3;
  if (next.minDigits > next.maxDigits) next.minDigits = next.maxDigits;
  if (field === "minDigits" && next.minDigits > next.maxDigits) next.maxDigits = next.minDigits;
  if (field === "maxDigits" && next.maxDigits < next.minDigits) next.minDigits = next.maxDigits;
  if (field === "mulMinDigits" && next.mulMinDigits > next.mulMaxDigits) next.mulMaxDigits = next.mulMinDigits;
  if (field === "mulMaxDigits" && next.mulMaxDigits < next.mulMinDigits) next.mulMinDigits = next.mulMaxDigits;
  return next;
};

const Multiplication = () => {
  const { seed, showAnswers, cfg, setCfg, showSettings, setShowSettings, handleNewProblems, handleToggleAnswers, handleToggleGrid, qrUrl, resetWithConfig } =
    useHissanState<MulConfig>({ parseConfig, buildParams, paramKeys: PARAM_KEYS });

  const { problems, decimalPlaces } = useMemo(() => generateProblems(seed, cfg), [seed, cfg]);

  const onChange = useCallback(
    (field: keyof MulConfig) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
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
            かけられる数 最小{" "}
            <select className="operator-select" value={cfg.minDigits} onChange={onChange("minDigits")}>
              {[1, 2, 3].map((d) => <option key={d} value={d}>{d} 桁</option>)}
            </select>
          </label>
          <label>
            最大{" "}
            <select className="operator-select" value={cfg.maxDigits} onChange={onChange("maxDigits")}>
              {[1, 2, 3].map((d) => <option key={d} value={d}>{d} 桁</option>)}
            </select>
          </label>
          <label>
            かける数 最小{" "}
            <select className="operator-select" value={cfg.mulMinDigits} onChange={onChange("mulMinDigits")}>
              {[1, 2, 3].map((d) => <option key={d} value={d}>{d} 桁</option>)}
            </select>
          </label>
          <label>
            最大{" "}
            <select className="operator-select" value={cfg.mulMaxDigits} onChange={onChange("mulMaxDigits")}>
              {[1, 2, 3].map((d) => <option key={d} value={d}>{d} 桁</option>)}
            </select>
          </label>
          <label>
            <input type="checkbox" checked={cfg.useDecimals} onChange={onChange("useDecimals")} />
            小数
          </label>
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
        [cfg.mulMaxDigits >= 2 || cfg.useDecimals, "hissan-mul-wide"],
        [cfg.useDecimals, "hissan-dec-wide"],
      )}>
        {problems.map((problem, i) => (
          <HissanMulProblem
            key={i}
            index={i}
            problem={problem}
            showAnswers={showAnswers}
            maxDigits={cfg.maxDigits}
            mulMaxDigits={cfg.mulMaxDigits}
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

export default Multiplication;
