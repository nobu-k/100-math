import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { randomSeed, seedToHex, hexToSeed } from "../random";
import type { ProblemGroup } from "../types";
import {
  generateSqrt,
  generateExpansion,
  generateFactoring,
  generateQuadEq,
  generateSimilarity,
  generateCircleAngle,
  generatePythagorean,
  generateQuadFunc,
  generateSampling,
} from "./generators";
import type {
  SqrtMode,
  ExpansionMode,
  FactoringMode,
  QuadEqMode,
  SimilarityMode,
  CircleAngleMode,
  PythagoreanMode,
  QuadFuncMode,
  SamplingMode,
} from "./generators";

/* ================================================================
   Types
   ================================================================ */

type Grade9Op =
  | "square-root"
  | "expansion"
  | "factoring"
  | "quadratic-eq"
  | "similarity"
  | "circle-angle"
  | "pythagorean"
  | "quadratic-func"
  | "sampling";

/* ================================================================
   URL state helpers
   ================================================================ */

const ALL_PARAMS = [
  "q", "answers", "sqmode", "exmode", "fcmode", "qemode",
  "smmode", "camode", "ptmode", "qfmode", "spmode",
];

const cleanParams = (url: URL) => {
  for (const k of ALL_PARAMS) url.searchParams.delete(k);
};

/* ================================================================
   Defaults
   ================================================================ */

const SQRT_DEF = { sqmode: "mixed" as SqrtMode };
const EXP_DEF = { exmode: "mixed" as ExpansionMode };
const FAC_DEF = { fcmode: "mixed" as FactoringMode };
const QUADEQ_DEF = { qemode: "mixed" as QuadEqMode };
const SIM_DEF = { smmode: "mixed" as SimilarityMode };
const CIRCLE_DEF = { camode: "mixed" as CircleAngleMode };
const PYTH_DEF = { ptmode: "mixed" as PythagoreanMode };
const QUADF_DEF = { qfmode: "mixed" as QuadFuncMode };
const SAMP_DEF = { spmode: "mixed" as SamplingMode };

/* ================================================================
   Main component
   ================================================================ */

