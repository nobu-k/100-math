import { useState, useCallback, useMemo } from "react";
import type { ProblemGroup } from "./types";
import type { FracProblem } from "./fractions/types";
import type { TextProblem } from "./shared/types";
import { Box } from "./shared/Box";
import { Frac } from "./shared/Frac";
import useProblemPage from "./shared/useProblemPage";
import ProblemPageLayout from "./shared/ProblemPageLayout";
import { generateDecimalComp } from "./fractions/decimal-comp";
import { generateFracConv } from "./fractions/frac-conv";
import { generateFracDecimal } from "./fractions/frac-decimal";
import { generateDiffFrac } from "./fractions/diff-frac";
import { generateFracCompare } from "./fractions/frac-compare";
import { generateDecimalShift } from "./fractions/decimal-shift";
import { generateFracMul } from "./fractions/frac-mul";
import { generateFracDiv } from "./fractions/frac-div";

/* ================================================================
   Types
   ================================================================ */

type FractionsOp =
  | "decimal-comp"
  | "frac-conv"
  | "frac-decimal"
  | "diff-frac"
  | "frac-compare"
  | "decimal-shift"
  | "frac-mul"
  | "frac-div";

/* ================================================================
   Defaults
   ================================================================ */

const DCOMP_DEF = { dmax: 10 };
const FCONV_DEF = { fdir: "both" as const };
const FDEC_DEF = { fdir: "mixed" as const };
const DFRAC_DEF = { dfop: "mixed" as const };

/* ================================================================
   URL param keys
   ================================================================ */

const PARAM_KEYS = ["dmax", "fdir", "dfop"];

/* ================================================================
   Main component
   ================================================================ */

