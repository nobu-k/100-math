import React, { useState, useCallback, useMemo } from "react";
import type { ProblemGroup } from "./types";
import type { TextProblem } from "./shared/types";
import type { CoordinateProblem, CoordinateMode } from "./relations/coordinate";
import type { LinearFuncMode } from "./relations/linear-func";
import type { QuadFuncMode } from "./relations/quadratic-func";
import type { ProportionMode } from "./relations/proportion-eq";
import useProblemPage from "./shared/useProblemPage";
import ProblemPageLayout from "./shared/ProblemPageLayout";
import { generatePatternTable } from "./relations/pattern-table";
import { generatePercent } from "./relations/percent";
import { generateRatio } from "./relations/ratio";
import { generateProportion as generateProportionTable } from "./relations/proportion-table";
import { generateProportion as generateProportionEq } from "./relations/proportion-eq";
import { generateCoordinate } from "./relations/coordinate";
import { generateLinearFunc } from "./relations/linear-func";
import { generateQuadFunc } from "./relations/quadratic-func";

/* ================================================================
   Types
   ================================================================ */

type RelationsOp =
  | "pattern-table"
  | "percent"
  | "ratio"
  | "proportion-table"
  | "proportion-eq"
  | "coordinate"
  | "linear-func"
  | "quadratic-func";

/* ================================================================
   Defaults
   ================================================================ */

const PERCENT_DEF = { pfind: "mixed" as const };
const RATIO_DEF = { rtype: "mixed" as const };
const PROP_TABLE_DEF = { ptype: "mixed" as const };
const PROP_EQ_DEF = { propmode: "mixed" as ProportionMode };
const COORD_DEF = { comode: "mixed" as CoordinateMode };
const LIN_FUNC_DEF = { lfmode: "mixed" as LinearFuncMode };
const QUAD_FUNC_DEF = { qfmode: "mixed" as QuadFuncMode };

/* ================================================================
   URL param keys for this category
   ================================================================ */

const PARAM_KEYS = ["pfind", "rtype", "ptype", "propmode", "comode", "lfmode", "qfmode"];

/* ================================================================
   Main component
   ================================================================ */

