import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { mulberry32, randomSeed, seedToHex, hexToSeed } from "../random";
import type { ProblemGroup } from "../types";

/* ================================================================
   Types
   ================================================================ */

type Grade3Op =
  | "division"
  | "box-eq"
  | "mental-math"
  | "unit-conv3"
  | "decimal-comp";

interface DivisionProblem {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
}

interface BoxEqProblem {
  /** Display string with □, e.g. "□ + 5 = 12" */
  display: string;
  answer: number;
}

interface MentalMathProblem {
  left: number;
  right: number;
  op: "+" | "−";
  answer: number;
}

interface TextProblem {
  question: string;
  answer: string;
}

interface DecimalCompProblem {
  left: string;
  right: string;
  answer: "＞" | "＜" | "＝";
}

/* ================================================================
   Generators
   ================================================================ */

function generateDivision(
  seed: number,
  remainderMode: "none" | "yes" | "mixed",
): DivisionProblem[] {
  const rng = mulberry32(seed);
  const problems: DivisionProblem[] = [];

  for (let i = 0; i < 15; i++) {
    const divisor = 2 + Math.floor(rng() * 8); // 2-9
    const useRemainder =
      remainderMode === "none" ? false :
      remainderMode === "yes" ? true :
      rng() < 0.5;

    if (useRemainder) {
      const quotient = 1 + Math.floor(rng() * 9);
      const remainder = 1 + Math.floor(rng() * (divisor - 1));
      const dividend = divisor * quotient + remainder;
      problems.push({ dividend, divisor, quotient, remainder });
    } else {
      const quotient = 1 + Math.floor(rng() * 9);
      const dividend = divisor * quotient;
      problems.push({ dividend, divisor, quotient, remainder: 0 });
    }
  }
  return problems;
}

function generateBoxEq(
  seed: number,
  ops: "addsub" | "all",
): BoxEqProblem[] {
  const rng = mulberry32(seed);
  const problems: BoxEqProblem[] = [];

  for (let i = 0; i < 12; i++) {
    const useMultDiv = ops === "all" && rng() < 0.5;

    if (useMultDiv) {
      // □ × b = c  or  a × □ = c  or  □ ÷ b = c  or  a ÷ □ = c
      const useMul = rng() < 0.5;
      if (useMul) {
        const a = 2 + Math.floor(rng() * 8);
        const b = 2 + Math.floor(rng() * 8);
        const c = a * b;
        if (rng() < 0.5) {
          problems.push({ display: `□ × ${b} ＝ ${c}`, answer: a });
        } else {
          problems.push({ display: `${a} × □ ＝ ${c}`, answer: b });
        }
      } else {
        const b = 2 + Math.floor(rng() * 8);
        const c = 1 + Math.floor(rng() * 9);
        const a = b * c;
        if (rng() < 0.5) {
          problems.push({ display: `□ ÷ ${b} ＝ ${c}`, answer: a });
        } else {
          problems.push({ display: `${a} ÷ □ ＝ ${c}`, answer: b });
        }
      }
    } else {
      // □ + b = c  or  a + □ = c  or  □ − b = c  or  a − □ = c
      const useAdd = rng() < 0.5;
      if (useAdd) {
        const c = 10 + Math.floor(rng() * 90);
        const a = 1 + Math.floor(rng() * (c - 1));
        const b = c - a;
        if (rng() < 0.5) {
          problems.push({ display: `□ ＋ ${b} ＝ ${c}`, answer: a });
        } else {
          problems.push({ display: `${a} ＋ □ ＝ ${c}`, answer: b });
        }
      } else {
        const a = 10 + Math.floor(rng() * 90);
        const b = 1 + Math.floor(rng() * (a - 1));
        const c = a - b;
        if (rng() < 0.5) {
          problems.push({ display: `□ − ${b} ＝ ${c}`, answer: a });
        } else {
          problems.push({ display: `${a} − □ ＝ ${c}`, answer: b });
        }
      }
    }
  }
  return problems;
}

