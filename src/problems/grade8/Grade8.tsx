import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { randomSeed, seedToHex, hexToSeed } from "../random";
import type { ProblemGroup } from "../types";
import { Frac } from "../shared/Frac";
import {
  generatePolyAddSub,
  generateMonoMulDiv,
  generateSimEq,
  generatePolygonAngle,
  generateTriAngle,
  generateParallelAngle,
  generateParallelogram,
  generateLinearFunc,
  generateProbability,
} from "./generators";
import type {
  MonoMulDivMode,
  SimEqMode,
  PolygonAngleMode,
  TriAngleMode,
  ParallelAngleMode,
  ParallelogramMode,
  LinearFuncMode,
  ProbabilityMode,
} from "./generators";

/* ================================================================
   Types
   ================================================================ */

type Grade8Op =
  | "poly-add-sub"
  | "mono-mul-div"
  | "simultaneous-eq"
  | "polygon-angle"
  | "triangle-angle"
  | "parallel-angle"
  | "parallelogram"
  | "linear-func"
  | "probability";

/* ================================================================
   URL state helpers
   ================================================================ */

const ALL_PARAMS = [
  "q", "answers", "mmmode", "seqmode", "pamode", "tamode",
  "plmode", "pgmode", "lfmode", "pbmode",
];

function cleanParams(url: URL) {
  for (const k of ALL_PARAMS) url.searchParams.delete(k);
}

/* ================================================================
   Defaults
   ================================================================ */

const MONO_DEF = { mmmode: "mixed" as MonoMulDivMode };
const SIMEQ_DEF = { seqmode: "mixed" as SimEqMode };
const POLYANGLE_DEF = { pamode: "mixed" as PolygonAngleMode };
const TRIANGLE_DEF = { tamode: "mixed" as TriAngleMode };
const PARALLEL_DEF = { plmode: "mixed" as ParallelAngleMode };
const PGRAM_DEF = { pgmode: "mixed" as ParallelogramMode };
const LINFUNC_DEF = { lfmode: "mixed" as LinearFuncMode };
const PROB_DEF = { pbmode: "mixed" as ProbabilityMode };

/* ================================================================
   Main component
   ================================================================ */

