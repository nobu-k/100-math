import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { randomSeed, seedToHex, hexToSeed } from "./random";
import type { ProblemGroup } from "./types";
import { Box } from "./shared/Box";
import { generateKukuBlank } from "./computation/kuku-blank";
import { generateMushikui } from "./computation/mushikui";
import { generateUnitConv } from "./measurement/unit-conv";
import { generateTimeCalc } from "./measurement/time-calc";
import { generateLargeNum } from "./numbers/large-num";
import { generateTableRead } from "./data/table-read";

/* ================================================================
   Types
   ================================================================ */

type Grade2Op =
  | "kuku-blank"
  | "mushikui"
  | "unit-conv"
  | "time-calc"
  | "large-num"
  | "table-read";

/* ================================================================
   URL state helpers
   ================================================================ */

const ALL_PARAMS = ["q", "answers", "blank", "max", "mode", "unit", "ttype", "range", "cats"];

const cleanParams = (url: URL) => {
  for (const k of ALL_PARAMS) url.searchParams.delete(k);
};

/* ================================================================
   Defaults
   ================================================================ */

const KUKU_DEF = { blank: "any" as const };
const MUSHI_DEF = { max: 100, mode: "mixed" as const };
const UNIT_DEF = { unit: "mixed" as const };
const TIME_DEF = { ttype: "mixed" as const };
const LARGE_DEF = { range: 1000 };
const TABLE_DEF = { cats: 4 };

/* ================================================================
   Main component
   ================================================================ */

