import React, { useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { mulberry32, seedToHex } from "../random";
import { type Problem, randInt } from "./common";
import { generateDivisionProblem, divisionTerminates, divisionCycleLength } from "./div";
import { HissanDivProblem } from "./HissanDivProblem";
import { cx } from "./render-utils";
import { useHissanState } from "./useHissanState";
import "./hissan-div.css";

export interface DivConfig {
  minDigits: number;
  maxDigits: number;
  divMinDigits: number;
  divMaxDigits: number;
  divAllowRemainder: boolean;
  divAllowRepeating: boolean;
  showGrid: boolean;
  useDecimals: boolean;
}

export const PARAM_KEYS = ["q", "answers", "min", "max", "dmin", "dmax", "dr", "dre", "grid", "dec"];

export const parseConfig = (params: URLSearchParams): DivConfig => {
  let minDigits = parseInt(params.get("min") || "", 10);
  let maxDigits = parseInt(params.get("max") || "", 10);
  if (!(minDigits >= 1 && minDigits <= 4)) minDigits = 2;
  if (!(maxDigits >= 1 && maxDigits <= 4)) maxDigits = 2;
  if (minDigits < 2) minDigits = 2;
  if (maxDigits < minDigits) maxDigits = minDigits;
  let divMinDigits = parseInt(params.get("dmin") || "", 10);
  let divMaxDigits = parseInt(params.get("dmax") || "", 10);
  if (!(divMinDigits >= 1 && divMinDigits <= 2)) divMinDigits = 1;
  if (!(divMaxDigits >= 1 && divMaxDigits <= 2)) divMaxDigits = 1;
  if (divMinDigits > divMaxDigits) divMaxDigits = divMinDigits;
  const divAllowRemainder = params.get("dr") === "1";
  const divAllowRepeating = params.get("dre") === "1";
  const showGrid = params.get("grid") !== "0";
  const useDecimals = params.get("dec") === "1";
  return { minDigits, maxDigits, divMinDigits, divMaxDigits, divAllowRemainder, divAllowRepeating, showGrid, useDecimals };
};

export const buildParams = (seed: number, showAnswers: boolean, cfg: DivConfig): URLSearchParams => {
  const params = new URLSearchParams();
  params.set("q", seedToHex(seed));
  if (showAnswers) params.set("answers", "1");
  params.set("min", String(cfg.minDigits));
  params.set("max", String(cfg.maxDigits));
  params.set("dmin", String(cfg.divMinDigits));
  params.set("dmax", String(cfg.divMaxDigits));
  if (cfg.divAllowRemainder) params.set("dr", "1");
  if (cfg.divAllowRepeating) params.set("dre", "1");
  if (!cfg.showGrid) params.set("grid", "0");
  if (cfg.useDecimals) params.set("dec", "1");
  return params;
};

export interface GenerateResult {
  problems: Problem[];
  decimalPlaces: number[][];
  divExtra: { extraDigits: number; cycleStart?: number; cycleLength?: number }[];
}

export const generateProblems = (seed: number, cfg: DivConfig): GenerateResult => {
  const rng = mulberry32(seed);
  const count = 6;

  let problems: Problem[];
  let divExtra: { extraDigits: number; cycleStart?: number; cycleLength?: number }[];

  if (cfg.useDecimals) {
    const maxTotalCols = 9;
    const maxTotalSteps = 5;
    problems = [];
    divExtra = [];
    for (let i = 0; i < count; i++) {
      const r = rng();
      const threshold2 = cfg.divAllowRepeating ? 0.33 : 0.5;
      const threshold3 = cfg.divAllowRepeating ? 0.67 : 1;
      if (r < threshold2) {
        problems.push(generateDivisionProblem(rng, { ...cfg, divAllowRemainder: false }));
        divExtra.push({ extraDigits: 0 });
      } else if (r < threshold3) {
        let found = false;
        for (let attempt = 0; attempt < 50; attempt++) {
          const problem = generateDivisionProblem(rng, { ...cfg, divAllowRemainder: true });
          const [dividend, divisor] = problem;
          if (dividend % divisor !== 0) {
            const maxExtraByWidth = maxTotalCols - String(divisor).length - (String(dividend).length + 1);
            const intSteps = String(Math.floor(dividend / divisor)).length;
            const maxExtraByHeight = maxTotalSteps - intSteps;
            const maxExtra = Math.max(0, Math.min(3, maxExtraByWidth, maxExtraByHeight));
            const result = divisionTerminates(dividend, divisor, maxExtra);
            if (result.terminates) {
              problems.push(problem);
              divExtra.push({ extraDigits: result.stepsNeeded });
              found = true;
              break;
            }
          }
        }
        if (!found) {
          problems.push(generateDivisionProblem(rng, { ...cfg, divAllowRemainder: false }));
          divExtra.push({ extraDigits: 0 });
        }
      } else {
        let found = false;
        for (let attempt = 0; attempt < 50; attempt++) {
          const problem = generateDivisionProblem(rng, { ...cfg, divAllowRemainder: true });
          const [dividend, divisor] = problem;
          if (dividend % divisor === 0) continue;
          const maxExtraByWidth = maxTotalCols - String(divisor).length - (String(dividend).length + 1);
          const intSteps = String(Math.floor(dividend / divisor)).length;
          const maxExtraByHeight = maxTotalSteps - intSteps;
          const maxExtra = Math.max(0, Math.min(maxExtraByWidth, maxExtraByHeight));
          const cycle = divisionCycleLength(dividend, divisor, maxExtra);
          if (cycle && cycle.cycleStart + cycle.cycleLength <= maxExtra) {
            problems.push(problem);
            divExtra.push({
              extraDigits: cycle.cycleStart + cycle.cycleLength,
              cycleStart: cycle.cycleStart,
              cycleLength: cycle.cycleLength,
            });
            found = true;
            break;
          }
        }
        if (!found) {
          problems.push(generateDivisionProblem(rng, { ...cfg, divAllowRemainder: false }));
          divExtra.push({ extraDigits: 0 });
        }
      }
    }
  } else {
    problems = Array.from({ length: count }, () => generateDivisionProblem(rng, cfg));
    divExtra = problems.map(() => ({ extraDigits: 0 }));
  }

  let decimalPlaces: number[][];
  if (cfg.useDecimals) {
    decimalPlaces = problems.map((problem, i) => {
      const [dividend, divisor] = problem;
      const numDigits = String(dividend).length;
      let dp: number;
      if (dividend % 10 === 0) {
        dp = 1;
      } else if (numDigits === 1) {
        dp = 1;
      } else {
        dp = rng() < 0.2 ? numDigits : randInt(rng, 1, numDigits - 1);
      }

      let divisorDP = 0;
      if (rng() < 0.5 && divisor % 10 !== 0) {
        const divLen = String(divisor).length;
        let candidateDP: number;
        if (divLen === 1) {
          candidateDP = 1;
        } else {
          candidateDP = rng() < 0.2 ? divLen : randInt(rng, 1, divLen - 1);
        }

        const extraZeros = Math.max(0, candidateDP - dp);
        const origDisplayWidth = dp > 0 ? Math.max(numDigits, dp + 1) : numDigits;
        const dividendAreaWidth = origDisplayWidth + extraZeros;
        const extraDig = divExtra[i].extraDigits;
        const divisorDisplayWidth = candidateDP > 0 ? Math.max(divLen, candidateDP + 1) : divLen;
        if (divisorDisplayWidth + dividendAreaWidth + extraDig <= 9) {
          divisorDP = candidateDP;
        }
      }

      return [dp, divisorDP];
    });
  } else {
    decimalPlaces = problems.map((problem) => problem.map(() => 0));
  }

  return { problems, decimalPlaces, divExtra };
};

const handleConfigChange = (
  field: keyof DivConfig,
  e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  prev: DivConfig,
): DivConfig => {
  const raw = e.target.value;
  const value = e.target instanceof HTMLInputElement && e.target.type === "checkbox"
    ? e.target.checked
    : isNaN(parseInt(raw, 10)) ? raw : parseInt(raw, 10);
  const next = { ...prev, [field]: value };
  if (field === "useDecimals" && !next.useDecimals) next.divAllowRepeating = false;
  if (next.useDecimals) next.divAllowRemainder = false;
  if (next.minDigits < 2) next.minDigits = 2;
  if (next.maxDigits < next.minDigits) next.maxDigits = next.minDigits;
  if (field === "minDigits" && next.minDigits > next.maxDigits) next.maxDigits = next.minDigits;
  if (field === "maxDigits" && next.maxDigits < next.minDigits) next.minDigits = next.maxDigits;
  if (field === "divMinDigits" && next.divMinDigits > next.divMaxDigits) next.divMaxDigits = next.divMinDigits;
  if (field === "divMaxDigits" && next.divMaxDigits < next.divMinDigits) next.divMinDigits = next.divMaxDigits;
  return next;
};

const Division = () => {
  const { seed, showAnswers, cfg, setCfg, showSettings, setShowSettings, handleNewProblems, handleToggleAnswers, handleToggleGrid, qrUrl, resetWithConfig } =
    useHissanState<DivConfig>({ parseConfig, buildParams, paramKeys: PARAM_KEYS });

  const { problems, decimalPlaces, divExtra } = useMemo(() => generateProblems(seed, cfg), [seed, cfg]);

  const onChange = useCallback(
    (field: keyof DivConfig) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
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
            割られる数 最小{" "}
            <select className="operator-select" value={cfg.minDigits} onChange={onChange("minDigits")}>
              {[2, 3, 4].map((d) => <option key={d} value={d}>{d} 桁</option>)}
            </select>
          </label>
          <label>
            最大{" "}
            <select className="operator-select" value={cfg.maxDigits} onChange={onChange("maxDigits")}>
              {[2, 3, 4].map((d) => <option key={d} value={d}>{d} 桁</option>)}
            </select>
          </label>
          <label>
            わる数 最小{" "}
            <select className="operator-select" value={cfg.divMinDigits} onChange={onChange("divMinDigits")}>
              {[1, 2].map((d) => <option key={d} value={d}>{d} 桁</option>)}
            </select>
          </label>
          <label>
            最大{" "}
            <select className="operator-select" value={cfg.divMaxDigits} onChange={onChange("divMaxDigits")}>
              {[1, 2].map((d) => <option key={d} value={d}>{d} 桁</option>)}
            </select>
          </label>
          {!cfg.useDecimals && (
            <label>
              <input type="checkbox" checked={cfg.divAllowRemainder} onChange={onChange("divAllowRemainder")} />
              あまりあり
            </label>
          )}
          {cfg.useDecimals && (
            <label>
              <input type="checkbox" checked={cfg.divAllowRepeating} onChange={onChange("divAllowRepeating")} />
              循環小数
            </label>
          )}
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
        [!cfg.useDecimals, "hissan-div-page"],
        [cfg.useDecimals, "hissan-dec-wide"],
      )}>
        {problems.map((problem, i) => (
          <HissanDivProblem
            key={i}
            index={i}
            problem={problem}
            showAnswers={showAnswers}
            dps={decimalPlaces[i]}
            extraDigits={divExtra[i]?.extraDigits}
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

export default Division;