function Grade8({ operator }: { operator: string }) {
  const op = operator as Grade8Op;

  const getInitial = () => {
    const p = new URLSearchParams(window.location.search);
    const qHex = p.get("q");
    const seed = qHex ? hexToSeed(qHex) ?? randomSeed() : randomSeed();
    const showAnswers = p.get("answers") === "1";

    const mmmodeRaw = p.get("mmmode") ?? MONO_DEF.mmmode;
    const mmmode = (["mul", "div", "mixed"] as const).includes(mmmodeRaw as any)
      ? (mmmodeRaw as MonoMulDivMode) : MONO_DEF.mmmode;

    const seqmodeRaw = p.get("seqmode") ?? SIMEQ_DEF.seqmode;
    const seqmode = (["addition", "substitution", "mixed"] as const).includes(seqmodeRaw as any)
      ? (seqmodeRaw as SimEqMode) : SIMEQ_DEF.seqmode;

    const pamodeRaw = p.get("pamode") ?? POLYANGLE_DEF.pamode;
    const pamode = (["interior-sum", "regular", "exterior", "find-n", "mixed"] as const).includes(pamodeRaw as any)
      ? (pamodeRaw as PolygonAngleMode) : POLYANGLE_DEF.pamode;

    const tamodeRaw = p.get("tamode") ?? TRIANGLE_DEF.tamode;
    const tamode = (["interior", "exterior", "mixed"] as const).includes(tamodeRaw as any)
      ? (tamodeRaw as TriAngleMode) : TRIANGLE_DEF.tamode;

    const plmodeRaw = p.get("plmode") ?? PARALLEL_DEF.plmode;
    const plmode = (["vertical", "corresponding", "alternate", "mixed"] as const).includes(plmodeRaw as any)
      ? (plmodeRaw as ParallelAngleMode) : PARALLEL_DEF.plmode;

    const pgmodeRaw = p.get("pgmode") ?? PGRAM_DEF.pgmode;
    const pgmode = (["sides", "angles", "diagonals", "mixed"] as const).includes(pgmodeRaw as any)
      ? (pgmodeRaw as ParallelogramMode) : PGRAM_DEF.pgmode;

    const lfmodeRaw = p.get("lfmode") ?? LINFUNC_DEF.lfmode;
    const lfmode = (["slope-intercept", "two-points", "rate-of-change", "mixed"] as const).includes(lfmodeRaw as any)
      ? (lfmodeRaw as LinearFuncMode) : LINFUNC_DEF.lfmode;

    const pbmodeRaw = p.get("pbmode") ?? PROB_DEF.pbmode;
    const pbmode = (["basic", "two-dice", "mixed"] as const).includes(pbmodeRaw as any)
      ? (pbmodeRaw as ProbabilityMode) : PROB_DEF.pbmode;

    return { seed, showAnswers, mmmode, seqmode, pamode, tamode, plmode, pgmode, lfmode, pbmode };
  };

  const [initial] = useState(getInitial);
  const [seed, setSeed] = useState(initial.seed);
  const [showAnswers, setShowAnswers] = useState(initial.showAnswers);
  const [showSettings, setShowSettings] = useState(false);

  const [mmmode, setMmmode] = useState(initial.mmmode);
  const [seqmode, setSeqmode] = useState(initial.seqmode);
  const [pamode, setPamode] = useState(initial.pamode);
  const [tamode, setTamode] = useState(initial.tamode);
  const [plmode, setPlmode] = useState(initial.plmode);
  const [pgmode, setPgmode] = useState(initial.pgmode);
  const [lfmode, setLfmode] = useState(initial.lfmode);
  const [pbmode, setPbmode] = useState(initial.pbmode);

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
      case "mono-mul-div":
        if (mmmode !== MONO_DEF.mmmode) m.mmmode = mmmode;
        break;
      case "simultaneous-eq":
        if (seqmode !== SIMEQ_DEF.seqmode) m.seqmode = seqmode;
        break;
      case "polygon-angle":
        if (pamode !== POLYANGLE_DEF.pamode) m.pamode = pamode;
        break;
      case "triangle-angle":
        if (tamode !== TRIANGLE_DEF.tamode) m.tamode = tamode;
        break;
      case "parallel-angle":
        if (plmode !== PARALLEL_DEF.plmode) m.plmode = plmode;
        break;
      case "parallelogram":
        if (pgmode !== PGRAM_DEF.pgmode) m.pgmode = pgmode;
        break;
      case "linear-func":
        if (lfmode !== LINFUNC_DEF.lfmode) m.lfmode = lfmode;
        break;
      case "probability":
        if (pbmode !== PROB_DEF.pbmode) m.pbmode = pbmode;
        break;
      case "poly-add-sub":
        break;
    }
    return m;
  }, [op, mmmode, seqmode, pamode, tamode, plmode, pgmode, lfmode, pbmode]);

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

  const polyProblems = useMemo(
    () => op === "poly-add-sub" ? generatePolyAddSub(seed) : [],
    [op, seed],
  );
  const monoProblems = useMemo(
    () => op === "mono-mul-div" ? generateMonoMulDiv(seed, mmmode) : [],
    [op, seed, mmmode],
  );
  const simEqProblems = useMemo(
    () => op === "simultaneous-eq" ? generateSimEq(seed, seqmode) : [],
    [op, seed, seqmode],
  );
  const polyAngleProblems = useMemo(
    () => op === "polygon-angle" ? generatePolygonAngle(seed, pamode) : [],
    [op, seed, pamode],
  );
  const triAngleProblems = useMemo(
    () => op === "triangle-angle" ? generateTriAngle(seed, tamode) : [],
    [op, seed, tamode],
  );
  const parallelProblems = useMemo(
    () => op === "parallel-angle" ? generateParallelAngle(seed, plmode) : [],
    [op, seed, plmode],
  );
  const pgramProblems = useMemo(
    () => op === "parallelogram" ? generateParallelogram(seed, pgmode) : [],
    [op, seed, pgmode],
  );
  const linFuncProblems = useMemo(
    () => op === "linear-func" ? generateLinearFunc(seed, lfmode) : [],
    [op, seed, lfmode],
  );
  const probProblems = useMemo(
    () => op === "probability" ? generateProbability(seed, pbmode) : [],
    [op, seed, pbmode],
  );

  /* ---- settings panel ---- */

  const renderSettings = () => {
    switch (op) {
      case "poly-add-sub":
        return null;
      case "mono-mul-div":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={mmmode}
                onChange={(e) => onSettingChange(setMmmode, "mmmode", MONO_DEF.mmmode)(e.target.value as MonoMulDivMode)}>
                <option value="mixed">すべて</option>
                <option value="mul">乗法のみ</option>
                <option value="div">除法のみ</option>
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
      case "polygon-angle":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={pamode}
                onChange={(e) => onSettingChange(setPamode, "pamode", POLYANGLE_DEF.pamode)(e.target.value as PolygonAngleMode)}>
                <option value="mixed">すべて</option>
                <option value="interior-sum">内角の和</option>
                <option value="regular">正多角形の内角</option>
                <option value="exterior">外角の和</option>
                <option value="find-n">何角形？</option>
              </select>
            </label>
          </div>
        );
      case "triangle-angle":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={tamode}
                onChange={(e) => onSettingChange(setTamode, "tamode", TRIANGLE_DEF.tamode)(e.target.value as TriAngleMode)}>
                <option value="mixed">すべて</option>
                <option value="interior">内角</option>
                <option value="exterior">外角</option>
              </select>
            </label>
          </div>
        );
      case "parallel-angle":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={plmode}
                onChange={(e) => onSettingChange(setPlmode, "plmode", PARALLEL_DEF.plmode)(e.target.value as ParallelAngleMode)}>
                <option value="mixed">すべて</option>
                <option value="vertical">対頂角</option>
                <option value="corresponding">同位角</option>
                <option value="alternate">錯角</option>
              </select>
            </label>
          </div>
        );
      case "parallelogram":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={pgmode}
                onChange={(e) => onSettingChange(setPgmode, "pgmode", PGRAM_DEF.pgmode)(e.target.value as ParallelogramMode)}>
                <option value="mixed">すべて</option>
                <option value="sides">辺</option>
                <option value="angles">角度</option>
                <option value="diagonals">対角線</option>
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
                onChange={(e) => onSettingChange(setLfmode, "lfmode", LINFUNC_DEF.lfmode)(e.target.value as LinearFuncMode)}>
                <option value="mixed">すべて</option>
                <option value="slope-intercept">傾き・切片</option>
                <option value="two-points">2点から</option>
                <option value="rate-of-change">変化の割合</option>
              </select>
            </label>
          </div>
        );
      case "probability":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={pbmode}
                onChange={(e) => onSettingChange(setPbmode, "pbmode", PROB_DEF.pbmode)(e.target.value as ProbabilityMode)}>
                <option value="mixed">すべて</option>
                <option value="basic">基本</option>
                <option value="two-dice">2つのさいころ</option>
              </select>
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  /* ---- render problems ---- */

  const renderProblems = () => {
    switch (op) {
      case "poly-add-sub":
        return (
          <div className="g1-page g1-cols-2">
            {polyProblems.map((p, i) => (
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

      case "mono-mul-div":
        return (
          <div className="g1-page g1-cols-2">
            {monoProblems.map((p, i) => (
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

      case "polygon-angle":
        return (
          <div className="dev-text-page">
            {polyAngleProblems.map((p, i) => (
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

      case "triangle-angle":
        return (
          <div className="dev-text-page">
            {triAngleProblems.map((p, i) => (
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

      case "parallel-angle":
        return (
          <div className="dev-text-page">
            {parallelProblems.map((p, i) => (
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

      case "parallelogram":
        return (
          <div className="dev-text-page">
            {pgramProblems.map((p, i) => (
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

      case "linear-func":
        return (
          <div className="dev-text-page">
            {linFuncProblems.map((p, i) => (
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

      case "probability":
        return (
          <div className="dev-text-page">
            {probProblems.map((p, i) => (
              <div key={i} className="dev-text-row">
                <span className="g1-num">({i + 1})</span>
                <span className="dev-text-q">{p.question}</span>
                <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`} style={{ alignItems: "center" }}>
                  {p.ansDen === 1 ? (
                    p.ansNum
                  ) : (
                    <Frac num={p.ansNum} den={p.ansDen} />
                  )}
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
}

export default Grade8;

export const devGrade8: ProblemGroup = {
  id: "dev8",
  label: "中2（開発中）",
  operators: [
    { operator: "poly-add-sub", label: "多項式の加減", grades: [8] },
    { operator: "mono-mul-div", label: "単項式の乗除", grades: [8] },
    { operator: "simultaneous-eq", label: "連立方程式", grades: [8] },
    { operator: "polygon-angle", label: "多角形の角", grades: [8] },
    { operator: "triangle-angle", label: "三角形の角度", grades: [8] },
    { operator: "parallel-angle", label: "平行線と角", grades: [8] },
    { operator: "parallelogram", label: "平行四辺形", grades: [8] },
    { operator: "linear-func", label: "一次関数", grades: [8] },
    { operator: "probability", label: "確率", grades: [8] },
  ],
  Component: Grade8,
};
