import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { randomSeed, seedToHex, hexToSeed } from "../random";
import type { ProblemGroup } from "../types";
import type { FracProblem, CircleAreaProblem } from "./generators";
import {
  generateFracMul,
  generateFracDiv,
  generateRatio,
  generateCircleArea,
  generateProportion,
  generateLiteralExpr,
  generateRepresentative,
  generateCounting,
  generatePrismVolume,
  generateScale,
  generateFracMixedCalc,
  generateFreqTable,
} from "./generators";
import { Frac } from "../shared/Frac";

/* ================================================================
   Types
   ================================================================ */

type Grade6Op =
  | "frac-mul"
  | "frac-div"
  | "ratio"
  | "circle-area"
  | "proportion"
  | "literal-expr"
  | "representative"
  | "counting"
  | "prism-volume"
  | "scale"
  | "frac-mixed-calc"
  | "freq-table";

/* ================================================================
   URL state helpers
   ================================================================ */

const ALL_PARAMS = ["q", "answers", "rtype", "ctype", "ptype", "repfind", "pvshape"];

const cleanParams = (url: URL) => {
  for (const k of ALL_PARAMS) url.searchParams.delete(k);
};

/* ================================================================
   Defaults
   ================================================================ */

const RATIO_DEF = { rtype: "mixed" as const };
const CIRCLE_DEF = { ctype: "mixed" as const };
const PROP_DEF = { ptype: "mixed" as const };
const REP_DEF = { repfind: "mixed" as const };
const PV_DEF = { pvshape: "mixed" as const };

/* ================================================================
   Main component
   ================================================================ */

