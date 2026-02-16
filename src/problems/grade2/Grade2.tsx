import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { mulberry32, randomSeed, seedToHex, hexToSeed } from "../random";
import type { ProblemGroup } from "../types";

/* ================================================================
   Types
   ================================================================ */

type Grade2Op =
  | "kuku-blank"
  | "mushikui"
  | "unit-conv"
  | "time-calc"
  | "large-num";

interface KukuBlankProblem {
  a: number;
  b: number;
  product: number;
  blankPos: "a" | "b" | "product";
  answer: number;
}

interface MushikuiProblem {
  left: number | null;
  right: number | null;
  result: number | null;
  op: "+" | "−";
  answer: number;
}

interface TextProblem {
  question: string;
  answer: string;
}

/* ================================================================
   Helpers
   ================================================================ */

const KANJI_DIGITS = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

function numberToKanji(n: number): string {
  if (n === 0) return "〇";
  let result = "";
  const sen = Math.floor(n / 1000);
  const hyaku = Math.floor((n % 1000) / 100);
  const juu = Math.floor((n % 100) / 10);
  const ichi = n % 10;
  if (sen > 0) result += (sen === 1 ? "" : KANJI_DIGITS[sen]) + "千";
  if (hyaku > 0) result += (hyaku === 1 ? "" : KANJI_DIGITS[hyaku]) + "百";
  if (juu > 0) result += (juu === 1 ? "" : KANJI_DIGITS[juu]) + "十";
  if (ichi > 0) result += KANJI_DIGITS[ichi];
  return result;
}

/* ================================================================
   Generators
   ================================================================ */

function generateKukuBlank(
  seed: number,
  blankMode: "any" | "product" | "factor",
): KukuBlankProblem[] {
  const rng = mulberry32(seed);
  const problems: KukuBlankProblem[] = [];
  for (let i = 0; i < 15; i++) {
    const a = 1 + Math.floor(rng() * 9);
    const b = 1 + Math.floor(rng() * 9);
    const product = a * b;
    let blankPos: "a" | "b" | "product";
    if (blankMode === "product") {
      blankPos = "product";
    } else if (blankMode === "factor") {
      blankPos = rng() < 0.5 ? "a" : "b";
    } else {
      const r = rng();
      blankPos = r < 0.33 ? "a" : r < 0.66 ? "b" : "product";
    }
    const answer = blankPos === "a" ? a : blankPos === "b" ? b : product;
    problems.push({ a, b, product, blankPos, answer });
  }
  return problems;
}

function generateMushikui(
  seed: number,
  max: number,
  mode: "add" | "sub" | "mixed",
): MushikuiProblem[] {
  const rng = mulberry32(seed);
  const problems: MushikuiProblem[] = [];
  for (let i = 0; i < 12; i++) {
    const useAdd = mode === "add" ? true : mode === "sub" ? false : rng() < 0.5;
    if (useAdd) {
      const result = 10 + Math.floor(rng() * (max - 9));
      const left = 1 + Math.floor(rng() * (result - 1));
      const right = result - left;
      const r = rng();
      if (r < 0.33) {
        problems.push({ left: null, right, result, op: "+", answer: left });
      } else if (r < 0.66) {
        problems.push({ left, right: null, result, op: "+", answer: right });
      } else {
        problems.push({ left, right, result: null, op: "+", answer: result });
      }
    } else {
      const left = 10 + Math.floor(rng() * (max - 9));
      const right = 1 + Math.floor(rng() * (left - 1));
      const result = left - right;
      const r = rng();
      if (r < 0.33) {
        problems.push({ left: null, right, result, op: "−", answer: left });
      } else if (r < 0.66) {
        problems.push({ left, right: null, result, op: "−", answer: right });
      } else {
        problems.push({ left, right, result: null, op: "−", answer: result });
      }
    }
  }
  return problems;
}

function generateUnitConv(
  seed: number,
  unitType: "length" | "volume" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const makeLengthProblem = (): TextProblem => {
    const type = Math.floor(rng() * 4);
    switch (type) {
      case 0: {
        const cm = 1 + Math.floor(rng() * 9);
        const mm = 1 + Math.floor(rng() * 9);
        return { question: `${cm}cm ${mm}mm ＝ □mm`, answer: `${cm * 10 + mm}` };
      }
      case 1: {
        const cm = 1 + Math.floor(rng() * 9);
        const mm = 1 + Math.floor(rng() * 9);
        const total = cm * 10 + mm;
        return { question: `${total}mm ＝ □cm □mm`, answer: `${cm}cm ${mm}mm` };
      }
      case 2: {
        const m = 1 + Math.floor(rng() * 5);
        const cm = 1 + Math.floor(rng() * 99);
        return { question: `${m}m ${cm}cm ＝ □cm`, answer: `${m * 100 + cm}` };
      }
      default: {
        const m = 1 + Math.floor(rng() * 5);
        const cm = 1 + Math.floor(rng() * 99);
        const total = m * 100 + cm;
        return { question: `${total}cm ＝ □m □cm`, answer: `${m}m ${cm}cm` };
      }
    }
  };

  const makeVolumeProblem = (): TextProblem => {
    const type = Math.floor(rng() * 4);
    switch (type) {
      case 0: {
        const l = 1 + Math.floor(rng() * 5);
        const dl = 1 + Math.floor(rng() * 9);
        return { question: `${l}L ${dl}dL ＝ □dL`, answer: `${l * 10 + dl}` };
      }
      case 1: {
        const l = 1 + Math.floor(rng() * 5);
        const dl = 1 + Math.floor(rng() * 9);
        const total = l * 10 + dl;
        return { question: `${total}dL ＝ □L □dL`, answer: `${l}L ${dl}dL` };
      }
      case 2: {
        const l = 1 + Math.floor(rng() * 3);
        const ml = (1 + Math.floor(rng() * 9)) * 100;
        return { question: `${l}L ${ml}mL ＝ □mL`, answer: `${l * 1000 + ml}` };
      }
      default: {
        const l = 1 + Math.floor(rng() * 3);
        const ml = (1 + Math.floor(rng() * 9)) * 100;
        const total = l * 1000 + ml;
        return { question: `${total}mL ＝ □L □mL`, answer: `${l}L ${ml}mL` };
      }
    }
  };

  for (let i = 0; i < 10; i++) {
    if (unitType === "length") {
      problems.push(makeLengthProblem());
    } else if (unitType === "volume") {
      problems.push(makeVolumeProblem());
    } else {
      problems.push(rng() < 0.5 ? makeLengthProblem() : makeVolumeProblem());
    }
  }
  return problems;
}

