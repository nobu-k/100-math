import { useState, useCallback, useMemo } from "react";
import type { ProblemGroup } from "./types";
import type { TextProblem } from "./shared/types";
import { Box } from "./shared/Box";
import ProblemPageLayout from "./shared/ProblemPageLayout";
import useProblemPage from "./shared/useProblemPage";
import { generateBoxEq } from "./equations/box-eq";
import { generatePatternEq } from "./equations/pattern-eq";
import { generateLiteralExpr } from "./equations/literal-expr";
import { type ExprValueVars, generateExprValue } from "./equations/expr-value";
import { type LinearExprMode, generateLinearExpr } from "./equations/linear-expr";
import { type LinearEqMode, generateLinearEq } from "./equations/linear-eq";
import { type SimEqMode, generateSimEq } from "./equations/simultaneous-eq";
import { type ExpansionMode, generateExpansion } from "./equations/expansion";
import { type FactoringMode, generateFactoring } from "./equations/factoring";
import { type QuadEqMode, generateQuadEq } from "./equations/quadratic-eq";

/* ================================================================
   Types
   ================================================================ */

type EquationsOp =
  | "box-eq"
  | "pattern-eq"
  | "literal-expr"
  | "expr-value"
  | "linear-expr"
  | "linear-eq"
  | "simultaneous-eq"
  | "expansion"
  | "factoring"
  | "quadratic-eq";

/* ================================================================
   Defaults
   ================================================================ */

const BOX_DEF = { ops: "addsub" as const };
const EXPRVAL_DEF = { evvars: "one" as ExprValueVars };
const LINEXPR_DEF = { lemode: "mixed" as LinearExprMode };
const LINEQ_DEF = { eqmode: "mixed" as LinearEqMode };
const SIMEQ_DEF = { seqmode: "mixed" as SimEqMode };
const EXP_DEF = { exmode: "mixed" as ExpansionMode };
const FAC_DEF = { fcmode: "mixed" as FactoringMode };
const QUADEQ_DEF = { qemode: "mixed" as QuadEqMode };

/* ================================================================
   URL param keys
   ================================================================ */

const PARAM_KEYS = ["ops", "evvars", "lemode", "eqmode", "seqmode", "exmode", "fcmode", "qemode"];

/* ================================================================
   Main component
   ================================================================ */