const FractionsComponent = ({ operator }: { operator: string }) => {
  const op = operator as FractionsOp;

  /* ---- parse initial settings from URL ---- */

  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);

    const dmax = Math.max(5, Math.min(100,
      parseInt(p.get("dmax") ?? String(DCOMP_DEF.dmax), 10) || DCOMP_DEF.dmax));

    const fconvRaw = p.get("fdir") ?? FCONV_DEF.fdir;
    const fconv: "to-mixed" | "to-improper" | "both" =
      (["to-mixed", "to-improper", "both"] as const).includes(fconvRaw as any)
        ? (fconvRaw as any) : FCONV_DEF.fdir;

    const fdecRaw = p.get("fdir") ?? FDEC_DEF.fdir;
    const fdec: "to-decimal" | "to-fraction" | "mixed" =
      (["to-decimal", "to-fraction", "mixed"] as const).includes(fdecRaw as any)
        ? (fdecRaw as any) : FDEC_DEF.fdir;

    const dfopRaw = p.get("dfop") ?? DFRAC_DEF.dfop;
    const dfop: "add" | "sub" | "mixed" =
      (["add", "sub", "mixed"] as const).includes(dfopRaw as any)
        ? (dfopRaw as any) : DFRAC_DEF.dfop;

    return { dmax, fconv, fdec, dfop };
  });

  const [dmax, setDmax] = useState(initial.dmax);
  const [fconv, setFconv] = useState(initial.fconv);
  const [fdec, setFdec] = useState(initial.fdec);
  const [dfop, setDfop] = useState(initial.dfop);

  /* ---- useProblemPage ---- */

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    switch (op) {
      case "decimal-comp":
        if (dmax !== DCOMP_DEF.dmax) m.dmax = String(dmax);
        break;
      case "frac-conv":
        if (fconv !== FCONV_DEF.fdir) m.fdir = fconv;
        break;
      case "frac-decimal":
        if (fdec !== FDEC_DEF.fdir) m.fdir = fdec;
        break;
      case "diff-frac":
        if (dfop !== DFRAC_DEF.dfop) m.dfop = dfop;
        break;
      case "frac-compare":
      case "decimal-shift":
      case "frac-mul":
      case "frac-div":
        break;
    }
    return m;
  }, [op, dmax, fconv, fdec, dfop]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  /* ---- settings change handlers ---- */

  const onDmaxChange = useCallback((v: number) => {
    setDmax(v);
    const p: Record<string, string> = {};
    if (v !== DCOMP_DEF.dmax) p.dmax = String(v);
    regen(p);
  }, [regen]);

  const onFconvChange = useCallback((v: "to-mixed" | "to-improper" | "both") => {
    setFconv(v);
    const p: Record<string, string> = {};
    if (v !== FCONV_DEF.fdir) p.fdir = v;
    regen(p);
  }, [regen]);

  const onFdecChange = useCallback((v: "to-decimal" | "to-fraction" | "mixed") => {
    setFdec(v);
    const p: Record<string, string> = {};
    if (v !== FDEC_DEF.fdir) p.fdir = v;
    regen(p);
  }, [regen]);

  const onDfopChange = useCallback((v: "add" | "sub" | "mixed") => {
    setDfop(v);
    const p: Record<string, string> = {};
    if (v !== DFRAC_DEF.dfop) p.dfop = v;
    regen(p);
  }, [regen]);

  /* ---- generate problems ---- */

  const decimalProblems = useMemo(
    () => op === "decimal-comp" ? generateDecimalComp(seed, dmax) : [],
    [op, seed, dmax],
  );
  const fracConvProblems = useMemo(
    () => op === "frac-conv" ? generateFracConv(seed, fconv) : [],
    [op, seed, fconv],
  );
  const fracDecProblems = useMemo(
    () => op === "frac-decimal" ? generateFracDecimal(seed, fdec) : [],
    [op, seed, fdec],
  );
  const diffFracProblems = useMemo(
    () => op === "diff-frac" ? generateDiffFrac(seed, dfop) : [],
    [op, seed, dfop],
  );
  const fcProblems = useMemo(
    () => op === "frac-compare" ? generateFracCompare(seed) : [],
    [op, seed],
  );
  const dsProblems = useMemo(
    () => op === "decimal-shift" ? generateDecimalShift(seed) : [],
    [op, seed],
  );
  const fracMulProblems = useMemo(
    () => op === "frac-mul" ? generateFracMul(seed) : [],
    [op, seed],
  );
  const fracDivProblems = useMemo(
    () => op === "frac-div" ? generateFracDiv(seed) : [],
    [op, seed],
  );

  /* ---- settings panel ---- */

  const renderSettings = () => {
    switch (op) {
      case "decimal-comp":
        return (
          <div className="no-print settings-panel">
            <label>
              最大の数{" "}
              <select className="operator-select" value={dmax}
                onChange={(e) => onDmaxChange(Number(e.target.value))}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={100}>100</option>
              </select>
            </label>
          </div>
        );
      case "frac-conv":
        return (
          <div className="no-print settings-panel">
            <label>
              変換方向{" "}
              <select className="operator-select" value={fconv}
                onChange={(e) => onFconvChange(e.target.value as any)}>
                <option value="both">両方</option>
                <option value="to-mixed">仮分数→帯分数</option>
                <option value="to-improper">帯分数→仮分数</option>
              </select>
            </label>
          </div>
        );
      case "frac-decimal":
        return (
          <div className="no-print settings-panel">
            <label>
              変換方向{" "}
              <select className="operator-select" value={fdec}
                onChange={(e) => onFdecChange(e.target.value as any)}>
                <option value="mixed">両方</option>
                <option value="to-decimal">分数→小数</option>
                <option value="to-fraction">小数→分数</option>
              </select>
            </label>
          </div>
        );
      case "diff-frac":
        return (
          <div className="no-print settings-panel">
            <label>
              演算{" "}
              <select className="operator-select" value={dfop}
                onChange={(e) => onDfopChange(e.target.value as any)}>
                <option value="mixed">たし算・ひき算</option>
                <option value="add">たし算のみ</option>
                <option value="sub">ひき算のみ</option>
              </select>
            </label>
          </div>
        );
      case "frac-compare":
      case "decimal-shift":
      case "frac-mul":
      case "frac-div":
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
          <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
            {p.answer}
          </span>
        </div>
      ))}
    </div>
  );

  const renderFracProblems = (problems: FracProblem[], opSymbol: string) => (
    <div className="g1-page g1-cols-2">
      {problems.map((p, i) => (
        <div key={i} className="g1-problem">
          <span className="g1-num">({i + 1})</span>
          <span className="g1-expr" style={{ alignItems: "center" }}>
            <Frac num={p.aNum} den={p.aDen} />
            <span className="g1-op">{opSymbol}</span>
            <Frac num={p.bNum} den={p.bDen} />
            <span className="g1-op">=</span>
            <span className={showAnswers ? "" : "g1-hidden"}>
              {p.ansWhole !== undefined && p.ansPartNum !== undefined ? (
                <>
                  <span className="dev-frac-ans">{p.ansWhole}</span>
                  <Frac num={p.ansPartNum} den={p.ansDen} cls="dev-frac-ans" />
                </>
              ) : p.ansNum % p.ansDen === 0 ? (
                <span className="dev-frac-ans">{p.ansNum / p.ansDen}</span>
              ) : (
                <Frac num={p.ansNum} den={p.ansDen} cls="dev-frac-ans" />
              )}
            </span>
          </span>
        </div>
      ))}
    </div>
  );

  /* ---- render problems ---- */

  const renderProblems = () => {
    switch (op) {
      case "decimal-comp":
        return (
          <div className="g1-page g1-cols-3">
            {decimalProblems.map((p, i) => (
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

      case "frac-conv":
        return (
          <div className="dev-text-page">
            {fracConvProblems.map((p, i) => (
              <div key={i} className="dev-text-row dev-frac-row">
                <span className="g1-num">({i + 1})</span>
                {p.direction === "to-mixed" ? (
                  <>
                    <Frac num={p.fromNum!} den={p.fromDen!} />
                    <span className="dev-text-arrow">&rarr;</span>
                    <span className={showAnswers ? "" : "g1-hidden"}>
                      <span className="dev-frac-ans">{p.toWhole}</span>
                      <Frac num={p.toNum!} den={p.toDen!} cls="dev-frac-ans" />
                    </span>
                  </>
                ) : (
                  <>
                    <span>{p.fromWhole}</span>
                    <Frac num={p.fromNum!} den={p.fromDen!} />
                    <span className="dev-text-arrow">&rarr;</span>
                    <span className={showAnswers ? "" : "g1-hidden"}>
                      <Frac num={p.toNum!} den={p.toDen!} cls="dev-frac-ans" />
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        );

      case "frac-decimal":
        return renderTextProblems(fracDecProblems);

      case "diff-frac":
        return (
          <div className="g1-page g1-cols-2">
            {diffFracProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr" style={{ alignItems: "center" }}>
                  <Frac num={p.aNum} den={p.aDen} />
                  <span className="g1-op">{p.op}</span>
                  <Frac num={p.bNum} den={p.bDen} />
                  <span className="g1-op">=</span>
                  <span className={showAnswers ? "" : "g1-hidden"}>
                    {p.ansWhole !== undefined && p.ansPartNum !== undefined ? (
                      <>
                        <span className="dev-frac-ans">{p.ansWhole}</span>
                        <Frac num={p.ansPartNum} den={p.ansDen} cls="dev-frac-ans" />
                      </>
                    ) : p.ansNum % p.ansDen === 0 ? (
                      <span className="dev-frac-ans">{p.ansNum / p.ansDen}</span>
                    ) : (
                      <Frac num={p.ansNum} den={p.ansDen} cls="dev-frac-ans" />
                    )}
                  </span>
                </span>
              </div>
            ))}
          </div>
        );

      case "frac-compare":
        return (
          <div className="g1-page g1-cols-2">
            {fcProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr" style={{ alignItems: "center" }}>
                  <Frac num={p.aNum} den={p.aDen} />
                  <Box answer={p.answer} show={showAnswers} />
                  <Frac num={p.bNum} den={p.bDen} />
                </span>
              </div>
            ))}
          </div>
        );

      case "decimal-shift":
        return renderTextProblems(dsProblems);

      case "frac-mul":
        return renderFracProblems(fracMulProblems, "\u00d7");

      case "frac-div":
        return renderFracProblems(fracDivProblems, "\u00f7");

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

export const fractions: ProblemGroup = {
  id: "fractions",
  label: "分数・小数",
  operators: [
    { operator: "decimal-comp", label: "小数の大小比較", grades: [3], category: "fractions" },
    { operator: "frac-conv", label: "分数の変換", grades: [4], category: "fractions" },
    { operator: "frac-decimal", label: "分数と小数", grades: [5], category: "fractions" },
    { operator: "diff-frac", label: "異分母分数の加減", grades: [5], category: "fractions" },
    { operator: "frac-compare", label: "分数の大小比較", grades: [5], category: "fractions" },
    { operator: "decimal-shift", label: "小数点の移動", grades: [5], category: "fractions" },
    { operator: "frac-mul", label: "分数×分数", grades: [6], category: "fractions" },
    { operator: "frac-div", label: "分数÷分数", grades: [6], category: "fractions" },
  ],
  Component: FractionsComponent,
};
