import { useState, useCallback, useMemo } from "react";
import type { ProblemGroup } from "./types";
import type { TextProblem } from "./shared/types";
import type { FracProblem } from "./fractions/types";
import type { PosNegMulDivMode } from "./computation/pos-neg-mul-div";
import type { MonoMulDivMode } from "./computation/mono-mul-div";
import { M, texBox, texAns, texFrac, texRed } from "./shared/M";
import { unicodeToLatex } from "./shared/katex-utils";
import useProblemPage from "./shared/useProblemPage";
import ProblemPageLayout from "./shared/ProblemPageLayout";
import { generateFillBlank } from "./computation/fill-blank";
import { generateKukuBlank } from "./computation/kuku-blank";
import { generateMushikui } from "./computation/mushikui";
import { generateDivision } from "./computation/division";
import { generateMentalMath } from "./computation/mental-math";
import { generateMixedCalc } from "./computation/mixed-calc";
import { generateDivCheck } from "./computation/div-check";
import { generateCalcTrick } from "./computation/calc-trick";
import { generateEstimate } from "./computation/estimate";
import { generateFracMixedCalc } from "./computation/frac-mixed-calc";
import { generatePosNegAddSub } from "./computation/pos-neg-add-sub";
import { generatePosNegMulDiv } from "./computation/pos-neg-mul-div";
import { generatePosNegMixed } from "./computation/pos-neg-mixed";
import { generatePolyAddSub } from "./computation/poly-add-sub";
import { generateMonoMulDiv } from "./computation/mono-mul-div";

/* ================================================================
   Types
   ================================================================ */

type ComputationOp =
  | "fill-blank"
  | "kuku-blank"
  | "mushikui"
  | "division"
  | "mental-math"
  | "mixed-calc"
  | "div-check"
  | "calc-trick"
  | "estimate"
  | "frac-mixed-calc"
  | "pos-neg-add-sub"
  | "pos-neg-mul-div"
  | "pos-neg-mixed"
  | "poly-add-sub"
  | "mono-mul-div";

/* ================================================================
   Defaults
   ================================================================ */

const FILL_DEF = { max: 10, mode: "mixed" as const };
const KUKU_DEF = { blank: "any" as const };
const MUSHI_DEF = { max: 100, mode: "mixed" as const };
const DIV_DEF = { rem: "mixed" as const };
const MENTAL_DEF = { mmode: "mixed" as const };
const ERTO_DEF = { erto: 10 };
const ADDSUB_DEF = { terms: 2 as 2 | 3 };
const MULDIV_DEF = { mdmode: "mixed" as PosNegMulDivMode };
const MONO_DEF = { mmmode: "mixed" as MonoMulDivMode };

/* ================================================================
   URL param keys for this category
   ================================================================ */

const PARAM_KEYS = [
  "max", "mode", "blank", "rem", "mmode", "paren", "erto",
  "terms", "mdmode", "mmmode",
];

/* ================================================================
   Main component
   ================================================================ */