const Grade9 = ({ operator }: { operator: string }) => {
  const op = operator as Grade9Op;

  const getInitial = () => {
    const p = new URLSearchParams(window.location.search);
    const qHex = p.get("q");
    const seed = qHex ? hexToSeed(qHex) ?? randomSeed() : randomSeed();
    const showAnswers = p.get("answers") === "1";

    const sqmodeRaw = p.get("sqmode") ?? SQRT_DEF.sqmode;
    const sqmode = (["find", "simplify", "mul-div", "add-sub", "rationalize", "mixed"] as const).includes(sqmodeRaw as any)
      ? (sqmodeRaw as SqrtMode) : SQRT_DEF.sqmode;

    const exmodeRaw = p.get("exmode") ?? EXP_DEF.exmode;
    const exmode = (["distribute", "formula", "mixed"] as const).includes(exmodeRaw as any)
      ? (exmodeRaw as ExpansionMode) : EXP_DEF.exmode;

    const fcmodeRaw = p.get("fcmode") ?? FAC_DEF.fcmode;
    const fcmode = (["common", "formula", "mixed"] as const).includes(fcmodeRaw as any)
      ? (fcmodeRaw as FactoringMode) : FAC_DEF.fcmode;

    const qemodeRaw = p.get("qemode") ?? QUADEQ_DEF.qemode;
    const qemode = (["factoring", "formula", "mixed"] as const).includes(qemodeRaw as any)
      ? (qemodeRaw as QuadEqMode) : QUADEQ_DEF.qemode;

    const smmodeRaw = p.get("smmode") ?? SIM_DEF.smmode;
    const smmode = (["ratio", "parallel-line", "midpoint", "mixed"] as const).includes(smmodeRaw as any)
      ? (smmodeRaw as SimilarityMode) : SIM_DEF.smmode;

    const camodeRaw = p.get("camode") ?? CIRCLE_DEF.camode;
    const camode = (["basic", "inscribed", "mixed"] as const).includes(camodeRaw as any)
      ? (camodeRaw as CircleAngleMode) : CIRCLE_DEF.camode;

    const ptmodeRaw = p.get("ptmode") ?? PYTH_DEF.ptmode;
    const ptmode = (["basic", "special", "applied", "mixed"] as const).includes(ptmodeRaw as any)
      ? (ptmodeRaw as PythagoreanMode) : PYTH_DEF.ptmode;

    const qfmodeRaw = p.get("qfmode") ?? QUADF_DEF.qfmode;
    const qfmode = (["value", "rate-of-change", "graph", "mixed"] as const).includes(qfmodeRaw as any)
      ? (qfmodeRaw as QuadFuncMode) : QUADF_DEF.qfmode;

    const spmodeRaw = p.get("spmode") ?? SAMP_DEF.spmode;
    const spmode = (["concept", "estimation", "mixed"] as const).includes(spmodeRaw as any)
      ? (spmodeRaw as SamplingMode) : SAMP_DEF.spmode;

    return { seed, showAnswers, sqmode, exmode, fcmode, qemode, smmode, camode, ptmode, qfmode, spmode };
  };

  const [initial] = useState(getInitial);
  const [seed, setSeed] = useState(initial.seed);
  const [showAnswers, setShowAnswers] = useState(initial.showAnswers);
  const [showSettings, setShowSettings] = useState(false);

  const [sqmode, setSqmode] = useState(initial.sqmode);
  const [exmode, setExmode] = useState(initial.exmode);
  const [fcmode, setFcmode] = useState(initial.fcmode);
  const [qemode, setQemode] = useState(initial.qemode);
  const [smmode, setSmmode] = useState(initial.smmode);
  const [camode, setCamode] = useState(initial.camode);
  const [ptmode, setPtmode] = useState(initial.ptmode);
  const [qfmode, setQfmode] = useState(initial.qfmode);
  const [spmode, setSpmode] = useState(initial.spmode);

  const syncUrl = useCallback(
    (s: number, ans: boolean, overrides?: Record<string, string>) => {
      const url = new URL(window.location.href);
      cleanParams(url);
      url.searchParams.set("q", seedToHex(s));
      if (ans) url.searchParams.set("answers", "1");
      if (overrides) {
        for (const [k, v] of Object.entries(overrides)) url.searchParams.set(k, v);
      }
      window.history.replaceState(null, "", url.toString());
    },
    [],
  );

  const settingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    switch (op) {
      case "square-root":
        if (sqmode !== SQRT_DEF.sqmode) m.sqmode = sqmode;
        break;
      case "expansion":
        if (exmode !== EXP_DEF.exmode) m.exmode = exmode;
        break;
      case "factoring":
        if (fcmode !== FAC_DEF.fcmode) m.fcmode = fcmode;
        break;
      case "quadratic-eq":
        if (qemode !== QUADEQ_DEF.qemode) m.qemode = qemode;
        break;
      case "similarity":
        if (smmode !== SIM_DEF.smmode) m.smmode = smmode;
        break;
      case "circle-angle":
        if (camode !== CIRCLE_DEF.camode) m.camode = camode;
        break;
      case "pythagorean":
        if (ptmode !== PYTH_DEF.ptmode) m.ptmode = ptmode;
        break;
      case "quadratic-func":
        if (qfmode !== QUADF_DEF.qfmode) m.qfmode = qfmode;
        break;
      case "sampling":
        if (spmode !== SAMP_DEF.spmode) m.spmode = spmode;
        break;
    }
    return m;
  }, [op, sqmode, exmode, fcmode, qemode, smmode, camode, ptmode, qfmode, spmode]);

  useState(() => { syncUrl(seed, showAnswers, settingsParams()); });

  const handleNew = useCallback(() => {
    const s = randomSeed();
    setSeed(s);
    setShowAnswers(false);
    syncUrl(s, false, settingsParams());
  }, [syncUrl, settingsParams]);

  const handleToggleAnswers = useCallback(() => {
    setShowAnswers((prev) => {
      syncUrl(seed, !prev, settingsParams());
      return !prev;
    });
  }, [seed, syncUrl, settingsParams]);

  const regen = useCallback(
    (overrides: Record<string, string>) => {
      const s = randomSeed();
      setSeed(s);
      setShowAnswers(false);
      syncUrl(s, false, overrides);
    },
    [syncUrl],
  );

  const qrUrl = useMemo(() => {
    const url = new URL(window.location.href);
    cleanParams(url);
    url.searchParams.set("q", seedToHex(seed));
    url.searchParams.set("answers", "1");
    const sp = settingsParams();
    for (const [k, v] of Object.entries(sp)) url.searchParams.set(k, v);
    return url.toString();
  }, [seed, settingsParams]);

  const onSettingChange = useCallback(
    <T,>(setter: (v: T) => void, key: string, defVal: T) =>
      (v: T) => {
        setter(v);
        const p: Record<string, string> = {};
        if (v !== defVal) p[key] = String(v);
        regen(p);
      },
    [regen],
  );

  /* ---- generate problems ---- */

  const sqrtProblems = useMemo(
    () => op === "square-root" ? generateSqrt(seed, sqmode) : [],
    [op, seed, sqmode],
  );
  const expProblems = useMemo(
    () => op === "expansion" ? generateExpansion(seed, exmode) : [],
    [op, seed, exmode],
  );
  const facProblems = useMemo(
    () => op === "factoring" ? generateFactoring(seed, fcmode) : [],
    [op, seed, fcmode],
  );
  const quadEqProblems = useMemo(
    () => op === "quadratic-eq" ? generateQuadEq(seed, qemode) : [],
    [op, seed, qemode],
  );
  const simProblems = useMemo(
    () => op === "similarity" ? generateSimilarity(seed, smmode) : [],
    [op, seed, smmode],
  );
  const circleProblems = useMemo(
    () => op === "circle-angle" ? generateCircleAngle(seed, camode) : [],
    [op, seed, camode],
  );
  const pythProblems = useMemo(
    () => op === "pythagorean" ? generatePythagorean(seed, ptmode) : [],
    [op, seed, ptmode],
  );
  const quadFuncProblems = useMemo(
    () => op === "quadratic-func" ? generateQuadFunc(seed, qfmode) : [],
    [op, seed, qfmode],
  );
  const sampProblems = useMemo(
    () => op === "sampling" ? generateSampling(seed, spmode) : [],
    [op, seed, spmode],
  );

  /* ---- settings panel ---- */

  const renderSettings = () => {
    switch (op) {
      case "square-root":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={sqmode}
                onChange={(e) => onSettingChange(setSqmode, "sqmode", SQRT_DEF.sqmode)(e.target.value as SqrtMode)}>
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
      case "expansion":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={exmode}
                onChange={(e) => onSettingChange(setExmode, "exmode", EXP_DEF.exmode)(e.target.value as ExpansionMode)}>
                <option value="mixed">すべて</option>
                <option value="distribute">分配法則</option>
                <option value="formula">乗法公式</option>
              </select>
            </label>
          </div>
        );
      case "factoring":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={fcmode}
                onChange={(e) => onSettingChange(setFcmode, "fcmode", FAC_DEF.fcmode)(e.target.value as FactoringMode)}>
                <option value="mixed">すべて</option>
                <option value="common">共通因数</option>
                <option value="formula">乗法公式の逆</option>
              </select>
            </label>
          </div>
        );
      case "quadratic-eq":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={qemode}
                onChange={(e) => onSettingChange(setQemode, "qemode", QUADEQ_DEF.qemode)(e.target.value as QuadEqMode)}>
                <option value="mixed">すべて</option>
                <option value="factoring">因数分解</option>
                <option value="formula">解の公式</option>
              </select>
            </label>
          </div>
        );
      case "similarity":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={smmode}
                onChange={(e) => onSettingChange(setSmmode, "smmode", SIM_DEF.smmode)(e.target.value as SimilarityMode)}>
                <option value="mixed">すべて</option>
                <option value="ratio">相似比</option>
                <option value="parallel-line">平行線と比</option>
                <option value="midpoint">中点連結定理</option>
              </select>
            </label>
          </div>
        );
      case "circle-angle":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={camode}
                onChange={(e) => onSettingChange(setCamode, "camode", CIRCLE_DEF.camode)(e.target.value as CircleAngleMode)}>
                <option value="mixed">すべて</option>
                <option value="basic">基本</option>
                <option value="inscribed">内接図形</option>
              </select>
            </label>
          </div>
        );
      case "pythagorean":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={ptmode}
                onChange={(e) => onSettingChange(setPtmode, "ptmode", PYTH_DEF.ptmode)(e.target.value as PythagoreanMode)}>
                <option value="mixed">すべて</option>
                <option value="basic">基本</option>
                <option value="special">特殊な直角三角形</option>
                <option value="applied">応用</option>
              </select>
            </label>
          </div>
        );
      case "quadratic-func":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={qfmode}
                onChange={(e) => onSettingChange(setQfmode, "qfmode", QUADF_DEF.qfmode)(e.target.value as QuadFuncMode)}>
                <option value="mixed">すべて</option>
                <option value="value">値を求める</option>
                <option value="rate-of-change">変化の割合</option>
                <option value="graph">グラフ</option>
              </select>
            </label>
          </div>
        );
      case "sampling":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={spmode}
                onChange={(e) => onSettingChange(setSpmode, "spmode", SAMP_DEF.spmode)(e.target.value as SamplingMode)}>
                <option value="mixed">すべて</option>
                <option value="concept">概念問題</option>
                <option value="estimation">推定</option>
              </select>
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  /* ---- render problems ---- */

  const renderExprProblems = (
    items: { expr: string; answerExpr: string }[],
  ) => (
    <div className="g1-page g1-cols-2">
      {items.map((p, i) => (
        <div key={i} className="g1-problem">
          <span className="g1-num">({i + 1})</span>
          <span className="g1-expr">
            <span className="g1-val">{p.expr}</span>
            <span className="g1-op">=</span>
            <span className={showAnswers ? "" : "g1-hidden"}>
              <span className="g1-val">{p.answerExpr}</span>
            </span>
          </span>
        </div>
      ))}
    </div>
  );

  const renderTextProblems = (
    items: { question: string; answerDisplay: string }[],
  ) => (
    <div className="dev-text-page">
      {items.map((p, i) => (
        <div key={i} className="dev-text-row">
          <span className="g1-num">({i + 1})</span>
          <span className="dev-text-q">{p.question}</span>
          <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
            {p.answerDisplay}
          </span>
        </div>
      ))}
    </div>
  );

  const renderProblems = () => {
    switch (op) {
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

      case "expansion":
        return renderExprProblems(expProblems);

      case "factoring":
        return renderExprProblems(facProblems);

      case "quadratic-eq":
        return (
          <div className="g1-page g1-cols-2">
            {quadEqProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  <span className="g1-val">{p.equation}</span>
                </span>
                <span className={`g1-expr${showAnswers ? "" : " g1-hidden"}`} style={{ marginLeft: "1em" }}>
                  <span className="g1-val">{p.answerDisplay}</span>
                </span>
              </div>
            ))}
          </div>
        );

      case "similarity":
        return renderTextProblems(simProblems);

      case "circle-angle":
        return renderTextProblems(circleProblems);

      case "pythagorean":
        return renderTextProblems(pythProblems);

      case "quadratic-func":
        return renderTextProblems(quadFuncProblems);

      case "sampling":
        return renderTextProblems(sampProblems);

      default:
        return <p>不明な問題タイプです</p>;
    }
  };

  return (
    <>
      <div className="no-print controls">
        <button onClick={handleNew}>新しい問題</button>
        <button onClick={handleToggleAnswers}>
          {showAnswers ? "答えを隠す" : "答え"}
        </button>
        <button onClick={() => setShowSettings((v) => !v)}>設定</button>
      </div>
      {showSettings && renderSettings()}
      {renderProblems()}
      <div className="qr-section">
        <QRCodeSVG value={qrUrl} size={80} />
        <span className="qr-label">答え</span>
      </div>
    </>
  );
};

export default Grade9;

export const devGrade9: ProblemGroup = {
  id: "dev9",
  label: "中3（開発中）",
  operators: [
    { operator: "square-root", label: "平方根", grades: [9] },
    { operator: "expansion", label: "式の展開", grades: [9] },
    { operator: "factoring", label: "因数分解", grades: [9] },
    { operator: "quadratic-eq", label: "二次方程式", grades: [9] },
    { operator: "similarity", label: "相似", grades: [9] },
    { operator: "circle-angle", label: "円周角", grades: [9] },
    { operator: "pythagorean", label: "三平方の定理", grades: [9] },
    { operator: "quadratic-func", label: "関数 y=ax²", grades: [9] },
    { operator: "sampling", label: "標本調査", grades: [9] },
  ],
  Component: Grade9,
};