function generateTimeCalc(
  seed: number,
  calcType: "after" | "duration" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 8; i++) {
    const useAfter =
      calcType === "after" ? true : calcType === "duration" ? false : rng() < 0.5;

    if (useAfter) {
      const hour = 1 + Math.floor(rng() * 10);
      const minute = Math.floor(rng() * 6) * 10;
      const addMin = (1 + Math.floor(rng() * 5)) * 10;
      let newHour = hour;
      let newMin = minute + addMin;
      if (newMin >= 60) {
        newHour += Math.floor(newMin / 60);
        newMin = newMin % 60;
      }
      const timeStr = minute === 0 ? `${hour}時` : `${hour}時${minute}分`;
      const ansStr = newMin === 0 ? `${newHour}時` : `${newHour}時${newMin}分`;
      problems.push({
        question: `${timeStr}の${addMin}分後は何時何分？`,
        answer: ansStr,
      });
    } else {
      const startHour = 1 + Math.floor(rng() * 9);
      const startMin = Math.floor(rng() * 4) * 15;
      const endHour = startHour + 1 + Math.floor(rng() * 2);
      const endMin = Math.floor(rng() * 4) * 15;
      let diffH = endHour - startHour;
      let diffM = endMin - startMin;
      if (diffM < 0) { diffH -= 1; diffM += 60; }
      const startStr = startMin === 0 ? `${startHour}時` : `${startHour}時${startMin}分`;
      const endStr = endMin === 0 ? `${endHour}時` : `${endHour}時${endMin}分`;
      let ansStr: string;
      if (diffH === 0) ansStr = `${diffM}分`;
      else if (diffM === 0) ansStr = `${diffH}時間`;
      else ansStr = `${diffH}時間${diffM}分`;
      problems.push({ question: `${startStr}から${endStr}まで何時間何分？`, answer: ansStr });
    }
  }
  return problems;
}

function generateLargeNum(
  seed: number,
  maxRange: number,
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];
  const minVal = maxRange <= 100 ? 10 : maxRange <= 1000 ? 100 : 1000;

  for (let i = 0; i < 10; i++) {
    const n = minVal + Math.floor(rng() * (maxRange - minVal));
    const kanji = numberToKanji(n);
    if (rng() < 0.5) {
      problems.push({ question: String(n), answer: kanji });
    } else {
      problems.push({ question: kanji, answer: String(n) });
    }
  }
  return problems;
}

/* ================================================================
   Shared components
   ================================================================ */

function Box({ answer, show }: { answer: number | string; show: boolean }) {
  return (
    <span className="g1-box">
      <span className={show ? "g1-box-val" : "g1-box-val g1-hidden"}>
        {answer}
      </span>
    </span>
  );
}

/* ================================================================
   URL state helpers
   ================================================================ */

const ALL_PARAMS = ["q", "answers", "blank", "max", "mode", "unit", "ttype", "range"];

function cleanParams(url: URL) {
  for (const k of ALL_PARAMS) url.searchParams.delete(k);
}

/* ================================================================
   Defaults
   ================================================================ */

const KUKU_DEF = { blank: "any" as const };
const MUSHI_DEF = { max: 100, mode: "mixed" as const };
const UNIT_DEF = { unit: "mixed" as const };
const TIME_DEF = { ttype: "mixed" as const };
const LARGE_DEF = { range: 1000 };

/* ================================================================
   Main component
   ================================================================ */

function Grade2({ operator }: { operator: string }) {
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

    return { seed, showAnswers, blank, max, mode, unit, ttype, range };
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
    }
    return m;
  }, [op, blank, max, mode, unit, ttype, range]);

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

export default Grade2;

export const devGrade2: ProblemGroup = {
  id: "dev2",
  label: "2年（開発中）",
  operators: [
    { operator: "kuku-blank", label: "九九の穴埋め" },
    { operator: "mushikui", label: "虫食い算" },
    { operator: "unit-conv", label: "単位の換算" },
    { operator: "time-calc", label: "時刻と時間" },
    { operator: "large-num", label: "大きな数" },
  ],
  Component: Grade2,
};