function generateMentalMath(
  seed: number,
  mode: "add" | "sub" | "mixed",
): MentalMathProblem[] {
  const rng = mulberry32(seed);
  const problems: MentalMathProblem[] = [];

  for (let i = 0; i < 20; i++) {
    const useAdd = mode === "add" ? true : mode === "sub" ? false : rng() < 0.5;
    if (useAdd) {
      const left = 10 + Math.floor(rng() * 90);
      const right = 1 + Math.floor(rng() * 99);
      // keep sum ≤ 200 for mental math
      const r = Math.min(right, 200 - left);
      if (r < 1) { continue; }
      problems.push({ left, right: r, op: "+", answer: left + r });
    } else {
      const left = 10 + Math.floor(rng() * 90);
      const right = 1 + Math.floor(rng() * (left - 1));
      problems.push({ left, right, op: "−", answer: left - right });
    }
  }
  return problems.slice(0, 20);
}

function generateUnitConv3(
  seed: number,
  unitType: "length" | "weight" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const makeLengthProblem = (): TextProblem => {
    const type = Math.floor(rng() * 4);
    switch (type) {
      case 0: {
        const km = 1 + Math.floor(rng() * 9);
        const m = (1 + Math.floor(rng() * 9)) * 100;
        return { question: `${km}km ${m}m ＝ □m`, answer: `${km * 1000 + m}` };
      }
      case 1: {
        const km = 1 + Math.floor(rng() * 9);
        const m = (1 + Math.floor(rng() * 9)) * 100;
        const total = km * 1000 + m;
        return { question: `${total}m ＝ □km □m`, answer: `${km}km ${m}m` };
      }
      case 2: {
        const m = 1 + Math.floor(rng() * 9);
        const cm = 1 + Math.floor(rng() * 99);
        return { question: `${m}m ${cm}cm ＝ □cm`, answer: `${m * 100 + cm}` };
      }
      default: {
        const m = 1 + Math.floor(rng() * 9);
        const cm = 1 + Math.floor(rng() * 99);
        const total = m * 100 + cm;
        return { question: `${total}cm ＝ □m □cm`, answer: `${m}m ${cm}cm` };
      }
    }
  };

  const makeWeightProblem = (): TextProblem => {
    const type = Math.floor(rng() * 4);
    switch (type) {
      case 0: {
        const kg = 1 + Math.floor(rng() * 9);
        const g = (1 + Math.floor(rng() * 9)) * 100;
        return { question: `${kg}kg ${g}g ＝ □g`, answer: `${kg * 1000 + g}` };
      }
      case 1: {
        const kg = 1 + Math.floor(rng() * 9);
        const g = (1 + Math.floor(rng() * 9)) * 100;
        const total = kg * 1000 + g;
        return { question: `${total}g ＝ □kg □g`, answer: `${kg}kg ${g}g` };
      }
      case 2: {
        const t = 1 + Math.floor(rng() * 5);
        const kg = (1 + Math.floor(rng() * 9)) * 100;
        return { question: `${t}t ${kg}kg ＝ □kg`, answer: `${t * 1000 + kg}` };
      }
      default: {
        const t = 1 + Math.floor(rng() * 5);
        const kg = (1 + Math.floor(rng() * 9)) * 100;
        const total = t * 1000 + kg;
        return { question: `${total}kg ＝ □t □kg`, answer: `${t}t ${kg}kg` };
      }
    }
  };

  for (let i = 0; i < 10; i++) {
    if (unitType === "length") {
      problems.push(makeLengthProblem());
    } else if (unitType === "weight") {
      problems.push(makeWeightProblem());
    } else {
      problems.push(rng() < 0.5 ? makeLengthProblem() : makeWeightProblem());
    }
  }
  return problems;
}

