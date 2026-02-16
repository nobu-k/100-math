import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { mulberry32, randomSeed, seedToHex, hexToSeed } from "../random";
import type { ProblemGroup } from "../types";

/* ================================================================
   Types
   ================================================================ */

type Grade4Op =
  | "mixed-calc"
  | "rounding"
  | "frac-conv"
  | "area"
  | "angle";

interface MixedCalcProblem {
  display: string;
  answer: number;
}

interface RoundingProblem {
  question: string;
  answer: string;
}

interface FracConvProblem {
  question: string;
  answer: string;
  /** For structured rendering */
  fromWhole?: number;
  fromNum?: number;
  fromDen?: number;
  toWhole?: number;
  toNum?: number;
  toDen?: number;
  direction: "to-mixed" | "to-improper";
}

interface AreaProblem {
  question: string;
  answer: string;
}

interface AngleProblem {
  display: string;
  answer: number;
}

/* ================================================================
   Generators
   ================================================================ */

function generateMixedCalc(
  seed: number,
  withParen: boolean,
): MixedCalcProblem[] {
  const rng = mulberry32(seed);
  const problems: MixedCalcProblem[] = [];

  for (let i = 0; i < 12; i++) {
    const useParen = withParen && rng() < 0.5;

    if (useParen) {
      // (a ○ b) ○ c  or  a ○ (b ○ c)
      const leftParen = rng() < 0.5;
      if (leftParen) {
        // (a ○1 b) ○2 c
        const op2IsMul = rng() < 0.5;
        if (op2IsMul) {
          // (a ± b) × c
          const c = 2 + Math.floor(rng() * 8);
          const useAdd = rng() < 0.5;
          if (useAdd) {
            const a = 1 + Math.floor(rng() * 20);
            const b = 1 + Math.floor(rng() * 20);
            const ans = (a + b) * c;
            problems.push({ display: `(${a} ＋ ${b}) × ${c}`, answer: ans });
          } else {
            const b = 1 + Math.floor(rng() * 15);
            const a = b + 1 + Math.floor(rng() * 15);
            const ans = (a - b) * c;
            problems.push({ display: `(${a} − ${b}) × ${c}`, answer: ans });
          }
        } else {
          // (a ± b) ÷ c — ensure divisible
          const c = 2 + Math.floor(rng() * 8);
          const quot = 1 + Math.floor(rng() * 10);
          const sum = quot * c;
          const useAdd = rng() < 0.5;
          if (useAdd) {
            const a = 1 + Math.floor(rng() * (sum - 1));
            const b = sum - a;
            if (b > 0) {
              problems.push({ display: `(${a} ＋ ${b}) ÷ ${c}`, answer: quot });
            }
          } else {
            const b = 1 + Math.floor(rng() * 20);
            const a = sum + b;
            problems.push({ display: `(${a} − ${b}) ÷ ${c}`, answer: quot });
          }
        }
      } else {
        // a ○2 (b ○1 c)
        const op2IsMul = rng() < 0.5;
        if (op2IsMul) {
          // a × (b ± c)
          const a = 2 + Math.floor(rng() * 8);
          const useAdd = rng() < 0.5;
          if (useAdd) {
            const b = 1 + Math.floor(rng() * 15);
            const c = 1 + Math.floor(rng() * 15);
            const ans = a * (b + c);
            problems.push({ display: `${a} × (${b} ＋ ${c})`, answer: ans });
          } else {
            const c = 1 + Math.floor(rng() * 10);
            const b = c + 1 + Math.floor(rng() * 15);
            const ans = a * (b - c);
            problems.push({ display: `${a} × (${b} − ${c})`, answer: ans });
          }
        } else {
          // a ± (b × c)  or  a ± (b + c)
          const b = 2 + Math.floor(rng() * 8);
          const c = 2 + Math.floor(rng() * 8);
          const inner = b * c;
          const a = inner + 1 + Math.floor(rng() * 50);
          const ans = a - inner;
          problems.push({ display: `${a} − (${b} × ${c})`, answer: ans });
        }
      }
    } else {
      // No parentheses: a ○1 b ○2 c (with precedence)
      const pattern = Math.floor(rng() * 4);
      switch (pattern) {
        case 0: {
          // a + b × c
          const b = 2 + Math.floor(rng() * 9);
          const c = 2 + Math.floor(rng() * 9);
          const a = 1 + Math.floor(rng() * 50);
          problems.push({ display: `${a} ＋ ${b} × ${c}`, answer: a + b * c });
          break;
        }
        case 1: {
          // a - b × c (ensure positive)
          const b = 2 + Math.floor(rng() * 5);
          const c = 2 + Math.floor(rng() * 5);
          const prod = b * c;
          const a = prod + 1 + Math.floor(rng() * 50);
          problems.push({ display: `${a} − ${b} × ${c}`, answer: a - prod });
          break;
        }
        case 2: {
          // a × b + c
          const a = 2 + Math.floor(rng() * 9);
          const b = 2 + Math.floor(rng() * 9);
          const c = 1 + Math.floor(rng() * 50);
          problems.push({ display: `${a} × ${b} ＋ ${c}`, answer: a * b + c });
          break;
        }
        default: {
          // a × b - c (ensure positive)
          const a = 2 + Math.floor(rng() * 9);
          const b = 2 + Math.floor(rng() * 9);
          const prod = a * b;
          const c = 1 + Math.floor(rng() * (prod - 1));
          problems.push({ display: `${a} × ${b} − ${c}`, answer: prod - c });
          break;
        }
      }
    }
  }
  // fill any gaps
  while (problems.length < 12) {
    const a = 2 + Math.floor(rng() * 9);
    const b = 2 + Math.floor(rng() * 9);
    const c = 1 + Math.floor(rng() * 50);
    problems.push({ display: `${a} × ${b} ＋ ${c}`, answer: a * b + c });
  }
  return problems.slice(0, 12);
}