const Equations = ({ operator }: { operator: string }) => {
  const op = operator as EquationsOp;

  /* ---- parse initial settings from URL ---- */

  const [initialSettings] = useState(() => {
    const p = new URLSearchParams(window.location.search);

    const opsRaw = p.get("ops") ?? BOX_DEF.ops;
    const ops: "addsub" | "all" = opsRaw === "all" ? "all" : "addsub";

    const evvarsRaw = p.get("evvars") ?? EXPRVAL_DEF.evvars;
    const evvars = (["one", "two"] as const).includes(evvarsRaw as any)
      ? (evvarsRaw as ExprValueVars) : EXPRVAL_DEF.evvars;

    const lemodeRaw = p.get("lemode") ?? LINEXPR_DEF.lemode;
    const lemode = (["add-sub", "mul-div", "mixed"] as const).includes(lemodeRaw as any)
      ? (lemodeRaw as LinearExprMode) : LINEXPR_DEF.lemode;

    const eqmodeRaw = p.get("eqmode") ?? LINEQ_DEF.eqmode;
    const eqmode = (["basic", "advanced", "mixed"] as const).includes(eqmodeRaw as any)
      ? (eqmodeRaw as LinearEqMode) : LINEQ_DEF.eqmode;

    const seqmodeRaw = p.get("seqmode") ?? SIMEQ_DEF.seqmode;
    const seqmode = (["addition", "substitution", "mixed"] as const).includes(seqmodeRaw as any)
      ? (seqmodeRaw as SimEqMode) : SIMEQ_DEF.seqmode;

    const exmodeRaw = p.get("exmode") ?? EXP_DEF.exmode;
    const exmode = (["distribute", "formula", "mixed"] as const).includes(exmodeRaw as any)
      ? (exmodeRaw as ExpansionMode) : EXP_DEF.exmode;

    const fcmodeRaw = p.get("fcmode") ?? FAC_DEF.fcmode;
    const fcmode = (["common", "formula", "mixed"] as const).includes(fcmodeRaw as any)
      ? (fcmodeRaw as FactoringMode) : FAC_DEF.fcmode;

    const qemodeRaw = p.get("qemode") ?? QUADEQ_DEF.qemode;
    const qemode = (["factoring", "formula", "mixed"] as const).includes(qemodeRaw as any)
      ? (qemodeRaw as QuadEqMode) : QUADEQ_DEF.qemode;

    return { ops, evvars, lemode, eqmode, seqmode, exmode, fcmode, qemode };
  });

  const [ops, setOps] = useState(initialSettings.ops);
  const [evvars, setEvvars] = useState(initialSettings.evvars);
  const [lemode, setLemode] = useState(initialSettings.lemode);
  const [eqmode, setEqmode] = useState(initialSettings.eqmode);
  const [seqmode, setSeqmode] = useState(initialSettings.seqmode);
  const [exmode, setExmode] = useState(initialSettings.exmode);
  const [fcmode, setFcmode] = useState(initialSettings.fcmode);
  const [qemode, setQemode] = useState(initialSettings.qemode);

  /* ---- shared hook ---- */

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    switch (op) {
      case "box-eq":
        if (ops !== BOX_DEF.ops) m.ops = ops;
        break;
      case "expr-value":
        if (evvars !== EXPRVAL_DEF.evvars) m.evvars = evvars;
        break;
      case "linear-expr":
        if (lemode !== LINEXPR_DEF.lemode) m.lemode = lemode;
        break;
      case "linear-eq":
        if (eqmode !== LINEQ_DEF.eqmode) m.eqmode = eqmode;
        break;
      case "simultaneous-eq":
        if (seqmode !== SIMEQ_DEF.seqmode) m.seqmode = seqmode;
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
      case "pattern-eq":
      case "literal-expr":
        break;
    }
    return m;
  }, [op, ops, evvars, lemode, eqmode, seqmode, exmode, fcmode, qemode]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  /* ---- settings change handler ---- */

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

  const boxProblems = useMemo(
    () => op === "box-eq" ? generateBoxEq(seed, ops) : [],
    [op, seed, ops],
  );
  const patternProblems = useMemo(
    () => op === "pattern-eq" ? generatePatternEq(seed) : [],
    [op, seed],
  );
  const literalExprProblems = useMemo(
    () => op === "literal-expr" ? generateLiteralExpr(seed) : [],
    [op, seed],
  );
  const exprValProblems = useMemo(
    () => op === "expr-value" ? generateExprValue(seed, evvars) : [],
    [op, seed, evvars],
  );
  const linExprProblems = useMemo(
    () => op === "linear-expr" ? generateLinearExpr(seed, lemode) : [],
    [op, seed, lemode],
  );
  const linEqProblems = useMemo(
    () => op === "linear-eq" ? generateLinearEq(seed, eqmode) : [],
    [op, seed, eqmode],
  );
  const simEqProblems = useMemo(
    () => op === "simultaneous-eq" ? generateSimEq(seed, seqmode) : [],
    [op, seed, seqmode],
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

  /* ---- settings panel ---- */

  const renderSettings = () => {
    switch (op) {
      case "box-eq":
        return (
          <div className="no-print settings-panel">
            <label>
              演算{" "}
              <select className="operator-select" value={ops}
                onChange={(e) => onSettingChange(setOps, "ops", BOX_DEF.ops)(e.target.value as any)}>
                <option value="addsub">＋・− のみ</option>
                <option value="all">＋・−・×・÷</option>
              </select>
            </label>
          </div>
        );
      case "expr-value":
        return (
          <div className="no-print settings-panel">
            <label>
              変数の数{" "}
              <select className="operator-select" value={evvars}
                onChange={(e) => onSettingChange(setEvvars, "evvars", EXPRVAL_DEF.evvars)(e.target.value as ExprValueVars)}>
                <option value="one">1つ</option>
                <option value="two">2つ</option>
              </select>
            </label>
          </div>
        );
      case "linear-expr":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={lemode}
                onChange={(e) => onSettingChange(setLemode, "lemode", LINEXPR_DEF.lemode)(e.target.value as LinearExprMode)}>
                <option value="mixed">すべて</option>
                <option value="add-sub">加減のみ</option>
                <option value="mul-div">乗除のみ</option>
              </select>
            </label>
          </div>
        );
      case "linear-eq":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={eqmode}
                onChange={(e) => onSettingChange(setEqmode, "eqmode", LINEQ_DEF.eqmode)(e.target.value as LinearEqMode)}>
                <option value="mixed">すべて</option>
                <option value="basic">基本</option>
                <option value="advanced">移項・括弧</option>
              </select>
            </label>
          </div>
        );
      case "simultaneous-eq":
        return (
          <div className="no-print settings-panel">
            <label>
              解法{" "}
              <select className="operator-select" value={seqmode}
                onChange={(e) => onSettingChange(setSeqmode, "seqmode", SIMEQ_DEF.seqmode)(e.target.value as SimEqMode)}>
                <option value="mixed">すべて</option>
                <option value="addition">加減法</option>
                <option value="substitution">代入法</option>
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
      case "pattern-eq":
      case "literal-expr":
        return null;
      default:
        return null;
    }
  };

  /* ---- render helpers ---- */

  const renderTextProblems = (items: TextProblem[]) => (
    <div className="dev-text-page">
      {items.map((p, i) => (
        <div key={i} className="dev-text-row">
          <span className="g1-num">({i + 1})</span>
          <span className="dev-text-q">{p.question}</span>
          <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.answer}</span>
        </div>
      ))}
    </div>
  );

  const renderExprProblems = (items: { expr: string; answerExpr: string }[]) => (
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

  /* ---- render problems ---- */

  const renderProblems = () => {
    switch (op) {
      case "box-eq":
        return (
          <div className="g1-page g1-cols-2">
            {boxProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  <span className="dev-text-q">{p.display}</span>
                  <span style={{ marginLeft: 8 }}>
                    <Box answer={p.answer} show={showAnswers} />
                  </span>
                </span>
              </div>
            ))}
          </div>
        );

      case "pattern-eq":
        return renderTextProblems(patternProblems);

      case "literal-expr":
        return (
          <div className="dev-text-page">
            {literalExprProblems.map((p, i) => (
              <div key={i} className="dev-text-row">
                <span className="g1-num">({i + 1})</span>
                <span className="dev-text-q">{p.question}</span>
                <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.answer}</span>
              </div>
            ))}
          </div>
        );

      case "expr-value":
        return (
          <div className="dev-text-page">
            {exprValProblems.map((p, i) => (
              <div key={i} className="dev-text-row">
                <span className="g1-num">({i + 1})</span>
                <span className="dev-text-q">{p.varDisplay} のとき {p.expr} の値は？</span>
                <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.answer}</span>
              </div>
            ))}
          </div>
        );

      case "linear-expr":
        return (
          <div className="g1-page g1-cols-2">
            {linExprProblems.map((p, i) => (
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

      case "linear-eq":
        return (
          <div className="g1-page g1-cols-2">
            {linEqProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr"><span className="g1-val">{p.equation}</span></span>
                <span className="g1-expr" style={{ marginLeft: "1em" }}>
                  <span className="g1-op">x =</span>
                  <Box answer={p.answer} show={showAnswers} />
                </span>
              </div>
            ))}
          </div>
        );

      case "simultaneous-eq":
        return (
          <div className="dev-text-page">
            {simEqProblems.map((p, i) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1})</div>
                <div className="dev-text-q" style={{ display: "flex", flexDirection: "column", gap: "0.2em" }}>
                  <span>{p.eq1}</span>
                  <span>{p.eq2}</span>
                </div>
                <div className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                  x = {p.answerX}, y = {p.answerY}
                </div>
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
                <span className="g1-expr"><span className="g1-val">{p.equation}</span></span>
                <span className={`g1-expr${showAnswers ? "" : " g1-hidden"}`} style={{ marginLeft: "1em" }}>
                  <span className="g1-val">{p.answerDisplay}</span>
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

export const equations: ProblemGroup = {
  id: "equations",
  label: "式・方程式",
  operators: [
    { operator: "box-eq", label: "□を使った式", grades: [3], category: "equations" },
    { operator: "pattern-eq", label: "きまりの式", grades: [5], category: "equations" },
    { operator: "literal-expr", label: "文字式の値", grades: [6], category: "equations" },
    { operator: "expr-value", label: "式の値", grades: [7], category: "equations" },
    { operator: "linear-expr", label: "一次式の計算", grades: [7], category: "equations" },
    { operator: "linear-eq", label: "一次方程式", grades: [7], category: "equations" },
    { operator: "simultaneous-eq", label: "連立方程式", grades: [8], category: "equations" },
    { operator: "expansion", label: "式の展開", grades: [9], category: "equations" },
    { operator: "factoring", label: "因数分解", grades: [9], category: "equations" },
    { operator: "quadratic-eq", label: "二次方程式", grades: [9], category: "equations" },
  ],
  Component: Equations,
};