function generateDecimalComp(
  seed: number,
  maxVal: number,
): DecimalCompProblem[] {
  const rng = mulberry32(seed);
  const problems: DecimalCompProblem[] = [];

  for (let i = 0; i < 15; i++) {
    let a: number, b: number;
    if (i < 2) {
      // guarantee some equal pairs
      a = Math.round((0.1 + rng() * maxVal) * 10) / 10;
      b = a;
    } else {
      a = Math.round((0.1 + rng() * maxVal) * 10) / 10;
      b = Math.round((0.1 + rng() * maxVal) * 10) / 10;
    }
    const answer: "＞" | "＜" | "＝" = a > b ? "＞" : a < b ? "＜" : "＝";
    problems.push({ left: a.toFixed(1), right: b.toFixed(1), answer });
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

const ALL_PARAMS = ["q", "answers", "rem", "ops", "mmode", "unit3", "dmax"];

function cleanParams(url: URL) {
  for (const k of ALL_PARAMS) url.searchParams.delete(k);
}

/* ================================================================
   Defaults
   ================================================================ */

const DIV_DEF = { rem: "mixed" as const };
const BOX_DEF = { ops: "addsub" as const };
const MENTAL_DEF = { mmode: "mixed" as const };
const UNIT3_DEF = { unit3: "mixed" as const };
const DCOMP_DEF = { dmax: 10 };

/* ================================================================
   Main component
   ================================================================ */

function Grade3({ operator }: { operator: string }) {
  const op = operator as Grade3Op;

  const getInitial = () => {
    const p = new URLSearchParams(window.location.search);
    const qHex = p.get("q");
    const seed = qHex ? hexToSeed(qHex) ?? randomSeed() : randomSeed();
    const showAnswers = p.get("answers") === "1";

    const remRaw = p.get("rem") ?? DIV_DEF.rem;
    const rem: "none" | "yes" | "mixed" =
      (["none", "yes", "mixed"] as const).includes(remRaw as any)
        ? (remRaw as any) : DIV_DEF.rem;

    const opsRaw = p.get("ops") ?? BOX_DEF.ops;
    const ops: "addsub" | "all" =
      opsRaw === "all" ? "all" : "addsub";

    const mmodeRaw = p.get("mmode") ?? MENTAL_DEF.mmode;
    const mmode: "add" | "sub" | "mixed" =
      mmodeRaw === "add" || mmodeRaw === "sub" ? mmodeRaw : "mixed";

    const unit3Raw = p.get("unit3") ?? UNIT3_DEF.unit3;
    const unit3: "length" | "weight" | "mixed" =
      (["length", "weight", "mixed"] as const).includes(unit3Raw as any)
        ? (unit3Raw as any) : UNIT3_DEF.unit3;

    const dmax = Math.max(5, Math.min(100,
      parseInt(p.get("dmax") ?? String(DCOMP_DEF.dmax), 10) || DCOMP_DEF.dmax));

    return { seed, showAnswers, rem, ops, mmode, unit3, dmax };
  };

  const [initial] = useState(getInitial);
  const [seed, setSeed] = useState(initial.seed);
  const [showAnswers, setShowAnswers] = useState(initial.showAnswers);
  const [showSettings, setShowSettings] = useState(false);

  const [rem, setRem] = useState(initial.rem);
  const [ops, setOps] = useState(initial.ops);
  const [mmode, setMmode] = useState(initial.mmode);
  const [unit3, setUnit3] = useState(initial.unit3);
  const [dmax, setDmax] = useState(initial.dmax);

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
      case "division":
        if (rem !== DIV_DEF.rem) m.rem = rem;
        break;
      case "box-eq":
        if (ops !== BOX_DEF.ops) m.ops = ops;
        break;
      case "mental-math":
        if (mmode !== MENTAL_DEF.mmode) m.mmode = mmode;
        break;
      case "unit-conv3":
        if (unit3 !== UNIT3_DEF.unit3) m.unit3 = unit3;
        break;
      case "decimal-comp":
        if (dmax !== DCOMP_DEF.dmax) m.dmax = String(dmax);
        break;
    }
    return m;
  }, [op, rem, ops, mmode, unit3, dmax]);

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

  const onRemChange = useCallback((v: "none" | "yes" | "mixed") => {
    setRem(v);
    const p: Record<string, string> = {};
    if (v !== DIV_DEF.rem) p.rem = v;
    regen(p);
  }, [regen]);

  const onOpsChange = useCallback((v: "addsub" | "all") => {
    setOps(v);
    const p: Record<string, string> = {};
    if (v !== BOX_DEF.ops) p.ops = v;
    regen(p);
  }, [regen]);

  const onMmodeChange = useCallback((v: "add" | "sub" | "mixed") => {
    setMmode(v);
    const p: Record<string, string> = {};
    if (v !== MENTAL_DEF.mmode) p.mmode = v;
    regen(p);
  }, [regen]);

  const onUnit3Change = useCallback((v: "length" | "weight" | "mixed") => {
    setUnit3(v);
    const p: Record<string, string> = {};
    if (v !== UNIT3_DEF.unit3) p.unit3 = v;
    regen(p);
  }, [regen]);

  const onDmaxChange = useCallback((v: number) => {
    setDmax(v);
    const p: Record<string, string> = {};
    if (v !== DCOMP_DEF.dmax) p.dmax = String(v);
    regen(p);
  }, [regen]);

  /* ---- generate problems ---- */

  const divProblems = useMemo(
    () => op === "division" ? generateDivision(seed, rem) : [],
    [op, seed, rem],
  );
  const boxProblems = useMemo(
    () => op === "box-eq" ? generateBoxEq(seed, ops) : [],
    [op, seed, ops],
  );
  const mentalProblems = useMemo(
    () => op === "mental-math" ? generateMentalMath(seed, mmode) : [],
    [op, seed, mmode],
  );
  const unitProblems = useMemo(
    () => op === "unit-conv3" ? generateUnitConv3(seed, unit3) : [],
    [op, seed, unit3],
  );
  const decimalProblems = useMemo(
    () => op === "decimal-comp" ? generateDecimalComp(seed, dmax) : [],
    [op, seed, dmax],
  );

  /* ---- settings panel ---- */

  const renderSettings = () => {
    switch (op) {
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
      case "box-eq":
        return (
          <div className="no-print settings-panel">
            <label>
              演算{" "}
              <select className="operator-select" value={ops}
                onChange={(e) => onOpsChange(e.target.value as any)}>
                <option value="addsub">＋・− のみ</option>
                <option value="all">＋・−・×・÷</option>
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
      case "unit-conv3":
        return (
          <div className="no-print settings-panel">
            <label>
              単位{" "}
              <select className="operator-select" value={unit3}
                onChange={(e) => onUnit3Change(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="length">長さ（m・km）</option>
                <option value="weight">重さ（g・kg・t）</option>
              </select>
            </label>
          </div>
        );
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
      default:
        return null;
    }
  };

  /* ---- render problems ---- */

  const renderProblems = () => {
    switch (op) {
      case "division":
        return (
          <div className="g1-page g1-cols-3">
            {divProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  <span className="g1-val">{p.dividend}</span>
                  <span className="g1-op">&divide;</span>
                  <span className="g1-val">{p.divisor}</span>
                  <span className="g1-op">=</span>
                  <Box answer={p.quotient} show={showAnswers} />
                  {p.remainder > 0 && (
                    <>
                      <span className="g1-op" style={{ fontSize: 18 }}>あまり</span>
                      <Box answer={p.remainder} show={showAnswers} />
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        );

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

      case "mental-math":
        return (
          <div className="g1-page g1-cols-4">
            {mentalProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  <span className="g1-val">{p.left}</span>
                  <span className="g1-op">{p.op}</span>
                  <span className="g1-val">{p.right}</span>
                  <span className="g1-op">=</span>
                  <Box answer={p.answer} show={showAnswers} />
                </span>
              </div>
            ))}
          </div>
        );

      case "unit-conv3":
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

export default Grade3;

export const devGrade3: ProblemGroup = {
  id: "dev3",
  label: "3年（開発中）",
  operators: [
    { operator: "division", label: "わり算" },
    { operator: "box-eq", label: "□を使った式" },
    { operator: "mental-math", label: "暗算" },
    { operator: "unit-conv3", label: "単位の換算" },
    { operator: "decimal-comp", label: "小数の大小比較" },
  ],
  Component: Grade3,
};