function generateRounding(
  seed: number,
  digits: number,
): RoundingProblem[] {
  const rng = mulberry32(seed);
  const problems: RoundingProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const numDigits = 3 + Math.floor(rng() * digits);
    const min = Math.pow(10, numDigits - 1);
    const max = Math.pow(10, numDigits) - 1;
    const n = min + Math.floor(rng() * (max - min + 1));

    // pick rounding position
    const positions = ["十の位", "百の位", "千の位"];
    const posIdx = Math.min(Math.floor(rng() * numDigits - 1), positions.length - 1);
    const pos = positions[Math.max(0, posIdx)];

    // round
    let divisor: number;
    switch (pos) {
      case "十の位": divisor = 10; break;
      case "百の位": divisor = 100; break;
      default: divisor = 1000; break;
    }
    const rounded = Math.round(n / divisor) * divisor;

    problems.push({
      question: `${n} を${pos}までの概数にしなさい`,
      answer: String(rounded),
    });
  }
  return problems;
}

function generateFracConv(
  seed: number,
  direction: "to-mixed" | "to-improper" | "both",
): FracConvProblem[] {
  const rng = mulberry32(seed);
  const problems: FracConvProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const dir = direction === "both"
      ? (rng() < 0.5 ? "to-mixed" : "to-improper")
      : direction;

    const den = 2 + Math.floor(rng() * 9); // 2-10
    const whole = 1 + Math.floor(rng() * 5);
    const partNum = 1 + Math.floor(rng() * (den - 1)); // 1 to den-1
    const improperNum = whole * den + partNum;

    if (dir === "to-mixed") {
      problems.push({
        question: `${improperNum}/${den} を帯分数にしなさい`,
        answer: `${whole}と${partNum}/${den}`,
        fromNum: improperNum, fromDen: den,
        toWhole: whole, toNum: partNum, toDen: den,
        direction: "to-mixed",
      });
    } else {
      problems.push({
        question: `${whole}と${partNum}/${den} を仮分数にしなさい`,
        answer: `${improperNum}/${den}`,
        fromWhole: whole, fromNum: partNum, fromDen: den,
        toNum: improperNum, toDen: den,
        direction: "to-improper",
      });
    }
  }
  return problems;
}

function generateArea(
  seed: number,
  shape: "square" | "rect" | "mixed",
): AreaProblem[] {
  const rng = mulberry32(seed);
  const problems: AreaProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const useSquare = shape === "square" ? true : shape === "rect" ? false : rng() < 0.4;
    const reverse = rng() < 0.3;

    if (useSquare) {
      const side = 2 + Math.floor(rng() * 18);
      const area = side * side;
      if (reverse) {
        problems.push({
          question: `面積が${area}cm²の正方形の一辺の長さは？`,
          answer: `${side}cm`,
        });
      } else {
        problems.push({
          question: `一辺${side}cmの正方形の面積は？`,
          answer: `${area}cm²`,
        });
      }
    } else {
      const w = 2 + Math.floor(rng() * 15);
      const h = 2 + Math.floor(rng() * 15);
      const area = w * h;
      if (reverse) {
        problems.push({
          question: `面積が${area}cm²、たて${h}cmの長方形のよこは？`,
          answer: `${w}cm`,
        });
      } else {
        problems.push({
          question: `たて${h}cm、よこ${w}cmの長方形の面積は？`,
          answer: `${area}cm²`,
        });
      }
    }
  }
  return problems;
}