const Grade2 = ({ operator }: { operator: string }) => {
  const op = operator as Grade2Op;

  const getInitial = () => {
    const p = new URLSearchParams(window.location.search);
    const qHex = p.get("q");
    const seed = qHex ? hexToSeed(qHex) ?? randomSeed() : randomSeed();
    const showAnswers = p.get("answers") === "1";

    const blankRaw = p.get("blank") ?? KUKU_DEF.blank;
    const blank: "any" | "product" | "factor" =
      (["any", "product", "factor"] as const).includes(blankRaw as any)
        ? (blankRaw as any) : KUKU_DEF.blank;

    const max = Math.max(10, Math.min(200,
      parseInt(p.get("max") ?? String(MUSHI_DEF.max), 10) || MUSHI_DEF.max));

    const modeRaw = p.get("mode") ?? MUSHI_DEF.mode;
    const mode: "add" | "sub" | "mixed" =
      modeRaw === "add" || modeRaw === "sub" ? modeRaw : "mixed";

    const unitRaw = p.get("unit") ?? UNIT_DEF.unit;
    const unit: "length" | "volume" | "mixed" =
      (["length", "volume", "mixed"] as const).includes(unitRaw as any)
        ? (unitRaw as any) : UNIT_DEF.unit;

    const ttypeRaw = p.get("ttype") ?? TIME_DEF.ttype;
    const ttype: "after" | "duration" | "mixed" =
      (["after", "duration", "mixed"] as const).includes(ttypeRaw as any)
        ? (ttypeRaw as any) : TIME_DEF.ttype;

    const range = Math.max(100, Math.min(10000,
      parseInt(p.get("range") ?? String(LARGE_DEF.range), 10) || LARGE_DEF.range));

    const cats = Math.max(3, Math.min(5,
      parseInt(p.get("cats") ?? String(TABLE_DEF.cats), 10) || TABLE_DEF.cats));

    return { seed, showAnswers, blank, max, mode, unit, ttype, range, cats };
  };

  const [initial] = useState(getInitial);
  const [seed, setSeed] = useState(initial.seed);
  const [showAnswers, setShowAnswers] = useState(initial.showAnswers);
  const [showSettings, setShowSettings] = useState(false);

  const [blank, setBlank] = useState(initial.blank);
  const [max, setMax] = useState(initial.max);
  const [mode, setMode] = useState(initial.mode);
  const [unit, setUnit] = useState(initial.unit);
  const [ttype, setTtype] = useState(initial.ttype);
  const [range, setRange] = useState(initial.range);
  const [cats, setCats] = useState(initial.cats);

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
      case "kuku-blank":
        if (blank !== KUKU_DEF.blank) m.blank = blank;
        break;
      case "mushikui":
        if (max !== MUSHI_DEF.max) m.max = String(max);
        if (mode !== MUSHI_DEF.mode) m.mode = mode;
        break;
      case "unit-conv":
        if (unit !== UNIT_DEF.unit) m.unit = unit;
        break;
      case "time-calc":
        if (ttype !== TIME_DEF.ttype) m.ttype = ttype;
        break;
      case "large-num":
        if (range !== LARGE_DEF.range) m.range = String(range);
        break;
      case "table-read":
        if (cats !== TABLE_DEF.cats) m.cats = String(cats);
        break;
    }
    return m;
  }, [op, blank, max, mode, unit, ttype, range, cats]);

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

  const onBlankChange = useCallback((v: "any" | "product" | "factor") => {
    setBlank(v);
    const p: Record<string, string> = {};
    if (v !== KUKU_DEF.blank) p.blank = v;
    regen(p);
  }, [regen]);

  const onMaxChange = useCallback((v: number) => {
    setMax(v);
    const p: Record<string, string> = {};
    if (v !== MUSHI_DEF.max) p.max = String(v);
    if (mode !== MUSHI_DEF.mode) p.mode = mode;
    regen(p);
  }, [mode, regen]);

  const onModeChange = useCallback((v: "add" | "sub" | "mixed") => {
    setMode(v);
    const p: Record<string, string> = {};
    if (max !== MUSHI_DEF.max) p.max = String(max);
    if (v !== MUSHI_DEF.mode) p.mode = v;
    regen(p);
  }, [max, regen]);

  const onUnitChange = useCallback((v: "length" | "volume" | "mixed") => {
    setUnit(v);
    const p: Record<string, string> = {};
    if (v !== UNIT_DEF.unit) p.unit = v;
    regen(p);
  }, [regen]);

  const onTtypeChange = useCallback((v: "after" | "duration" | "mixed") => {
    setTtype(v);
    const p: Record<string, string> = {};
    if (v !== TIME_DEF.ttype) p.ttype = v;
    regen(p);
  }, [regen]);

  const onRangeChange = useCallback((v: number) => {
    setRange(v);
    const p: Record<string, string> = {};
    if (v !== LARGE_DEF.range) p.range = String(v);
    regen(p);
  }, [regen]);

  const onCatsChange = useCallback((v: number) => {
    setCats(v);
    const p: Record<string, string> = {};
    if (v !== TABLE_DEF.cats) p.cats = String(v);
    regen(p);
  }, [regen]);

  /* ---- generate problems ---- */

  const kukuProblems = useMemo(
    () => op === "kuku-blank" ? generateKukuBlank(seed, blank) : [],
    [op, seed, blank],
  );
  const mushikuiProblems = useMemo(
    () => op === "mushikui" ? generateMushikui(seed, max, mode) : [],
    [op, seed, max, mode],
  );
  const unitProblems = useMemo(
    () => op === "unit-conv" ? generateUnitConv(seed, unit) : [],
    [op, seed, unit],
  );
  const timeProblems = useMemo(
    () => op === "time-calc" ? generateTimeCalc(seed, ttype) : [],
    [op, seed, ttype],
  );
  const largeNumProblems = useMemo(
    () => op === "large-num" ? generateLargeNum(seed, range) : [],
    [op, seed, range],
  );
  const tableProblems = useMemo(
    () => op === "table-read" ? generateTableRead(seed, cats) : [],
    [op, seed, cats],
  );

  /* ---- settings panel ---- */

  const renderSettings = () => {
    switch (op) {
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
      case "unit-conv":
        return (
          <div className="no-print settings-panel">
            <label>
              単位{" "}
              <select className="operator-select" value={unit}
                onChange={(e) => onUnitChange(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="length">長さ（mm・cm・m）</option>
                <option value="volume">かさ（mL・dL・L）</option>
              </select>
            </label>
          </div>
        );
      case "time-calc":
        return (
          <div className="no-print settings-panel">
            <label>
              問題の種類{" "}
              <select className="operator-select" value={ttype}
                onChange={(e) => onTtypeChange(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="after">○分後の時刻</option>
                <option value="duration">時間の長さ</option>
              </select>
            </label>
          </div>
        );
      case "large-num":
        return (
          <div className="no-print settings-panel">
            <label>
              数の範囲{" "}
              <select className="operator-select" value={range}
                onChange={(e) => onRangeChange(Number(e.target.value))}>
                <option value={100}>〜100</option>
                <option value={1000}>〜1000</option>
                <option value={10000}>〜10000</option>
              </select>
            </label>
          </div>
        );
      case "table-read":
        return (
          <div className="no-print settings-panel">
            <label>
              カテゴリ数{" "}
              <select className="operator-select" value={cats}
                onChange={(e) => onCatsChange(Number(e.target.value))}>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
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
      case "kuku-blank":
        return (
          <div className="g1-page g1-cols-3">
            {kukuProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  {p.blankPos === "a" ? (
                    <Box answer={p.a} show={showAnswers} />
                  ) : (
                    <span className="g1-val">{p.a}</span>
                  )}
                  <span className="g1-op">&times;</span>
                  {p.blankPos === "b" ? (
                    <Box answer={p.b} show={showAnswers} />
                  ) : (
                    <span className="g1-val">{p.b}</span>
                  )}
                  <span className="g1-op">=</span>
                  {p.blankPos === "product" ? (
                    <Box answer={p.product} show={showAnswers} />
                  ) : (
                    <span className="g1-val">{p.product}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        );

      case "mushikui":
        return (
          <div className="g1-page g1-cols-2">
            {mushikuiProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  {p.left !== null ? (
                    <span className="g1-val">{p.left}</span>
                  ) : (
                    <Box answer={p.answer} show={showAnswers} />
                  )}
                  <span className="g1-op">{p.op}</span>
                  {p.right !== null ? (
                    <span className="g1-val">{p.right}</span>
                  ) : (
                    <Box answer={p.answer} show={showAnswers} />
                  )}
                  <span className="g1-op">=</span>
                  {p.result !== null ? (
                    <span className="g1-val">{p.result}</span>
                  ) : (
                    <Box answer={p.answer} show={showAnswers} />
                  )}
                </span>
              </div>
            ))}
          </div>
        );

      case "unit-conv":
        return (
          <div className="dev-text-page">
            {unitProblems.map((p, i) => (
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

      case "time-calc":
        return (
          <div className="dev-text-page">
            {timeProblems.map((p, i) => (
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

      case "large-num":
        return (
          <div className="dev-text-page">
            {largeNumProblems.map((p, i) => (
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

      case "table-read":
        return (
          <div className="dev-text-page">
            {tableProblems.map((tp, idx) => (
              <div key={idx} className="dev-prop-block">
                <div className="dev-prop-label">
                  ({idx + 1}) {tp.title}
                </div>
                <table className="dev-prop-table">
                  <thead>
                    <tr>
                      {tp.categories.map((c, j) => <th key={j}>{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {tp.values.map((v, j) => <td key={j}>{v}</td>)}
                    </tr>
                  </tbody>
                </table>
                <div style={{ marginTop: 8 }}>
                  {tp.questions.map((q, j) => (
                    <div key={j} className="dev-text-row">
                      <span className="dev-text-q">{q.question}</span>
                      <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                        {q.answer}
                      </span>
                    </div>
                  ))}
                </div>
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
};

export default Grade2;

export const devGrade2: ProblemGroup = {
  id: "dev2",
  label: "2年（開発中）",
  operators: [
    { operator: "kuku-blank", label: "九九の穴埋め", grades: [2], category: "computation" },
    { operator: "mushikui", label: "虫食い算", grades: [2], category: "computation" },
    { operator: "unit-conv", label: "単位の換算", grades: [2], category: "measurement" },
    { operator: "time-calc", label: "時刻と時間", grades: [2], category: "measurement" },
    { operator: "large-num", label: "大きな数", grades: [2], category: "numbers" },
    { operator: "table-read", label: "表の読み取り", grades: [2], category: "data" },
  ],
  Component: Grade2,
};