const Grade6 = ({ operator }: { operator: string }) => {
  const op = operator as Grade6Op;

  const getInitial = () => {
    const p = new URLSearchParams(window.location.search);
    const qHex = p.get("q");
    const seed = qHex ? hexToSeed(qHex) ?? randomSeed() : randomSeed();
    const showAnswers = p.get("answers") === "1";

    const rtypeRaw = p.get("rtype") ?? RATIO_DEF.rtype;
    const rtype: "simplify" | "fill" | "mixed" =
      (["simplify", "fill", "mixed"] as const).includes(rtypeRaw as any)
        ? (rtypeRaw as any) : RATIO_DEF.rtype;

    const ctypeRaw = p.get("ctype") ?? CIRCLE_DEF.ctype;
    const ctype: "basic" | "half" | "mixed" =
      (["basic", "half", "mixed"] as const).includes(ctypeRaw as any)
        ? (ctypeRaw as any) : CIRCLE_DEF.ctype;

    const ptypeRaw = p.get("ptype") ?? PROP_DEF.ptype;
    const ptype: "direct" | "inverse" | "mixed" =
      (["direct", "inverse", "mixed"] as const).includes(ptypeRaw as any)
        ? (ptypeRaw as any) : PROP_DEF.ptype;

    const repfindRaw = p.get("repfind") ?? REP_DEF.repfind;
    const repfind: "mean" | "median" | "mode" | "mixed" =
      (["mean", "median", "mode", "mixed"] as const).includes(repfindRaw as any)
        ? (repfindRaw as any) : REP_DEF.repfind;

    const pvshapeRaw = p.get("pvshape") ?? PV_DEF.pvshape;
    const pvshape: "prism" | "cylinder" | "mixed" =
      (["prism", "cylinder", "mixed"] as const).includes(pvshapeRaw as any)
        ? (pvshapeRaw as any) : PV_DEF.pvshape;

    return { seed, showAnswers, rtype, ctype, ptype, repfind, pvshape };
  };

  const [initial] = useState(getInitial);
  const [seed, setSeed] = useState(initial.seed);
  const [showAnswers, setShowAnswers] = useState(initial.showAnswers);
  const [showSettings, setShowSettings] = useState(false);

  const [rtype, setRtype] = useState(initial.rtype);
  const [ctype, setCtype] = useState(initial.ctype);
  const [ptype, setPtype] = useState(initial.ptype);
  const [repfind, setRepfind] = useState(initial.repfind);
  const [pvshape, setPvshape] = useState(initial.pvshape);

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
      case "ratio":
        if (rtype !== RATIO_DEF.rtype) m.rtype = rtype;
        break;
      case "circle-area":
        if (ctype !== CIRCLE_DEF.ctype) m.ctype = ctype;
        break;
      case "proportion":
        if (ptype !== PROP_DEF.ptype) m.ptype = ptype;
        break;
      case "representative":
        if (repfind !== REP_DEF.repfind) m.repfind = repfind;
        break;
      case "prism-volume":
        if (pvshape !== PV_DEF.pvshape) m.pvshape = pvshape;
        break;
      case "frac-mul":
      case "frac-div":
      case "literal-expr":
      case "counting":
      case "scale":
      case "frac-mixed-calc":
      case "freq-table":
        break;
    }
    return m;
  }, [op, rtype, ctype, ptype, repfind, pvshape]);

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

  /* ---- settings change handlers ---- */

  const onRtypeChange = useCallback((v: typeof rtype) => {
    setRtype(v);
    const p: Record<string, string> = {};
    if (v !== RATIO_DEF.rtype) p.rtype = v;
    regen(p);
  }, [regen]);

  const onCtypeChange = useCallback((v: typeof ctype) => {
    setCtype(v);
    const p: Record<string, string> = {};
    if (v !== CIRCLE_DEF.ctype) p.ctype = v;
    regen(p);
  }, [regen]);

  const onPtypeChange = useCallback((v: typeof ptype) => {
    setPtype(v);
    const p: Record<string, string> = {};
    if (v !== PROP_DEF.ptype) p.ptype = v;
    regen(p);
  }, [regen]);

  const onRepfindChange = useCallback((v: typeof repfind) => {
    setRepfind(v);
    const p: Record<string, string> = {};
    if (v !== REP_DEF.repfind) p.repfind = v;
    regen(p);
  }, [regen]);

  const onPvshapeChange = useCallback((v: typeof pvshape) => {
    setPvshape(v);
    const p: Record<string, string> = {};
    if (v !== PV_DEF.pvshape) p.pvshape = v;
    regen(p);
  }, [regen]);

  /* ---- generate problems ---- */

  const fracMulProblems = useMemo(
    () => op === "frac-mul" ? generateFracMul(seed) : [],
    [op, seed],
  );
  const fracDivProblems = useMemo(
    () => op === "frac-div" ? generateFracDiv(seed) : [],
    [op, seed],
  );
  const ratioProblems = useMemo(
    () => op === "ratio" ? generateRatio(seed, rtype) : [],
    [op, seed, rtype],
  );
  const circleProblems = useMemo(
    () => op === "circle-area" ? generateCircleArea(seed, ctype) : [],
    [op, seed, ctype],
  );
  const propProblems = useMemo(
    () => op === "proportion" ? generateProportion(seed, ptype) : [],
    [op, seed, ptype],
  );
  const literalExprProblems = useMemo(
    () => op === "literal-expr" ? generateLiteralExpr(seed) : [],
    [op, seed],
  );
  const repProblems = useMemo(
    () => op === "representative" ? generateRepresentative(seed, repfind) : [],
    [op, seed, repfind],
  );
  const countingProblems = useMemo(
    () => op === "counting" ? generateCounting(seed) : [],
    [op, seed],
  );
  const prismProblems = useMemo(
    () => op === "prism-volume" ? generatePrismVolume(seed, pvshape) : [],
    [op, seed, pvshape],
  );
  const scaleProblems = useMemo(
    () => op === "scale" ? generateScale(seed) : [],
    [op, seed],
  );
  const fracMixedProblems = useMemo(
    () => op === "frac-mixed-calc" ? generateFracMixedCalc(seed) : [],
    [op, seed],
  );
  const freqTableProblems = useMemo(
    () => op === "freq-table" ? generateFreqTable(seed) : [],
    [op, seed],
  );

  /* ---- settings panel ---- */

  const renderSettings = () => {
    switch (op) {
      case "frac-mul":
      case "frac-div":
      case "literal-expr":
      case "counting":
      case "scale":
      case "frac-mixed-calc":
      case "freq-table":
        return null;
      case "ratio":
        return (
          <div className="no-print settings-panel">
            <label>
              問題の種類{" "}
              <select className="operator-select" value={rtype}
                onChange={(e) => onRtypeChange(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="simplify">簡単な比にする</option>
                <option value="fill">穴埋め</option>
              </select>
            </label>
          </div>
        );
      case "circle-area":
        return (
          <div className="no-print settings-panel">
            <label>
              問題の種類{" "}
              <select className="operator-select" value={ctype}
                onChange={(e) => onCtypeChange(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="basic">円</option>
                <option value="half">半円</option>
              </select>
            </label>
          </div>
        );
      case "proportion":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={ptype}
                onChange={(e) => onPtypeChange(e.target.value as any)}>
                <option value="mixed">比例・反比例</option>
                <option value="direct">比例のみ</option>
                <option value="inverse">反比例のみ</option>
              </select>
            </label>
          </div>
        );
      case "representative":
        return (
          <div className="no-print settings-panel">
            <label>
              求めるもの{" "}
              <select className="operator-select" value={repfind}
                onChange={(e) => onRepfindChange(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="mean">平均値</option>
                <option value="median">中央値</option>
                <option value="mode">最頻値</option>
              </select>
            </label>
          </div>
        );
      case "prism-volume":
        return (
          <div className="no-print settings-panel">
            <label>
              形{" "}
              <select className="operator-select" value={pvshape}
                onChange={(e) => onPvshapeChange(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="prism">角柱</option>
                <option value="cylinder">円柱</option>
              </select>
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  /* ---- render fraction problems ---- */

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

  /* ---- render circle area SVG ---- */

  const renderCircleAreaFigure = (p: CircleAreaProblem) => {
    const W = 160;
    const H = 160;
    const cx = W / 2;
    const cy = H / 2;
    const cr = 50;
    const { figure } = p;

    if (figure.type === "full") {
      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
          <circle cx={cx} cy={cy} r={cr} fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
          <circle cx={cx} cy={cy} r={2.5} fill="#333" />
          <line x1={cx} y1={cy} x2={cx + cr} y2={cy} stroke="#1976d2" strokeWidth={1.5} />
          <text x={cx + cr / 2} y={cy + 16} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
            半径 = {figure.radius}cm
          </text>
        </svg>
      );
    }

    // Semicircle
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <defs>
          <clipPath id="semiclip">
            <rect x={cx - cr - 1} y={cy - cr - 1} width={cr * 2 + 2} height={cr + 1} />
          </clipPath>
        </defs>
        <circle cx={cx} cy={cy} r={cr} fill="#e3f2fd" stroke="#333" strokeWidth={1.5} clipPath="url(#semiclip)" />
        <line x1={cx - cr} y1={cy} x2={cx + cr} y2={cy} stroke="#333" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={2.5} fill="#333" />
        <line x1={cx} y1={cy} x2={cx + cr} y2={cy} stroke="#1976d2" strokeWidth={2} />
        <text x={cx + cr / 2} y={cy + 16} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
          半径 = {figure.radius}cm
        </text>
      </svg>
    );
  };

  /* ---- render problems ---- */

  const renderProblems = () => {
    switch (op) {
      case "frac-mul":
        return renderFracProblems(fracMulProblems, "\u00d7");

      case "frac-div":
        return renderFracProblems(fracDivProblems, "\u00f7");

      case "ratio":
        return (
          <div className="dev-text-page">
            {ratioProblems.map((p, i) => (
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

      case "circle-area":
        return (
          <div className="dev-text-page">
            {circleProblems.map((p, i) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1})</div>
                {renderCircleAreaFigure(p)}
                <div style={{ marginTop: 8 }}>
                  <div className="dev-text-row">
                    <span className="dev-text-q">{p.question}</span>
                    <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                      {p.answer}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "proportion":
        return (
          <div className="dev-text-page">
            {propProblems.map((p, idx) => {
              let ansIdx = 0;
              return (
                <div key={idx} className="dev-prop-block">
                  <div className="dev-prop-label">
                    ({idx + 1}) {p.label}
                  </div>
                  <table className="dev-prop-table">
                    <thead>
                      <tr>
                        <th>x</th>
                        {p.xValues.map((x, j) => <th key={j}>{x}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>y</td>
                        {p.yValues.map((y, j) => {
                          if (y !== null) {
                            return <td key={j}>{y}</td>;
                          }
                          const ans = p.answers[ansIdx++];
                          return (
                            <td key={j} className="dev-prop-blank">
                              <span className={showAnswers ? "dev-frac-ans" : "g1-hidden"}>
                                {ans}
                              </span>
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

      case "literal-expr":
        return (
          <div className="dev-text-page">
            {literalExprProblems.map((p, i) => (
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

      case "representative":
        return (
          <div className="dev-text-page">
            {repProblems.map((p, i) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">
                  ({i + 1}) データ: {p.data.join(", ")}
                </div>
                {(repfind === "mean" || repfind === "mixed") && (
                  <div className="dev-text-row">
                    <span className="dev-text-q">平均値:</span>
                    <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                      {p.meanAnswer}
                    </span>
                  </div>
                )}
                {(repfind === "median" || repfind === "mixed") && (
                  <div className="dev-text-row">
                    <span className="dev-text-q">中央値:</span>
                    <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                      {p.medianAnswer}
                    </span>
                  </div>
                )}
                {(repfind === "mode" || repfind === "mixed") && (
                  <div className="dev-text-row">
                    <span className="dev-text-q">最頻値:</span>
                    <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                      {p.modeAnswer}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case "counting":
        return (
          <div className="dev-text-page">
            {countingProblems.map((p, i) => (
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

      case "prism-volume":
        return (
          <div className="dev-text-page">
            {prismProblems.map((p, i) => (
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

      case "scale":
        return (
          <div className="dev-text-page">
            {scaleProblems.map((p, i) => (
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

      case "frac-mixed-calc":
        return renderFracProblems(fracMixedProblems, "\u00d7");

      case "freq-table":
        return (
          <div className="dev-text-page">
            {freqTableProblems.map((p, idx) => {
              let ansIdx = 0;
              return (
                <div key={idx} className="dev-prop-block">
                  <div className="dev-prop-label">
                    ({idx + 1}) データ: {p.data.join(", ")}
                  </div>
                  <table className="dev-prop-table">
                    <thead>
                      <tr>
                        <th>階級</th>
                        <th>度数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.classes.map((cls, j) => {
                        const freq = p.frequencies[j];
                        if (freq !== null) {
                          return (
                            <tr key={j}>
                              <td>{cls}</td>
                              <td>{freq}</td>
                            </tr>
                          );
                        }
                        const ans = p.answers[ansIdx++];
                        return (
                          <tr key={j}>
                            <td>{cls}</td>
                            <td className="dev-prop-blank">
                              <span className={showAnswers ? "dev-frac-ans" : "g1-hidden"}>
                                {ans}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        );

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

export default Grade6;

export const devGrade6: ProblemGroup = {
  id: "dev6",
  label: "6年（開発中）",
  operators: [
    { operator: "frac-mul", label: "分数×分数", grades: [6] },
    { operator: "frac-div", label: "分数÷分数", grades: [6] },
    { operator: "ratio", label: "比", grades: [6] },
    { operator: "circle-area", label: "円の面積", grades: [6] },
    { operator: "proportion", label: "比例と反比例", grades: [6] },
    { operator: "literal-expr", label: "文字式の値", grades: [6] },
    { operator: "representative", label: "代表値", grades: [6] },
    { operator: "counting", label: "場合の数", grades: [6] },
    { operator: "prism-volume", label: "角柱・円柱の体積", grades: [6] },
    { operator: "scale", label: "縮尺", grades: [6] },
    { operator: "frac-mixed-calc", label: "分数の四則混合", grades: [6] },
    { operator: "freq-table", label: "度数分布表", grades: [6] },
  ],
  Component: Grade6,
};