const Relations = ({ operator }: { operator: string }) => {
  const op = operator as RelationsOp;

  /* ---- parse initial URL settings ---- */

  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);

    const pfindRaw = p.get("pfind") ?? PERCENT_DEF.pfind;
    const pfind: "mixed" | "ratio" | "compared" | "base" =
      (["mixed", "ratio", "compared", "base"] as const).includes(pfindRaw as any)
        ? (pfindRaw as any) : PERCENT_DEF.pfind;

    const rtypeRaw = p.get("rtype") ?? RATIO_DEF.rtype;
    const rtype: "mixed" | "simplify" | "fill" =
      (["mixed", "simplify", "fill"] as const).includes(rtypeRaw as any)
        ? (rtypeRaw as any) : RATIO_DEF.rtype;

    const ptypeRaw = p.get("ptype") ?? PROP_TABLE_DEF.ptype;
    const ptype: "mixed" | "direct" | "inverse" =
      (["mixed", "direct", "inverse"] as const).includes(ptypeRaw as any)
        ? (ptypeRaw as any) : PROP_TABLE_DEF.ptype;

    const propmodeRaw = p.get("propmode") ?? PROP_EQ_DEF.propmode;
    const propmode = (["mixed", "direct", "inverse"] as const).includes(propmodeRaw as any)
      ? (propmodeRaw as ProportionMode) : PROP_EQ_DEF.propmode;

    const comodeRaw = p.get("comode") ?? COORD_DEF.comode;
    const comode = (["mixed", "quadrant", "on-graph"] as const).includes(comodeRaw as any)
      ? (comodeRaw as CoordinateMode) : COORD_DEF.comode;

    const lfmodeRaw = p.get("lfmode") ?? LIN_FUNC_DEF.lfmode;
    const lfmode = (["mixed", "slope-intercept", "two-points", "rate-of-change"] as const).includes(lfmodeRaw as any)
      ? (lfmodeRaw as LinearFuncMode) : LIN_FUNC_DEF.lfmode;

    const qfmodeRaw = p.get("qfmode") ?? QUAD_FUNC_DEF.qfmode;
    const qfmode = (["mixed", "value", "rate-of-change", "graph"] as const).includes(qfmodeRaw as any)
      ? (qfmodeRaw as QuadFuncMode) : QUAD_FUNC_DEF.qfmode;

    return { pfind, rtype, ptype, propmode, comode, lfmode, qfmode };
  });

  /* ---- per-operator settings state ---- */

  const [pfind, setPfind] = useState(initial.pfind);
  const [rtype, setRtype] = useState(initial.rtype);
  const [ptype, setPtype] = useState(initial.ptype);
  const [propmode, setPropmode] = useState(initial.propmode);
  const [comode, setComode] = useState(initial.comode);
  const [lfmode, setLfmode] = useState(initial.lfmode);
  const [qfmode, setQfmode] = useState(initial.qfmode);

  /* ---- getSettingsParams ---- */

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    switch (op) {
      case "pattern-table":
        break;
      case "percent":
        if (pfind !== PERCENT_DEF.pfind) m.pfind = pfind;
        break;
      case "ratio":
        if (rtype !== RATIO_DEF.rtype) m.rtype = rtype;
        break;
      case "proportion-table":
        if (ptype !== PROP_TABLE_DEF.ptype) m.ptype = ptype;
        break;
      case "proportion-eq":
        if (propmode !== PROP_EQ_DEF.propmode) m.propmode = propmode;
        break;
      case "coordinate":
        if (comode !== COORD_DEF.comode) m.comode = comode;
        break;
      case "linear-func":
        if (lfmode !== LIN_FUNC_DEF.lfmode) m.lfmode = lfmode;
        break;
      case "quadratic-func":
        if (qfmode !== QUAD_FUNC_DEF.qfmode) m.qfmode = qfmode;
        break;
    }
    return m;
  }, [op, pfind, rtype, ptype, propmode, comode, lfmode, qfmode]);

  /* ---- shared hook ---- */

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

  const patternTableProblems = useMemo(
    () => op === "pattern-table" ? generatePatternTable(seed) : [],
    [op, seed],
  );
  const percentProblems = useMemo(
    () => op === "percent" ? generatePercent(seed, pfind) : [],
    [op, seed, pfind],
  );
  const ratioProblems = useMemo(
    () => op === "ratio" ? generateRatio(seed, rtype) : [],
    [op, seed, rtype],
  );
  const propTableProblems = useMemo(
    () => op === "proportion-table" ? generateProportionTable(seed, ptype) : [],
    [op, seed, ptype],
  );
  const propEqProblems = useMemo(
    () => op === "proportion-eq" ? generateProportionEq(seed, propmode) : [],
    [op, seed, propmode],
  );
  const coordProblems = useMemo(
    () => op === "coordinate" ? generateCoordinate(seed, comode) : [],
    [op, seed, comode],
  );
  const linFuncProblems = useMemo(
    () => op === "linear-func" ? generateLinearFunc(seed, lfmode) : [],
    [op, seed, lfmode],
  );
  const quadFuncProblems = useMemo(
    () => op === "quadratic-func" ? generateQuadFunc(seed, qfmode) : [],
    [op, seed, qfmode],
  );

  /* ---- settings panel ---- */

  const renderSettings = () => {
    switch (op) {
      case "pattern-table":
        return null;
      case "percent":
        return (
          <div className="no-print settings-panel">
            <label>
              求めるもの{" "}
              <select className="operator-select" value={pfind}
                onChange={(e) => onSettingChange(setPfind, "pfind", PERCENT_DEF.pfind)(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="ratio">割合（何%？）</option>
                <option value="compared">比べる量</option>
                <option value="base">もとにする量</option>
              </select>
            </label>
          </div>
        );
      case "ratio":
        return (
          <div className="no-print settings-panel">
            <label>
              問題の種類{" "}
              <select className="operator-select" value={rtype}
                onChange={(e) => onSettingChange(setRtype, "rtype", RATIO_DEF.rtype)(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="simplify">簡単な比にする</option>
                <option value="fill">穴埋め</option>
              </select>
            </label>
          </div>
        );
      case "proportion-table":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={ptype}
                onChange={(e) => onSettingChange(setPtype, "ptype", PROP_TABLE_DEF.ptype)(e.target.value as any)}>
                <option value="mixed">比例・反比例</option>
                <option value="direct">比例のみ</option>
                <option value="inverse">反比例のみ</option>
              </select>
            </label>
          </div>
        );
      case "proportion-eq":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={propmode}
                onChange={(e) => onSettingChange(setPropmode, "propmode", PROP_EQ_DEF.propmode)(e.target.value as any)}>
                <option value="mixed">比例・反比例</option>
                <option value="direct">比例のみ</option>
                <option value="inverse">反比例のみ</option>
              </select>
            </label>
          </div>
        );
      case "coordinate":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={comode}
                onChange={(e) => onSettingChange(setComode, "comode", COORD_DEF.comode)(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="quadrant">象限の判定</option>
                <option value="on-graph">グラフ上の点</option>
              </select>
            </label>
          </div>
        );
      case "linear-func":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={lfmode}
                onChange={(e) => onSettingChange(setLfmode, "lfmode", LIN_FUNC_DEF.lfmode)(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="slope-intercept">傾き・切片</option>
                <option value="two-points">2点から</option>
                <option value="rate-of-change">変化の割合</option>
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
                onChange={(e) => onSettingChange(setQfmode, "qfmode", QUAD_FUNC_DEF.qfmode)(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="value">値を求める</option>
                <option value="rate-of-change">変化の割合</option>
                <option value="graph">グラフ</option>
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

  const renderTableProblems = (problems: { label: string; xValues: number[]; yValues: (number | null)[]; answers: number[] }[]) => (
    <div className="dev-text-page">
      {problems.map((p, idx) => {
        let ansIdx = 0;
        return (
          <div key={idx} className="dev-prop-block">
            <div className="dev-prop-label">({idx + 1}) {p.label}</div>
            <table className="dev-prop-table">
              <thead><tr><th>x</th>{p.xValues.map((x, j) => <th key={j}>{x}</th>)}</tr></thead>
              <tbody>
                <tr>
                  <td>y</td>
                  {p.yValues.map((y, j) => {
                    if (y !== null) return <td key={j}>{y}</td>;
                    const ans = p.answers[ansIdx++];
                    return (
                      <td key={j} className="dev-prop-blank">
                        <span className={showAnswers ? "dev-frac-ans" : "g1-hidden"}>{ans}</span>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );

  const renderCoordinateFigure = (p: CoordinateProblem) => {
    const W = 200; const H = 200;
    const cx = W / 2; const cy = H / 2;
    const axisLen = 80; const scale = 8;
    const toSvgX = (v: number) => cx + v * scale;
    const toSvgY = (v: number) => cy - v * scale;
    const gridLines: React.ReactNode[] = [];
    for (let v = -8; v <= 8; v += 2) {
      if (v === 0) continue;
      gridLines.push(
        <line key={`gx${v}`} x1={toSvgX(v)} y1={cy - axisLen} x2={toSvgX(v)} y2={cy + axisLen} stroke="#eee" strokeWidth={0.5} />,
        <line key={`gy${v}`} x1={cx - axisLen} y1={toSvgY(v)} x2={cx + axisLen} y2={toSvgY(v)} stroke="#eee" strokeWidth={0.5} />,
      );
    }
    const px = toSvgX(p.x); const py = toSvgY(p.y);
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        {gridLines}
        <line x1={cx - axisLen} y1={cy} x2={cx + axisLen} y2={cy} stroke="#333" strokeWidth={1} />
        <line x1={cx} y1={cy + axisLen} x2={cx} y2={cy - axisLen} stroke="#333" strokeWidth={1} />
        <polygon points={`${cx + axisLen},${cy} ${cx + axisLen - 5},${cy - 3} ${cx + axisLen - 5},${cy + 3}`} fill="#333" />
        <polygon points={`${cx},${cy - axisLen} ${cx - 3},${cy - axisLen + 5} ${cx + 3},${cy - axisLen + 5}`} fill="#333" />
        <text x={cx + axisLen + 4} y={cy + 4} fontSize={10} fill="#333">x</text>
        <text x={cx + 4} y={cy - axisLen - 2} fontSize={10} fill="#333">y</text>
        <text x={cx - 10} y={cy + 12} fontSize={9} fill="#333">O</text>
        <text x={cx + 35} y={cy - 35} textAnchor="middle" fontSize={10} fill="#ddd">I</text>
        <text x={cx - 35} y={cy - 35} textAnchor="middle" fontSize={10} fill="#ddd">II</text>
        <text x={cx - 35} y={cy + 42} textAnchor="middle" fontSize={10} fill="#ddd">III</text>
        <text x={cx + 35} y={cy + 42} textAnchor="middle" fontSize={10} fill="#ddd">IV</text>
        {p.type === "on-graph" && p.formulaA != null && (
          <>
            <line x1={toSvgX(-8)} y1={toSvgY(-8 * p.formulaA)} x2={toSvgX(8)} y2={toSvgY(8 * p.formulaA)}
              stroke="#1976d2" strokeWidth={1} opacity={0.6} clipPath="url(#coordClip)" />
            <defs>
              <clipPath id="coordClip">
                <rect x={cx - axisLen} y={cy - axisLen} width={axisLen * 2} height={axisLen * 2} />
              </clipPath>
            </defs>
          </>
        )}
        <circle cx={px} cy={py} r={4} fill="#d32f2f" />
        <text x={px + 6} y={py - 6} fontSize={10} fill="#d32f2f" fontWeight="bold">({p.x}, {p.y})</text>
      </svg>
    );
  };

  /* ---- render problems ---- */

  const renderProblems = () => {
    switch (op) {
      case "pattern-table":
        return renderTableProblems(patternTableProblems);

      case "percent":
        return renderTextProblems(percentProblems);

      case "ratio":
        return (
          <div className="dev-text-page">
            {ratioProblems.map((p, i) => (
              <div key={i} className="dev-text-row">
                <span className="g1-num">({i + 1})</span>
                <span className="dev-text-q">{p.question}</span>
                <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.answer}</span>
              </div>
            ))}
          </div>
        );

      case "proportion-table":
        return renderTableProblems(propTableProblems);

      case "proportion-eq":
        return (
          <div className="dev-text-page">
            {propEqProblems.map((p, i) => (
              <div key={i} className="dev-text-row">
                <span className="g1-num">({i + 1})</span>
                <span className="dev-text-q">{p.question}</span>
                <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.answerDisplay}</span>
              </div>
            ))}
          </div>
        );

      case "coordinate":
        return (
          <div className="dev-fig-page">
            {coordProblems.map((p, i) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1})</div>
                {renderCoordinateFigure(p)}
                <div style={{ marginTop: 8 }}>
                  <div className="dev-text-row">
                    <span className="dev-text-q">
                      {p.type === "quadrant" ? `点 (${p.x}, ${p.y}) は第何象限？` : `${p.formula} のグラフは点 (${p.x}, ${p.y}) を通るか？`}
                    </span>
                    <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.answerDisplay}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "linear-func":
        return (
          <div className="dev-text-page">
            {linFuncProblems.map((p, i) => (
              <div key={i} className="dev-text-row">
                <span className="g1-num">({i + 1})</span>
                <span className="dev-text-q">{p.question}</span>
                <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.answerDisplay}</span>
              </div>
            ))}
          </div>
        );

      case "quadratic-func":
        return (
          <div className="dev-text-page">
            {quadFuncProblems.map((p, i) => (
              <div key={i} className="dev-text-row">
                <span className="g1-num">({i + 1})</span>
                <span className="dev-text-q">{p.question}</span>
                <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.answerDisplay}</span>
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

export const relations: ProblemGroup = {
  id: "relations",
  label: "変化と関係",
  operators: [
    { operator: "pattern-table", label: "変わり方と表", grades: [4], category: "relations" },
    { operator: "percent", label: "割合と百分率", grades: [5], category: "relations" },
    { operator: "ratio", label: "比", grades: [6], category: "relations" },
    { operator: "proportion-table", label: "比例と反比例", grades: [6], category: "relations" },
    { operator: "proportion-eq", label: "比例・反比例", grades: [7], category: "relations" },
    { operator: "coordinate", label: "座標", grades: [7], category: "relations" },
    { operator: "linear-func", label: "一次関数", grades: [8], category: "relations" },
    { operator: "quadratic-func", label: "関数 y=ax²", grades: [9], category: "relations" },
  ],
  Component: Relations,
};