const Computation = ({ operator }: { operator: string }) => {
  const op = operator as ComputationOp;

  /* ---- parse initial URL settings ---- */

  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);

    const max = Math.max(5, Math.min(200,
      parseInt(p.get("max") ?? String(
        op === "mushikui" ? MUSHI_DEF.max : FILL_DEF.max), 10)
        || (op === "mushikui" ? MUSHI_DEF.max : FILL_DEF.max)));

    const modeRaw = p.get("mode") ?? FILL_DEF.mode;
    const mode: "add" | "sub" | "mixed" =
      modeRaw === "add" || modeRaw === "sub" ? modeRaw : "mixed";

    const blankRaw = p.get("blank") ?? KUKU_DEF.blank;
    const blank: "any" | "product" | "factor" =
      (["any", "product", "factor"] as const).includes(blankRaw as any)
        ? (blankRaw as any) : KUKU_DEF.blank;

    const remRaw = p.get("rem") ?? DIV_DEF.rem;
    const rem: "none" | "yes" | "mixed" =
      (["none", "yes", "mixed"] as const).includes(remRaw as any)
        ? (remRaw as any) : DIV_DEF.rem;

    const mmodeRaw = p.get("mmode") ?? MENTAL_DEF.mmode;
    const mmode: "add" | "sub" | "mixed" =
      mmodeRaw === "add" || mmodeRaw === "sub" ? mmodeRaw : "mixed";

    const paren = p.get("paren") !== "0";

    const erto = Math.max(10, Math.min(100,
      parseInt(p.get("erto") ?? String(ERTO_DEF.erto), 10) || ERTO_DEF.erto));

    const termsRaw = p.get("terms");
    const terms: 2 | 3 = termsRaw === "3" ? 3 : ADDSUB_DEF.terms;

    const mdmodeRaw = p.get("mdmode") ?? MULDIV_DEF.mdmode;
    const mdmode = (["mul", "div", "mixed", "power"] as const).includes(mdmodeRaw as any)
      ? (mdmodeRaw as PosNegMulDivMode) : MULDIV_DEF.mdmode;

    const mmmodeRaw = p.get("mmmode") ?? MONO_DEF.mmmode;
    const mmmode = (["mul", "div", "mixed"] as const).includes(mmmodeRaw as any)
      ? (mmmodeRaw as MonoMulDivMode) : MONO_DEF.mmmode;

    return { max, mode, blank, rem, mmode, paren, erto, terms, mdmode, mmmode };
  });

  /* ---- per-operator settings state ---- */

  const [max, setMax] = useState(initial.max);
  const [mode, setMode] = useState(initial.mode);
  const [blank, setBlank] = useState(initial.blank);
  const [rem, setRem] = useState(initial.rem);
  const [mmode, setMmode] = useState(initial.mmode);
  const [paren, setParen] = useState(initial.paren);
  const [erto, setErto] = useState(initial.erto);
  const [terms, setTerms] = useState(initial.terms);
  const [mdmode, setMdmode] = useState(initial.mdmode);
  const [mmmode, setMmmode] = useState(initial.mmmode);

  /* ---- getSettingsParams ---- */

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    switch (op) {
      case "fill-blank":
        if (max !== FILL_DEF.max) m.max = String(max);
        if (mode !== FILL_DEF.mode) m.mode = mode;
        break;
      case "kuku-blank":
        if (blank !== KUKU_DEF.blank) m.blank = blank;
        break;
      case "mushikui":
        if (max !== MUSHI_DEF.max) m.max = String(max);
        if (mode !== MUSHI_DEF.mode) m.mode = mode;
        break;
      case "division":
        if (rem !== DIV_DEF.rem) m.rem = rem;
        break;
      case "mental-math":
        if (mmode !== MENTAL_DEF.mmode) m.mmode = mmode;
        break;
      case "mixed-calc":
        if (!paren) m.paren = "0";
        break;
      case "div-check":
        break;
      case "calc-trick":
        break;
      case "estimate":
        if (erto !== ERTO_DEF.erto) m.erto = String(erto);
        break;
      case "frac-mixed-calc":
        break;
      case "pos-neg-add-sub":
        if (terms !== ADDSUB_DEF.terms) m.terms = String(terms);
        break;
      case "pos-neg-mul-div":
        if (mdmode !== MULDIV_DEF.mdmode) m.mdmode = mdmode;
        break;
      case "pos-neg-mixed":
        break;
      case "poly-add-sub":
        break;
      case "mono-mul-div":
        if (mmmode !== MONO_DEF.mmmode) m.mmmode = mmmode;
        break;
    }
    return m;
  }, [op, max, mode, blank, rem, mmode, paren, erto, terms, mdmode, mmmode]);

  /* ---- shared hook ---- */

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  /* ---- settings change handlers ---- */

  const onMaxChange = useCallback((v: number) => {
    setMax(v);
    const p: Record<string, string> = {};
    if (op === "fill-blank") {
      if (v !== FILL_DEF.max) p.max = String(v);
      if (mode !== FILL_DEF.mode) p.mode = mode;
    } else if (op === "mushikui") {
      if (v !== MUSHI_DEF.max) p.max = String(v);
      if (mode !== MUSHI_DEF.mode) p.mode = mode;
    }
    regen(p);
  }, [op, mode, regen]);

  const onModeChange = useCallback((v: "add" | "sub" | "mixed") => {
    setMode(v);
    const p: Record<string, string> = {};
    if (op === "fill-blank") {
      if (max !== FILL_DEF.max) p.max = String(max);
      if (v !== FILL_DEF.mode) p.mode = v;
    } else if (op === "mushikui") {
      if (max !== MUSHI_DEF.max) p.max = String(max);
      if (v !== MUSHI_DEF.mode) p.mode = v;
    }
    regen(p);
  }, [op, max, regen]);

  const onBlankChange = useCallback((v: "any" | "product" | "factor") => {
    setBlank(v);
    const p: Record<string, string> = {};
    if (v !== KUKU_DEF.blank) p.blank = v;
    regen(p);
  }, [regen]);

  const onRemChange = useCallback((v: "none" | "yes" | "mixed") => {
    setRem(v);
    const p: Record<string, string> = {};
    if (v !== DIV_DEF.rem) p.rem = v;
    regen(p);
  }, [regen]);

  const onMmodeChange = useCallback((v: "add" | "sub" | "mixed") => {
    setMmode(v);
    const p: Record<string, string> = {};
    if (v !== MENTAL_DEF.mmode) p.mmode = v;
    regen(p);
  }, [regen]);

  const onParenChange = useCallback((v: boolean) => {
    setParen(v);
    const p: Record<string, string> = {};
    if (!v) p.paren = "0";
    regen(p);
  }, [regen]);

  const onErtoChange = useCallback((v: number) => {
    setErto(v);
    const p: Record<string, string> = {};
    if (v !== ERTO_DEF.erto) p.erto = String(v);
    regen(p);
  }, [regen]);

  const onTermsChange = useCallback((v: 2 | 3) => {
    setTerms(v);
    const p: Record<string, string> = {};
    if (v !== ADDSUB_DEF.terms) p.terms = String(v);
    regen(p);
  }, [regen]);

  const onMdmodeChange = useCallback((v: PosNegMulDivMode) => {
    setMdmode(v);
    const p: Record<string, string> = {};
    if (v !== MULDIV_DEF.mdmode) p.mdmode = v;
    regen(p);
  }, [regen]);

  const onMmmodeChange = useCallback((v: MonoMulDivMode) => {
    setMmmode(v);
    const p: Record<string, string> = {};
    if (v !== MONO_DEF.mmmode) p.mmmode = v;
    regen(p);
  }, [regen]);

  /* ---- generate problems ---- */

  const fillProblems = useMemo(
    () => op === "fill-blank" ? generateFillBlank(seed, max, mode) : [],
    [op, seed, max, mode],
  );
  const kukuProblems = useMemo(
    () => op === "kuku-blank" ? generateKukuBlank(seed, blank) : [],
    [op, seed, blank],
  );
  const mushikuiProblems = useMemo(
    () => op === "mushikui" ? generateMushikui(seed, max, mode) : [],
    [op, seed, max, mode],
  );
  const divProblems = useMemo(
    () => op === "division" ? generateDivision(seed, rem) : [],
    [op, seed, rem],
  );
  const mentalProblems = useMemo(
    () => op === "mental-math" ? generateMentalMath(seed, mmode) : [],
    [op, seed, mmode],
  );
  const mixedCalcProblems = useMemo(
    () => op === "mixed-calc" ? generateMixedCalc(seed, paren) : [],
    [op, seed, paren],
  );
  const divCheckProblems = useMemo(
    () => op === "div-check" ? generateDivCheck(seed) : [],
    [op, seed],
  );
  const calcTrickProblems = useMemo(
    () => op === "calc-trick" ? generateCalcTrick(seed) : [],
    [op, seed],
  );
  const estimateProblems = useMemo(
    () => op === "estimate" ? generateEstimate(seed, erto) : [],
    [op, seed, erto],
  );
  const fracMixedProblems = useMemo(
    () => op === "frac-mixed-calc" ? generateFracMixedCalc(seed) : [],
    [op, seed],
  );
  const addSubProblems = useMemo(
    () => op === "pos-neg-add-sub" ? generatePosNegAddSub(seed, terms) : [],
    [op, seed, terms],
  );
  const mulDivProblems = useMemo(
    () => op === "pos-neg-mul-div" ? generatePosNegMulDiv(seed, mdmode) : [],
    [op, seed, mdmode],
  );
  const posNegMixedProblems = useMemo(
    () => op === "pos-neg-mixed" ? generatePosNegMixed(seed) : [],
    [op, seed],
  );
  const polyProblems = useMemo(
    () => op === "poly-add-sub" ? generatePolyAddSub(seed) : [],
    [op, seed],
  );
  const monoProblems = useMemo(
    () => op === "mono-mul-div" ? generateMonoMulDiv(seed, mmmode) : [],
    [op, seed, mmmode],
  );

  /* ---- settings panel ---- */

  const renderSettings = () => {
    switch (op) {
      case "fill-blank":
        return (
          <div className="no-print settings-panel">
            <label>
              最大の数{" "}
              <select className="operator-select" value={max}
                onChange={(e) => onMaxChange(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </label>
            <label>
              計算{" "}
              <select className="operator-select" value={mode}
                onChange={(e) => onModeChange(e.target.value as any)}>
                <option value="mixed">たし算・ひき算</option>
                <option value="add">たし算のみ</option>
                <option value="sub">ひき算のみ</option>
              </select>
            </label>
          </div>
        );
      case "kuku-blank":
        return (
          <div className="no-print settings-panel">
            <label>
              □の位置{" "}
              <select className="operator-select" value={blank}
                onChange={(e) => onBlankChange(e.target.value as any)}>
                <option value="any">ランダム</option>
                <option value="product">答え（積）</option>
                <option value="factor">かけられる数・かける数</option>
              </select>
            </label>
          </div>
        );
      case "mushikui":
        return (
          <div className="no-print settings-panel">
            <label>
              最大の数{" "}
              <select className="operator-select" value={max}
                onChange={(e) => onMaxChange(Number(e.target.value))}>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </label>
            <label>
              計算{" "}
              <select className="operator-select" value={mode}
                onChange={(e) => onModeChange(e.target.value as any)}>
                <option value="mixed">たし算・ひき算</option>
                <option value="add">たし算のみ</option>
                <option value="sub">ひき算のみ</option>
              </select>
            </label>
          </div>
        );
      case "division":
        return (
          <div className="no-print settings-panel">
            <label>
              あまり{" "}
              <select className="operator-select" value={rem}
                onChange={(e) => onRemChange(e.target.value as any)}>
                <option value="mixed">あり・なし混合</option>
                <option value="none">あまりなし</option>
                <option value="yes">あまりあり</option>
              </select>
            </label>
          </div>
        );
      case "mental-math":
        return (
          <div className="no-print settings-panel">
            <label>
              計算{" "}
              <select className="operator-select" value={mmode}
                onChange={(e) => onMmodeChange(e.target.value as any)}>
                <option value="mixed">たし算・ひき算</option>
                <option value="add">たし算のみ</option>
                <option value="sub">ひき算のみ</option>
              </select>
            </label>
          </div>
        );
      case "mixed-calc":
        return (
          <div className="no-print settings-panel">
            <label>
              ( ) を含む{" "}
              <select className="operator-select" value={paren ? "1" : "0"}
                onChange={(e) => onParenChange(e.target.value === "1")}>
                <option value="1">あり</option>
                <option value="0">なし</option>
              </select>
            </label>
          </div>
        );
      case "div-check":
        return null;
      case "calc-trick":
        return null;
      case "estimate":
        return (
          <div className="no-print settings-panel">
            <label>
              概数の位{" "}
              <select className="operator-select" value={erto}
                onChange={(e) => onErtoChange(Number(e.target.value))}>
                <option value={10}>十の位</option>
                <option value={100}>百の位</option>
              </select>
            </label>
          </div>
        );
      case "frac-mixed-calc":
        return null;
      case "pos-neg-add-sub":
        return (
          <div className="no-print settings-panel">
            <label>
              項の数{" "}
              <select className="operator-select" value={terms}
                onChange={(e) => onTermsChange(Number(e.target.value) as 2 | 3)}>
                <option value={2}>2項</option>
                <option value={3}>3項</option>
              </select>
            </label>
          </div>
        );
      case "pos-neg-mul-div":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={mdmode}
                onChange={(e) => onMdmodeChange(e.target.value as PosNegMulDivMode)}>
                <option value="mixed">すべて</option>
                <option value="mul">乗法のみ</option>
                <option value="div">除法のみ</option>
                <option value="power">累乗のみ</option>
              </select>
            </label>
          </div>
        );
      case "pos-neg-mixed":
        return null;
      case "poly-add-sub":
        return null;
      case "mono-mul-div":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={mmmode}
                onChange={(e) => onMmmodeChange(e.target.value as MonoMulDivMode)}>
                <option value="mixed">すべて</option>
                <option value="mul">乗法のみ</option>
                <option value="div">除法のみ</option>
              </select>
            </label>
          </div>
        );
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

  const renderFracProblems = (problems: FracProblem[], opSymbol: string) => (
    <div className="g1-page g1-cols-2">
      {problems.map((p, i) => (
        <div key={i} className="g1-problem">
          <span className="g1-num">({i + 1})</span>
          <M tex={`\\frac{${p.aNum}}{${p.aDen}} ${unicodeToLatex(opSymbol)} \\frac{${p.bNum}}{${p.bDen}} = ${showAnswers ? texRed(texFrac(p.ansNum, p.ansDen, p.ansWhole, p.ansPartNum)) : texAns("?", false)}`} />
        </div>
      ))}
    </div>
  );

  /* ---- render problems ---- */

  const renderProblems = () => {
    switch (op) {
      case "fill-blank":
        return (
          <div className="g1-page g1-cols-2">
            {fillProblems.map((p, i) => {
              const left = p.left !== null ? String(p.left) : texBox(p.answer, showAnswers);
              const right = p.right !== null ? String(p.right) : texBox(p.answer, showAnswers);
              return (
                <div key={i} className="g1-problem">
                  <span className="g1-num">({i + 1})</span>
                  <M tex={`${left} ${p.op === "+" ? "+" : "-"} ${right} = ${p.result}`} />
                </div>
              );
            })}
          </div>
        );

      case "kuku-blank":
        return (
          <div className="g1-page g1-cols-3">
            {kukuProblems.map((p, i) => {
              const a = p.blankPos === "a" ? texBox(p.a, showAnswers) : String(p.a);
              const b = p.blankPos === "b" ? texBox(p.b, showAnswers) : String(p.b);
              const prod = p.blankPos === "product" ? texBox(p.product, showAnswers) : String(p.product);
              return (
                <div key={i} className="g1-problem">
                  <span className="g1-num">({i + 1})</span>
                  <M tex={`${a} \\times ${b} = ${prod}`} />
                </div>
              );
            })}
          </div>
        );

      case "mushikui":
        return (
          <div className="g1-page g1-cols-2">
            {mushikuiProblems.map((p, i) => {
              const left = p.left !== null ? String(p.left) : texBox(p.answer, showAnswers);
              const right = p.right !== null ? String(p.right) : texBox(p.answer, showAnswers);
              const result = p.result !== null ? String(p.result) : texBox(p.answer, showAnswers);
              return (
                <div key={i} className="g1-problem">
                  <span className="g1-num">({i + 1})</span>
                  <M tex={`${left} ${p.op === "+" ? "+" : "-"} ${right} = ${result}`} />
                </div>
              );
            })}
          </div>
        );

      case "division":
        return (
          <div className="g1-page g1-cols-3">
            {divProblems.map((p, i) => {
              const rem = p.remainder > 0
                ? `\\text{ あまり }${texBox(p.remainder, showAnswers)}`
                : "";
              return (
                <div key={i} className="g1-problem">
                  <span className="g1-num">({i + 1})</span>
                  <M tex={`${p.dividend} \\div ${p.divisor} = ${texBox(p.quotient, showAnswers)}${rem}`} />
                </div>
              );
            })}
          </div>
        );

      case "mental-math":
        return (
          <div className="g1-page g1-cols-4">
            {mentalProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <M tex={`${p.left} ${p.op === "+" ? "+" : "-"} ${p.right} = ${texBox(p.answer, showAnswers)}`} />
              </div>
            ))}
          </div>
        );

      case "mixed-calc":
        return (
          <div className="g1-page g1-cols-2">
            {mixedCalcProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <M tex={`${unicodeToLatex(p.display)} = ${texAns(p.answer, showAnswers)}`} />
              </div>
            ))}
          </div>
        );

      case "div-check":
        return renderTextProblems(divCheckProblems);

      case "calc-trick":
        return renderTextProblems(calcTrickProblems);

      case "estimate":
        return renderTextProblems(estimateProblems);

      case "frac-mixed-calc":
        return renderFracProblems(fracMixedProblems, "\u00d7");

      case "pos-neg-add-sub":
        return (
          <div className="g1-page g1-cols-2">
            {addSubProblems.map((p, i) => {
              const parts = p.terms.map((t, j) => {
                const sign = j === 0 ? "" : (t >= 0 ? "+" : "-");
                const val = j === 0
                  ? `(${t >= 0 ? "+" : ""}${t})`
                  : `(${t >= 0 ? "+" : ""}${Math.abs(t)})`;
                return `${sign} ${val}`;
              }).join(" ");
              return (
                <div key={i} className="g1-problem">
                  <span className="g1-num">({i + 1})</span>
                  <M tex={`${parts} = ${texAns(p.answer, showAnswers)}`} />
                </div>
              );
            })}
          </div>
        );

      case "pos-neg-mul-div":
        return (
          <div className="g1-page g1-cols-2">
            {mulDivProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <M tex={`${unicodeToLatex(p.expr)} = ${texAns(p.answer, showAnswers)}`} />
              </div>
            ))}
          </div>
        );

      case "pos-neg-mixed":
        return (
          <div className="g1-page g1-cols-2">
            {posNegMixedProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <M tex={`${unicodeToLatex(p.expr)} = ${texAns(p.answer, showAnswers)}`} />
              </div>
            ))}
          </div>
        );

      case "poly-add-sub":
        return (
          <div className="g1-page g1-cols-2">
            {polyProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  <M tex={`${unicodeToLatex(p.expr)} =`} />
                  <span className={showAnswers ? "" : "g1-hidden"}>
                    <M tex={texRed(unicodeToLatex(p.answerExpr))} />
                  </span>
                </span>
              </div>
            ))}
          </div>
        );

      case "mono-mul-div":
        return (
          <div className="g1-page g1-cols-2">
            {monoProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  <M tex={`${unicodeToLatex(p.expr)} =`} />
                  <span className={showAnswers ? "" : "g1-hidden"}>
                    <M tex={texRed(unicodeToLatex(p.answerExpr))} />
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

export const computation: ProblemGroup = {
  id: "computation",
  label: "計算",
  operators: [
    { operator: "fill-blank", label: "穴埋め加減", grades: [1], category: "computation" },
    { operator: "kuku-blank", label: "九九の穴埋め", grades: [2], category: "computation" },
    { operator: "mushikui", label: "虫食い算", grades: [2], category: "computation" },
    { operator: "division", label: "わり算", grades: [3], category: "computation" },
    { operator: "mental-math", label: "暗算", grades: [3], category: "computation" },
    { operator: "mixed-calc", label: "四則混合", grades: [4], category: "computation" },
    { operator: "div-check", label: "わり算の検算", grades: [4], category: "computation" },
    { operator: "calc-trick", label: "計算のくふう", grades: [4], category: "computation" },
    { operator: "estimate", label: "見積もり", grades: [4], category: "computation" },
    { operator: "frac-mixed-calc", label: "分数の四則混合", grades: [6], category: "computation" },
    { operator: "pos-neg-add-sub", label: "正負の加減", grades: [7], category: "computation" },
    { operator: "pos-neg-mul-div", label: "正負の乗除", grades: [7], category: "computation" },
    { operator: "pos-neg-mixed", label: "正負の四則混合", grades: [7], category: "computation" },
    { operator: "poly-add-sub", label: "多項式の加減", grades: [8], category: "computation" },
    { operator: "mono-mul-div", label: "単項式の乗除", grades: [8], category: "computation" },
  ],
  Component: Computation,
};
