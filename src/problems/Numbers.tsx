import { useState, useCallback, useMemo } from "react";
import type { ProblemGroup } from "./types";
import type { TextProblem } from "./shared/types";
import { Box } from "./shared/Box";
import useProblemPage from "./shared/useProblemPage";
import ProblemPageLayout from "./shared/ProblemPageLayout";
import { generateDecomposition } from "./numbers/decomposition";
import { generateComparison } from "./numbers/comparison";
import { generateSequence } from "./numbers/sequence";
import { generateLargeNum } from "./numbers/large-num";
import { generateLargeNum3 } from "./numbers/large-num3";
import { generateLargeNum4 } from "./numbers/large-num4";
import { generateRounding } from "./numbers/rounding";
import { generateDecimalPlace } from "./numbers/decimal-place";
import { generateEvenOdd } from "./numbers/even-odd";
import { type AbsoluteValueMode, generateAbsoluteValue } from "./numbers/absolute-value";
import { type PrimeMode, generatePrime } from "./numbers/prime";
import { type SqrtMode, generateSqrt } from "./numbers/square-root";
import "../App.css";

/* ================================================================
   Types
   ================================================================ */

type NumbersOp =
  | "decomposition"
  | "comparison"
  | "sequence"
  | "large-num"
  | "large-num3"
  | "large-num4"
  | "rounding"
  | "decimal-place"
  | "even-odd"
  | "absolute-value"
  | "prime"
  | "square-root";

/* ================================================================
   Defaults
   ================================================================ */

const DECOMP_DEF = { target: 10 };
const COMP_DEF = { max: 20 };
const SEQ_DEF = { step: 2, smax: 20 };
const LARGE_DEF = { range: 1000 };
const LARGE3_DEF = { ln3mode: "mixed" as const };
const LARGE4_DEF = { ln4mode: "mixed" as const };
const ROUND_DEF = { rd: 3 };
const DPMODE_DEF = { dpmode: "mixed" as const };
const EO_DEF = { eorange: 100 };
const ABS_DEF = { absmode: "find" as AbsoluteValueMode };
const PRIME_DEF = { prmode: "identify" as PrimeMode };
const SQRT_DEF = { sqmode: "mixed" as SqrtMode };

/* ================================================================
   URL param keys
   ================================================================ */

const PARAM_KEYS = [
  "target", "max", "step", "smax", "range",
  "ln3mode", "ln4mode", "rd", "dpmode", "eorange",
  "absmode", "prmode", "sqmode",
];

/* ================================================================
   Main component
   ================================================================ */

