import React, { useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { mulberry32, seedToHex } from "../random";
import { type Problem, generateNumber, randInt } from "./common";
import { generateCarryChainProblem } from "./add";
import { HissanAddSubProblem } from "./HissanAddSubProblem";
import { cx } from "./render-utils";
import { useHissanState } from "./useHissanState";
import "../../App.css";

export interface AddConfig {
  minDigits: number;
  maxDigits: number;
  addMinDigits: number;
  addMaxDigits: number;
  numOperands: number;
  consecutiveCarries: boolean;
  showGrid: boolean;
  useDecimals: boolean;
}

export const PARAM_KEYS = ["q", "answers", "min", "max", "amin", "amax", "ops", "cc", "grid", "dec"];

export const parseConfig = (params: URLSearchParams): AddConfig => {
  let minDigits = parseInt(params.get("min") || "", 10);
  let maxDigits = parseInt(params.get("max") || "", 10);
  let numOperands = parseInt(params.get("ops") || "", 10);
  if (!(minDigits >= 1 && minDigits <= 4)) minDigits = 1;
  if (!(maxDigits >= 1 && maxDigits <= 4)) maxDigits = 2;
  if (minDigits > maxDigits) maxDigits = minDigits;
  if (!(numOperands >= 2 && numOperands <= 3)) numOperands = 2;
  let addMinDigits = parseInt(params.get("amin") || "", 10);
  let addMaxDigits = parseInt(params.get("amax") || "", 10);
  if (!(addMinDigits >= 1 && addMinDigits <= 4)) addMinDigits = minDigits;
  if (!(addMaxDigits >= 1 && addMaxDigits <= 4)) addMaxDigits = maxDigits;
  if (addMinDigits > addMaxDigits) addMaxDigits = addMinDigits;
  const consecutiveCarries = params.get("cc") === "1";
  const showGrid = params.get("grid") !== "0";
  const useDecimals = params.get("dec") === "1";
  return { minDigits, maxDigits, addMinDigits, addMaxDigits, numOperands, consecutiveCarries, showGrid, useDecimals };
};

export const buildParams = (seed: number, showAnswers: boolean, cfg: AddConfig): URLSearchParams => {
  const params = new URLSearchParams();
  params.set("q", seedToHex(seed));
  if (showAnswers) params.set("answers", "1");
  params.set("min", String(cfg.minDigits));
  params.set("max", String(cfg.maxDigits));
  params.set("ops", String(cfg.numOperands));
  params.set("amin", String(cfg.addMinDigits));
  params.set("amax", String(cfg.addMaxDigits));
  if (cfg.consecutiveCarries) params.set("cc", "1");
  if (!cfg.showGrid) params.set("grid", "0");
  if (cfg.useDecimals) params.set("dec", "1");
  return params;
};

export interface GenerateResult {
  problems: Problem[];
  decimalPlaces: number[][];
}

export const generateProblems = (seed: number, cfg: AddConfig): GenerateResult => {
  const rng = mulberry32(seed);
  const count = cfg.useDecimals ? 8 : 12;

  const problems = Array.from({ length: count }, () => {
    if (cfg.consecutiveCarries) return generateCarryChainProblem(rng, cfg);
    return Array.from({ length: cfg.numOperands }, (_, i) =>
      generateNumber(rng, i === 0 ? cfg.minDigits : cfg.addMinDigits, i === 0 ? cfg.maxDigits : cfg.addMaxDigits),
    );
  });

  let decimalPlaces: number[][];
  if (cfg.useDecimals) {
    decimalPlaces = problems.map((problem) => {
      return problem.map((op) => {
        const numDigits = String(op).length;
        const opMinDP = Math.max(1, numDigits - 2);
        const opMaxDP = numDigits;
        if (opMinDP === opMaxDP) return opMinDP;
        const r = rng();
        if (r < 0.2) return opMaxDP;
        return randInt(rng, opMinDP, opMaxDP - 1);
      });
    });
  } else {
    decimalPlaces = problems.map((problem) => problem.map(() => 0));
  }

  return { problems, decimalPlaces };
};

const handleConfigChange = (
  field: keyof AddConfig,
  e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  prev: AddConfig,
): AddConfig => {
  const raw = e.target.value;
  const value = e.target instanceof HTMLInputElement && e.target.type === "checkbox"
    ? e.target.checked
    : isNaN(parseInt(raw, 10)) ? raw : parseInt(raw, 10);
  const next = { ...prev, [field]: value };
  if (field === "useDecimals" && next.useDecimals) next.consecutiveCarries = false;
  if (field === "minDigits" && next.minDigits > next.maxDigits) next.maxDigits = next.minDigits;
  if (field === "maxDigits" && next.maxDigits < next.minDigits) next.minDigits = next.maxDigits;
  if (field === "addMinDigits" && next.addMinDigits > next.addMaxDigits) next.addMaxDigits = next.addMinDigits;
  if (field === "addMaxDigits" && next.addMaxDigits < next.addMinDigits) next.addMinDigits = next.addMaxDigits;
  return next;
};

const Addition = () => {
  const { seed, showAnswers, cfg, setCfg, showSettings, setShowSettings, handleNewProblems, handleToggleAnswers, handleToggleGrid, qrUrl, resetWithConfig } =
    useHissanState<AddConfig>({ parseConfig, buildParams, paramKeys: PARAM_KEYS });

  const { problems, decimalPlaces } = useMemo(() => generateProblems(seed, cfg), [seed, cfg]);

  const onChange = useCallback(
    (field: keyof AddConfig) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
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
            被加数 最小{" "}
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
          <div style={{ flexBasis: "100%" }} />
          <label>
            加数 最小{" "}
            <select className="operator-select" value={cfg.addMinDigits} onChange={onChange("addMinDigits")}>
              {[1, 2, 3, 4].map((d) => <option key={d} value={d}>{d} 桁</option>)}
            </select>
          </label>
          <label>
            最大{" "}
            <select className="operator-select" value={cfg.addMaxDigits} onChange={onChange("addMaxDigits")}>
              {[1, 2, 3, 4].map((d) => <option key={d} value={d}>{d} 桁</option>)}
            </select>
          </label>
          <label>
            項数{" "}
            <select className="operator-select" value={cfg.numOperands} onChange={onChange("numOperands")}>
              {[2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label>
            <input type="checkbox" checked={cfg.useDecimals} onChange={onChange("useDecimals")} />
            小数
          </label>
          {!cfg.useDecimals && (
            <label>
              <input type="checkbox" checked={cfg.consecutiveCarries} onChange={onChange("consecutiveCarries")} />
              連続繰り上がり
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
            maxDigits={Math.max(cfg.maxDigits, cfg.addMaxDigits)}
            operator="add"
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

export default Addition;
