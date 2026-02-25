import React, { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { randomSeed, hexToSeed } from "../random";
import {
  type HissanConfig,
  type HissanOperator,
  generateProblems,
  parseConfig,
  buildParams,
} from "./index";
import { HissanAddSubProblem } from "./HissanAddSubProblem";
import { HissanMulProblem } from "./HissanMulProblem";
import { HissanDivProblem } from "./HissanDivProblem";
import { cx } from "./render-utils";
import "../../App.css";

const operatorFromPath = (path: string): HissanOperator => {
  if (path === "subtraction") return "sub";
  if (path === "multiplication") return "mul";
  if (path === "division") return "div";
  return "add";
};

const PARAM_KEYS = ["q", "answers", "min", "max", "amin", "amax", "ops", "cc", "grid", "mmin", "mmax", "dmin", "dmax", "dr", "dre", "dec"];

const updateUrl = (seed: number, showAnswers: boolean, cfg: HissanConfig) => {
  const url = new URL(window.location.href);
  const params = buildParams(seed, showAnswers, cfg);
  for (const key of PARAM_KEYS) {
    url.searchParams.delete(key);
  }
  for (const [key, value] of params) {
    url.searchParams.set(key, value);
  }
  window.history.replaceState(null, "", url.toString());
};

export const Hissan = ({ operator: operatorPath }: { operator: string }) => {
  const hissanOperator = operatorFromPath(operatorPath);

  const getInitialConfig = (): HissanConfig => {
    return parseConfig(new URLSearchParams(window.location.search), hissanOperator);
  };

  const getInitialSeed = (): number => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      const parsed = hexToSeed(q);
      if (parsed !== null) return parsed;
    }
    const seed = randomSeed();
    updateUrl(seed, false, getInitialConfig());
    return seed;
  };

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
        if (field === "useDecimals" && next.useDecimals)
          next.consecutiveCarries = false;
        if (field === "useDecimals" && !next.useDecimals)
          next.divAllowRepeating = false;
        if (next.operator === "div" && next.useDecimals)
          next.divAllowRemainder = false;
        if (next.operator === "mul") {
          if (next.maxDigits > 3) next.maxDigits = 3;
          if (next.minDigits > next.maxDigits) next.minDigits = next.maxDigits;
        }
        if (next.operator === "div") {
          if (next.minDigits < 2) next.minDigits = 2;
          if (next.maxDigits < next.minDigits) next.maxDigits = next.minDigits;
        }
        if (field === "minDigits" && next.minDigits > next.maxDigits)
          next.maxDigits = next.minDigits;
        if (field === "maxDigits" && next.maxDigits < next.minDigits)
          next.minDigits = next.maxDigits;
        if (field === "addMinDigits" && next.addMinDigits > next.addMaxDigits)
          next.addMaxDigits = next.addMinDigits;
        if (field === "addMaxDigits" && next.addMaxDigits < next.addMinDigits)
          next.addMinDigits = next.addMaxDigits;
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
    for (const key of PARAM_KEYS) {
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
            {cfg.operator === "mul" ? "かけられる数" : cfg.operator === "div" ? "割られる数" : cfg.operator === "add" ? "被加数" : "桁数"} 最小{" "}
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
          {cfg.operator === "add" && <div style={{ flexBasis: "100%" }} />}
          {cfg.operator === "add" && (
            <>
              <label>
                加数 最小{" "}
                <select className="operator-select" value={cfg.addMinDigits} onChange={handleConfigChange("addMinDigits")}>
                  {[1, 2, 3, 4].map((d) => <option key={d} value={d}>{d} 桁</option>)}
                </select>
              </label>
              <label>
                最大{" "}
                <select className="operator-select" value={cfg.addMaxDigits} onChange={handleConfigChange("addMaxDigits")}>
                  {[1, 2, 3, 4].map((d) => <option key={d} value={d}>{d} 桁</option>)}
                </select>
              </label>
            </>
          )}
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
      <div className={cx(
        "hissan-page",
        [!cfg.showGrid, "hissan-no-grid"],
        [showAnswers, "hissan-show-answers"],
        [cfg.operator === "mul" && (cfg.mulMaxDigits >= 2 || cfg.useDecimals), "hissan-mul-wide"],
        [cfg.operator === "div" && !cfg.useDecimals, "hissan-div-page"],
        [cfg.useDecimals, "hissan-dec-wide"],
      )}>
        {problems.map((problem, i) =>
          cfg.operator === "div" ? (
            <HissanDivProblem
              key={i}
              index={i}
              problem={problem}
              showAnswers={showAnswers}
              dps={decimalPlaces[i]}
              extraDigits={divExtra?.[i]?.extraDigits}
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
            <HissanAddSubProblem
              key={i}
              index={i}
              problem={problem}
              showAnswers={showAnswers}
              maxDigits={Math.max(cfg.maxDigits, cfg.addMaxDigits)}
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
};