const Numbers = ({ operator }: { operator: string }) => {
  const op = operator as NumbersOp;

  // ---- read initial URL settings ----
  const [initialSettings] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const pi = (key: string, def: number, min: number, max: number) => {
      const v = parseInt(p.get(key) ?? String(def), 10) || def;
      return Math.max(min, Math.min(max, v));
    };
    const ps = <T extends string>(key: string, def: T, valid: readonly T[]): T => {
      const raw = p.get(key) ?? def;
      return valid.includes(raw as T) ? (raw as T) : def;
    };
    return {
      target: pi("target", DECOMP_DEF.target, 2, 20),
      max: pi("max", COMP_DEF.max, 5, 100),
      step: pi("step", SEQ_DEF.step, 1, 10),
      smax: pi("smax", SEQ_DEF.smax, 10, 100),
      range: pi("range", LARGE_DEF.range, 100, 10000),
      ln3mode: ps("ln3mode", LARGE3_DEF.ln3mode, ["read", "count", "multiply", "mixed"] as const),
      ln4mode: ps("ln4mode", LARGE4_DEF.ln4mode, ["read", "position", "mixed"] as const),
      rd: pi("rd", ROUND_DEF.rd, 1, 4),
      dpmode: ps("dpmode", DPMODE_DEF.dpmode, ["count", "multiply", "mixed"] as const),
      eorange: pi("eorange", EO_DEF.eorange, 100, 10000),
      absmode: ps("absmode", ABS_DEF.absmode, ["find", "list", "equation"] as const),
      prmode: ps("prmode", PRIME_DEF.prmode, ["identify", "factorize"] as const),
      sqmode: ps("sqmode", SQRT_DEF.sqmode, ["find", "simplify", "mul-div", "add-sub", "rationalize", "mixed"] as const),
    };
  });

  const [target, setTarget] = useState(initialSettings.target);
  const [max, setMax] = useState(initialSettings.max);
  const [step, setStep] = useState(initialSettings.step);
  const [smax, setSmax] = useState(initialSettings.smax);
  const [range, setRange] = useState(initialSettings.range);
  const [ln3mode, setLn3mode] = useState(initialSettings.ln3mode);
  const [ln4mode, setLn4mode] = useState(initialSettings.ln4mode);
  const [rd, setRd] = useState(initialSettings.rd);
  const [dpmode, setDpmode] = useState(initialSettings.dpmode);
  const [eorange, setEorange] = useState(initialSettings.eorange);
  const [absmode, setAbsmode] = useState(initialSettings.absmode);
  const [prmode, setPrmode] = useState(initialSettings.prmode);
  const [sqmode, setSqmode] = useState(initialSettings.sqmode);

  // ---- URL settings builder ----
  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    switch (op) {
      case "decomposition":
        if (target !== DECOMP_DEF.target) m.target = String(target);
        break;
      case "comparison":
        if (max !== COMP_DEF.max) m.max = String(max);
        break;
      case "sequence":
        if (step !== SEQ_DEF.step) m.step = String(step);
        if (smax !== SEQ_DEF.smax) m.smax = String(smax);
        break;
      case "large-num":
        if (range !== LARGE_DEF.range) m.range = String(range);
        break;
      case "large-num3":
        if (ln3mode !== LARGE3_DEF.ln3mode) m.ln3mode = ln3mode;
        break;
      case "large-num4":
        if (ln4mode !== LARGE4_DEF.ln4mode) m.ln4mode = ln4mode;
        break;
      case "rounding":
        if (rd !== ROUND_DEF.rd) m.rd = String(rd);
        break;
      case "decimal-place":
        if (dpmode !== DPMODE_DEF.dpmode) m.dpmode = dpmode;
        break;
      case "even-odd":
        if (eorange !== EO_DEF.eorange) m.eorange = String(eorange);
        break;
      case "absolute-value":
        if (absmode !== ABS_DEF.absmode) m.absmode = absmode;
        break;
      case "prime":
        if (prmode !== PRIME_DEF.prmode) m.prmode = prmode;
        break;
      case "square-root":
        if (sqmode !== SQRT_DEF.sqmode) m.sqmode = sqmode;
        break;
    }
    return m;
  }, [op, target, max, step, smax, range, ln3mode, ln4mode, rd, dpmode, eorange, absmode, prmode, sqmode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  // ---- settings change handlers ----
  const onTargetChange = useCallback((v: number) => {
    setTarget(v);
    const p: Record<string, string> = {};
    if (v !== DECOMP_DEF.target) p.target = String(v);
    regen(p);
  }, [regen]);

  const onMaxChange = useCallback((v: number) => {
    setMax(v);
    const p: Record<string, string> = {};
    if (v !== COMP_DEF.max) p.max = String(v);
    regen(p);
  }, [regen]);

  const onStepChange = useCallback((v: number) => {
    setStep(v);
    const p: Record<string, string> = {};
    if (v !== SEQ_DEF.step) p.step = String(v);
    if (smax !== SEQ_DEF.smax) p.smax = String(smax);
    regen(p);
  }, [smax, regen]);

  const onSmaxChange = useCallback((v: number) => {
    setSmax(v);
    const p: Record<string, string> = {};
    if (step !== SEQ_DEF.step) p.step = String(step);
    if (v !== SEQ_DEF.smax) p.smax = String(v);
    regen(p);
  }, [step, regen]);

  const onRangeChange = useCallback((v: number) => {
    setRange(v);
    const p: Record<string, string> = {};
    if (v !== LARGE_DEF.range) p.range = String(v);
    regen(p);
  }, [regen]);

  const onLn3modeChange = useCallback((v: typeof ln3mode) => {
    setLn3mode(v);
    const p: Record<string, string> = {};
    if (v !== LARGE3_DEF.ln3mode) p.ln3mode = v;
    regen(p);
  }, [regen]);

  const onLn4modeChange = useCallback((v: typeof ln4mode) => {
    setLn4mode(v);
    const p: Record<string, string> = {};
    if (v !== LARGE4_DEF.ln4mode) p.ln4mode = v;
    regen(p);
  }, [regen]);

  const onRdChange = useCallback((v: number) => {
    setRd(v);
    const p: Record<string, string> = {};
    if (v !== ROUND_DEF.rd) p.rd = String(v);
    regen(p);
  }, [regen]);

  const onDpmodeChange = useCallback((v: typeof dpmode) => {
    setDpmode(v);
    const p: Record<string, string> = {};
    if (v !== DPMODE_DEF.dpmode) p.dpmode = v;
    regen(p);
  }, [regen]);

  const onEorangeChange = useCallback((v: number) => {
    setEorange(v);
    const p: Record<string, string> = {};
    if (v !== EO_DEF.eorange) p.eorange = String(v);
    regen(p);
  }, [regen]);

  const onAbsmodeChange = useCallback((v: AbsoluteValueMode) => {
    setAbsmode(v);
    const p: Record<string, string> = {};
    if (v !== ABS_DEF.absmode) p.absmode = v;
    regen(p);
  }, [regen]);

  const onPrmodeChange = useCallback((v: PrimeMode) => {
    setPrmode(v);
    const p: Record<string, string> = {};
    if (v !== PRIME_DEF.prmode) p.prmode = v;
    regen(p);
  }, [regen]);

  const onSqmodeChange = useCallback((v: SqrtMode) => {
    setSqmode(v);
    const p: Record<string, string> = {};
    if (v !== SQRT_DEF.sqmode) p.sqmode = v;
    regen(p);
  }, [regen]);

  // ---- generate problems ----
  const decompProblems = useMemo(
    () => op === "decomposition" ? generateDecomposition(seed, target) : [],
    [op, seed, target],
  );
  const compProblems = useMemo(
    () => op === "comparison" ? generateComparison(seed, max) : [],
    [op, seed, max],
  );
  const seqProblems = useMemo(
    () => op === "sequence" ? generateSequence(seed, step, smax) : [],
    [op, seed, step, smax],
  );
  const largeNumProblems = useMemo(
    () => op === "large-num" ? generateLargeNum(seed, range) : [],
    [op, seed, range],
  );
  const largeNum3Problems = useMemo(
    () => op === "large-num3" ? generateLargeNum3(seed, ln3mode) : [],
    [op, seed, ln3mode],
  );
  const largeNum4Problems = useMemo(
    () => op === "large-num4" ? generateLargeNum4(seed, ln4mode) : [],
    [op, seed, ln4mode],
  );
  const roundProblems = useMemo(
    () => op === "rounding" ? generateRounding(seed, rd) : [],
    [op, seed, rd],
  );
  const decimalPlaceProblems = useMemo(
    () => op === "decimal-place" ? generateDecimalPlace(seed, dpmode) : [],
    [op, seed, dpmode],
  );
  const eoProblems = useMemo(
    () => op === "even-odd" ? generateEvenOdd(seed, eorange) : [],
    [op, seed, eorange],
  );
  const absProblems = useMemo(
    () => op === "absolute-value" ? generateAbsoluteValue(seed, absmode) : [],
    [op, seed, absmode],
  );
  const primeProblems = useMemo(
    () => op === "prime" ? generatePrime(seed, prmode) : [],
    [op, seed, prmode],
  );
  const sqrtProblems = useMemo(
    () => op === "square-root" ? generateSqrt(seed, sqmode) : [],
    [op, seed, sqmode],
  );

  // ---- render helpers ----
  const renderTextProblems = (items: TextProblem[]) => (
    <div className="dev-text-page">
      {items.map((p, i) => (
        <div key={i} className="dev-text-row">
          <span className="g1-num">({i + 1})</span>
          <span className="dev-text-q">{p.question}</span>
          <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
            {p.answer}
          </span>
        </div>
      ))}
    </div>
  );

  const renderArrowTextProblems = (items: TextProblem[]) => (
    <div className="dev-text-page">
      {items.map((p, i) => (
        <div key={i} className="dev-text-row">
          <span className="g1-num">({i + 1})</span>
          <span className="dev-text-q">{p.question}</span>
          <span className="dev-text-arrow">&rarr;</span>
          <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
            {p.answer}
          </span>
        </div>
      ))}
    </div>
  );

  // ---- settings panel ----
  const renderSettings = () => {
    switch (op) {
      case "decomposition":
        return (
          <div className="no-print settings-panel">
            <label>
              いくつにする{" "}
              <select
                className="operator-select"
                value={target}
                onChange={(e) => onTargetChange(Number(e.target.value))}
              >
                {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(
                  (n) => <option key={n} value={n}>{n}</option>,
                )}
              </select>
            </label>
          </div>
        );
      case "comparison":
        return (
          <div className="no-print settings-panel">
            <label>
              最大の数{" "}
              <select
                className="operator-select"
                value={max}
                onChange={(e) => onMaxChange(Number(e.target.value))}
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
          </div>
        );
      case "sequence":
        return (
          <div className="no-print settings-panel">
            <label>
              いくつとび{" "}
              <select
                className="operator-select"
                value={step}
                onChange={(e) => onStepChange(Number(e.target.value))}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
            </label>
            <label>
              最大の数{" "}
              <select
                className="operator-select"
                value={smax}
                onChange={(e) => onSmaxChange(Number(e.target.value))}
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
          </div>
        );
      case "large-num":
        return (
          <div className="no-print settings-panel">
            <label>
              数の範囲{" "}
              <select
                className="operator-select"
                value={range}
                onChange={(e) => onRangeChange(Number(e.target.value))}
              >
                <option value={100}>~100</option>
                <option value={1000}>~1000</option>
                <option value={10000}>~10000</option>
              </select>
            </label>
          </div>
        );
      case "large-num3":
        return (
          <div className="no-print settings-panel">
            <label>
              問題の種類{" "}
              <select
                className="operator-select"
                value={ln3mode}
                onChange={(e) => onLn3modeChange(e.target.value as any)}
              >
                <option value="mixed">すべて</option>
                <option value="read">読み書き</option>
                <option value="count">いくつ分</option>
                <option value="multiply">何倍・1/N</option>
              </select>
            </label>
          </div>
        );
      case "large-num4":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select
                className="operator-select"
                value={ln4mode}
                onChange={(e) => onLn4modeChange(e.target.value as any)}
              >
                <option value="mixed">すべて</option>
                <option value="read">読み書き</option>
                <option value="position">位取り</option>
              </select>
            </label>
          </div>
        );
      case "rounding":
        return (
          <div className="no-print settings-panel">
            <label>
              数の桁数{" "}
              <select
                className="operator-select"
                value={rd}
                onChange={(e) => onRdChange(Number(e.target.value))}
              >
                <option value={2}>3~4桁</option>
                <option value={3}>3~5桁</option>
                <option value={4}>3~6桁</option>
              </select>
            </label>
          </div>
        );
      case "decimal-place":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select
                className="operator-select"
                value={dpmode}
                onChange={(e) => onDpmodeChange(e.target.value as any)}
              >
                <option value="mixed">すべて</option>
                <option value="count">0.1が何個</option>
                <option value="multiply">10倍・1/10</option>
              </select>
            </label>
          </div>
        );
      case "even-odd":
        return (
          <div className="no-print settings-panel">
            <label>
              数の範囲{" "}
              <select
                className="operator-select"
                value={eorange}
                onChange={(e) => onEorangeChange(Number(e.target.value))}
              >
                <option value={100}>1~100</option>
                <option value={1000}>1~1000</option>
                <option value={10000}>1~10000</option>
              </select>
            </label>
          </div>
        );
      case "absolute-value":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select
                className="operator-select"
                value={absmode}
                onChange={(e) => onAbsmodeChange(e.target.value as AbsoluteValueMode)}
              >
                <option value="find">絶対値を求める</option>
                <option value="list">整数を列挙</option>
                <option value="equation">|x| = a</option>
              </select>
            </label>
          </div>
        );
      case "prime":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select
                className="operator-select"
                value={prmode}
                onChange={(e) => onPrmodeChange(e.target.value as PrimeMode)}
              >
                <option value="identify">素数の判定</option>
                <option value="factorize">素因数分解</option>
              </select>
            </label>
          </div>
        );
      case "square-root":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select
                className="operator-select"
                value={sqmode}
                onChange={(e) => onSqmodeChange(e.target.value as SqrtMode)}
              >
                <option value="mixed">すべて</option>
                <option value="find">平方根を求める</option>
                <option value="simplify">根号の簡約化</option>
                <option value="mul-div">乗除</option>
                <option value="add-sub">加減</option>
                <option value="rationalize">有理化</option>
              </select>
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  // ---- render problems ----
  const renderProblems = () => {
    switch (op) {
      case "decomposition":
        return (
          <div className="g1-page g1-cols-2">
            {decompProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  <span className="g1-val">{p.target}</span>
                  <span className="g1-op">=</span>
                  {p.position === "left" ? (
                    <>
                      <span className="g1-val">{p.given}</span>
                      <span className="g1-op">+</span>
                      <Box answer={p.answer} show={showAnswers} />
                    </>
                  ) : (
                    <>
                      <Box answer={p.answer} show={showAnswers} />
                      <span className="g1-op">+</span>
                      <span className="g1-val">{p.given}</span>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        );

      case "comparison":
        return (
          <div className="g1-page g1-cols-3">
            {compProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  <span className="g1-val">{p.left}</span>
                  <Box answer={p.answer} show={showAnswers} />
                  <span className="g1-val">{p.right}</span>
                </span>
              </div>
            ))}
          </div>
        );

      case "sequence":
        return (
          <div className="g1-seq-page">
            {seqProblems.map((p, i) => (
              <div key={i} className="g1-seq-row">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-seq-cells">
                  {p.cells.map((c, j) => {
                    const blankIdx =
                      c === null
                        ? p.cells.slice(0, j).filter((x) => x === null).length
                        : -1;
                    return (
                      <span key={j} className="g1-seq-cell-wrap">
                        {j > 0 && <span className="g1-seq-arrow">&rarr;</span>}
                        {c !== null ? (
                          <span className="g1-seq-cell">{c}</span>
                        ) : (
                          <Box answer={p.answers[blankIdx]} show={showAnswers} />
                        )}
                      </span>
                    );
                  })}
                </span>
              </div>
            ))}
          </div>
        );

      case "large-num":
        return renderArrowTextProblems(largeNumProblems);

      case "large-num3":
        return renderArrowTextProblems(largeNum3Problems);

      case "large-num4":
        return renderTextProblems(largeNum4Problems);

      case "rounding":
        return renderTextProblems(roundProblems);

      case "decimal-place":
        return renderTextProblems(decimalPlaceProblems);

      case "even-odd":
        return (
          <div className="dev-text-page">
            {eoProblems.map((p, i) => (
              <div key={i} className="dev-text-row">
                <span className="g1-num">({i + 1})</span>
                <span className="dev-text-q">{p.numbers.join("\u3001")}</span>
                <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                  偶数: {p.evenAnswers.join("\u3001")} ／ 奇数: {p.oddAnswers.join("\u3001")}
                </span>
              </div>
            ))}
          </div>
        );

      case "absolute-value":
        return (
          <div className="dev-text-page">
            {absProblems.map((p, i) => {
              if (p.mode === "find") {
                return (
                  <div key={i} className="g1-problem">
                    <span className="g1-num">({i + 1})</span>
                    <span className="g1-expr">
                      <span className="g1-val">|{p.number}|</span>
                      <span className="g1-op">=</span>
                      <Box answer={p.answer!} show={showAnswers} />
                    </span>
                  </div>
                );
              }
              if (p.mode === "list") {
                return (
                  <div key={i} className="dev-text-row">
                    <span className="g1-num">({i + 1})</span>
                    <span className="dev-text-q">
                      絶対値が {p.threshold} 以下の整数をすべて書きなさい
                    </span>
                    <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                      {p.listAnswer!.join(", ")}
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} className="dev-text-row">
                  <span className="g1-num">({i + 1})</span>
                  <span className="dev-text-q">|x| = {p.eqValue} のとき x = ?</span>
                  <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                    x = ±{p.eqValue}
                  </span>
                </div>
              );
            })}
          </div>
        );

      case "prime":
        return (
          <div className="dev-text-page">
            {primeProblems.map((p, i) => {
              if (p.mode === "identify") {
                return (
                  <div key={i} className="dev-prop-block">
                    <div className="dev-prop-label">
                      ({i + 1}) 次の数のうち素数をすべて選びなさい
                    </div>
                    <div className="dev-text-q" style={{ fontSize: "1.1em" }}>
                      {p.numbers!.join(", ")}
                    </div>
                    <div className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                      {p.primes!.join(", ")}
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className="dev-text-row">
                  <span className="g1-num">({i + 1})</span>
                  <span className="dev-text-q">{p.target} を素因数分解しなさい</span>
                  <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                    {p.factorExpr}
                  </span>
                </div>
              );
            })}
          </div>
        );

      case "square-root":
        return (
          <div className="g1-page g1-cols-2">
            {sqrtProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  <span className="g1-val">{p.expr}</span>
                  <span className="g1-op">=</span>
                  <span className={showAnswers ? "" : "g1-hidden"}>
                    <span className="g1-val">{p.answerDisplay}</span>
                  </span>
                </span>
              </div>
            ))}
          </div>
        );

      default:
        return <p>不明な問題タイプです</p>;
    }
  };

  return (
    <ProblemPageLayout
      showAnswers={showAnswers}
      showSettings={showSettings}
      handleNew={handleNew}
      handleToggleAnswers={handleToggleAnswers}
      setShowSettings={setShowSettings}
      settingsPanel={renderSettings()}
      qrUrl={qrUrl}
    >
      {renderProblems()}
    </ProblemPageLayout>
  );
};

/* ================================================================
   Exported group definition
   ================================================================ */

export const numbers: ProblemGroup = {
  id: "numbers",
  label: "数の性質",
  operators: [
    { operator: "decomposition", label: "数の分解", grades: [1], category: "numbers" },
    { operator: "comparison", label: "大小くらべ", grades: [1], category: "numbers" },
    { operator: "sequence", label: "数のならび", grades: [1], category: "numbers" },
    { operator: "large-num", label: "大きな数", grades: [2], category: "numbers" },
    { operator: "large-num3", label: "大きな数（万の位）", grades: [3], category: "numbers" },
    { operator: "large-num4", label: "大きな数（億・兆）", grades: [4], category: "numbers" },
    { operator: "rounding", label: "四捨五入", grades: [4], category: "numbers" },
    { operator: "decimal-place", label: "小数の位取り", grades: [4], category: "numbers" },
    { operator: "even-odd", label: "偶数と奇数", grades: [5], category: "numbers" },
    { operator: "absolute-value", label: "絶対値", grades: [7], category: "numbers" },
    { operator: "prime", label: "素数・素因数分解", grades: [7], category: "numbers" },
    { operator: "square-root", label: "平方根", grades: [9], category: "numbers" },
  ],
  Component: Numbers,
};