function generateAngle(
  seed: number,
): AngleProblem[] {
  const rng = mulberry32(seed);
  const problems: AngleProblem[] = [];
  const baseAngles = [30, 45, 60, 90, 120, 135, 150];

  for (let i = 0; i < 10; i++) {
    const type = Math.floor(rng() * 3);
    switch (type) {
      case 0: {
        // 180 - x = ?
        const x = baseAngles[Math.floor(rng() * baseAngles.length)];
        problems.push({ display: `180° − ${x}°`, answer: 180 - x });
        break;
      }
      case 1: {
        // x + y = ?
        const x = baseAngles[Math.floor(rng() * baseAngles.length)];
        const y = baseAngles[Math.floor(rng() * baseAngles.length)];
        if (x + y <= 360) {
          problems.push({ display: `${x}° ＋ ${y}°`, answer: x + y });
        } else {
          problems.push({ display: `${x}° ＋ ${30}°`, answer: x + 30 });
        }
        break;
      }
      default: {
        // 360 - x = ?
        const x = 90 + baseAngles[Math.floor(rng() * 4)] ; // keep it reasonable
        problems.push({ display: `360° − ${x}°`, answer: 360 - x });
        break;
      }
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

function Frac({ num, den, cls }: { num: number; den: number; cls?: string }) {
  return (
    <span className={`dev-frac${cls ? " " + cls : ""}`}>
      <span className="dev-frac-num">{num}</span>
      <span className="dev-frac-den">{den}</span>
    </span>
  );
}

/* ================================================================
   URL state helpers
   ================================================================ */

const ALL_PARAMS = ["q", "answers", "paren", "rd", "fdir", "shape", "atype"];

function cleanParams(url: URL) {
  for (const k of ALL_PARAMS) url.searchParams.delete(k);
}

/* ================================================================
   Defaults
   ================================================================ */

const ROUND_DEF = { rd: 3 };
const FRAC_DEF = { fdir: "both" as const };
const AREA_DEF = { shape: "mixed" as const };

/* ================================================================
   Main component
   ================================================================ */

function Grade4({ operator }: { operator: string }) {
  const op = operator as Grade4Op;

  const getInitial = () => {
    const p = new URLSearchParams(window.location.search);
    const qHex = p.get("q");
    const seed = qHex ? hexToSeed(qHex) ?? randomSeed() : randomSeed();
    const showAnswers = p.get("answers") === "1";

    const paren = p.get("paren") !== "0";
    const rd = Math.max(1, Math.min(4,
      parseInt(p.get("rd") ?? String(ROUND_DEF.rd), 10) || ROUND_DEF.rd));

    const fdirRaw = p.get("fdir") ?? FRAC_DEF.fdir;
    const fdir: "to-mixed" | "to-improper" | "both" =
      (["to-mixed", "to-improper", "both"] as const).includes(fdirRaw as any)
        ? (fdirRaw as any) : FRAC_DEF.fdir;

    const shapeRaw = p.get("shape") ?? AREA_DEF.shape;
    const shape: "square" | "rect" | "mixed" =
      (["square", "rect", "mixed"] as const).includes(shapeRaw as any)
        ? (shapeRaw as any) : AREA_DEF.shape;

    return { seed, showAnswers, paren, rd, fdir, shape };
  };

  const [initial] = useState(getInitial);
  const [seed, setSeed] = useState(initial.seed);
  const [showAnswers, setShowAnswers] = useState(initial.showAnswers);
  const [showSettings, setShowSettings] = useState(false);

  const [paren, setParen] = useState(initial.paren);
  const [rd, setRd] = useState(initial.rd);
  const [fdir, setFdir] = useState(initial.fdir);
  const [shape, setShape] = useState(initial.shape);

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
      case "mixed-calc":
        if (!paren) m.paren = "0";
        break;
      case "rounding":
        if (rd !== ROUND_DEF.rd) m.rd = String(rd);
        break;
      case "frac-conv":
        if (fdir !== FRAC_DEF.fdir) m.fdir = fdir;
        break;
      case "area":
        if (shape !== AREA_DEF.shape) m.shape = shape;
        break;
      case "angle":
        break;
    }
    return m;
  }, [op, paren, rd, fdir, shape]);

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

  const onParenChange = useCallback((v: boolean) => {
    setParen(v);
    const p: Record<string, string> = {};
    if (!v) p.paren = "0";
    regen(p);
  }, [regen]);

  const onRdChange = useCallback((v: number) => {
    setRd(v);
    const p: Record<string, string> = {};
    if (v !== ROUND_DEF.rd) p.rd = String(v);
    regen(p);
  }, [regen]);

  const onFdirChange = useCallback((v: "to-mixed" | "to-improper" | "both") => {
    setFdir(v);
    const p: Record<string, string> = {};
    if (v !== FRAC_DEF.fdir) p.fdir = v;
    regen(p);
  }, [regen]);

  const onShapeChange = useCallback((v: "square" | "rect" | "mixed") => {
    setShape(v);
    const p: Record<string, string> = {};
    if (v !== AREA_DEF.shape) p.shape = v;
    regen(p);
  }, [regen]);

  /* ---- generate problems ---- */

  const mixedProblems = useMemo(
    () => op === "mixed-calc" ? generateMixedCalc(seed, paren) : [],
    [op, seed, paren],
  );
  const roundProblems = useMemo(
    () => op === "rounding" ? generateRounding(seed, rd) : [],
    [op, seed, rd],
  );
  const fracProblems = useMemo(
    () => op === "frac-conv" ? generateFracConv(seed, fdir) : [],
    [op, seed, fdir],
  );
  const areaProblems = useMemo(
    () => op === "area" ? generateArea(seed, shape) : [],
    [op, seed, shape],
  );
  const angleProblems = useMemo(
    () => op === "angle" ? generateAngle(seed) : [],
    [op, seed],
  );

  /* ---- settings panel ---- */

  const renderSettings = () => {
    switch (op) {
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
      case "rounding":
        return (
          <div className="no-print settings-panel">
            <label>
              数の桁数{" "}
              <select className="operator-select" value={rd}
                onChange={(e) => onRdChange(Number(e.target.value))}>
                <option value={2}>3〜4桁</option>
                <option value={3}>3〜5桁</option>
                <option value={4}>3〜6桁</option>
              </select>
            </label>
          </div>
        );
      case "frac-conv":
        return (
          <div className="no-print settings-panel">
            <label>
              変換方向{" "}
              <select className="operator-select" value={fdir}
                onChange={(e) => onFdirChange(e.target.value as any)}>
                <option value="both">両方</option>
                <option value="to-mixed">仮分数→帯分数</option>
                <option value="to-improper">帯分数→仮分数</option>
              </select>
            </label>
          </div>
        );
      case "area":
        return (
          <div className="no-print settings-panel">
            <label>
              図形{" "}
              <select className="operator-select" value={shape}
                onChange={(e) => onShapeChange(e.target.value as any)}>
                <option value="mixed">正方形・長方形</option>
                <option value="square">正方形のみ</option>
                <option value="rect">長方形のみ</option>
              </select>
            </label>
          </div>
        );
      case "angle":
        return null;
      default:
        return null;
    }
  };

  /* ---- render problems ---- */

  const renderProblems = () => {
    switch (op) {
      case "mixed-calc":
        return (
          <div className="g1-page g1-cols-2">
            {mixedProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  <span className="dev-text-q">{p.display}</span>
                  <span className="g1-op">=</span>
                  <Box answer={p.answer} show={showAnswers} />
                </span>
              </div>
            ))}
          </div>
        );

      case "rounding":
        return (
          <div className="dev-text-page">
            {roundProblems.map((p, i) => (
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

      case "frac-conv":
        return (
          <div className="dev-text-page">
            {fracProblems.map((p, i) => (
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

      case "area":
        return (
          <div className="dev-text-page">
            {areaProblems.map((p, i) => (
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

      case "angle":
        return (
          <div className="g1-page g1-cols-2">
            {angleProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  <span className="dev-text-q">{p.display}</span>
                  <span className="g1-op">=</span>
                  <Box answer={`${p.answer}°`} show={showAnswers} />
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

export default Grade4;

export const devGrade4: ProblemGroup = {
  id: "dev4",
  label: "4年（開発中）",
  operators: [
    { operator: "mixed-calc", label: "四則混合" },
    { operator: "rounding", label: "四捨五入" },
    { operator: "frac-conv", label: "分数の変換" },
    { operator: "area", label: "面積" },
    { operator: "angle", label: "角度" },
  ],
  Component: Grade4,
};
