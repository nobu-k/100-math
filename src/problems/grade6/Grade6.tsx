import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { mulberry32, randomSeed, seedToHex, hexToSeed } from "../random";
import type { ProblemGroup } from "../types";

/* ================================================================
   Types
   ================================================================ */

type Grade6Op =
  | "frac-mul"
  | "frac-div"
  | "ratio"
  | "circle-area"
  | "proportion";

interface FracProblem {
  aNum: number; aDen: number;
  bNum: number; bDen: number;
  ansNum: number; ansDen: number;
  /** optional whole part for mixed number answers */
  ansWhole?: number;
  ansPartNum?: number;
}

interface TextProblem {
  question: string;
  answer: string;
}

interface ProportionProblem {
  label: string; // "比例" or "反比例"
  xValues: number[];
  yValues: (number | null)[];
  answers: number[];
}

/* ================================================================
   Helpers
   ================================================================ */

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function simplify(num: number, den: number): [number, number] {
  const g = gcd(num, den);
  return [num / g, den / g];
}

/* ================================================================
   Generators
   ================================================================ */

function generateFracMul(seed: number): FracProblem[] {
  const rng = mulberry32(seed);
  const problems: FracProblem[] = [];

  for (let i = 0; i < 12; i++) {
    const aDen = 2 + Math.floor(rng() * 9);
    const aNum = 1 + Math.floor(rng() * (aDen * 2));
    const bDen = 2 + Math.floor(rng() * 9);
    const bNum = 1 + Math.floor(rng() * (bDen * 2));

    const rawNum = aNum * bNum;
    const rawDen = aDen * bDen;
    const [sNum, sDen] = simplify(rawNum, rawDen);

    const ansWhole = Math.floor(sNum / sDen);
    const ansPartNum = sNum % sDen;

    problems.push({
      aNum, aDen, bNum, bDen,
      ansNum: sNum, ansDen: sDen,
      ...(ansWhole > 0 && ansPartNum > 0 ? { ansWhole, ansPartNum } : {}),
    });
  }
  return problems;
}

function generateFracDiv(seed: number): FracProblem[] {
  const rng = mulberry32(seed);
  const problems: FracProblem[] = [];

  for (let i = 0; i < 12; i++) {
    const aDen = 2 + Math.floor(rng() * 9);
    const aNum = 1 + Math.floor(rng() * (aDen * 2));
    const bDen = 2 + Math.floor(rng() * 9);
    const bNum = 1 + Math.floor(rng() * (bDen * 2));

    // a/b ÷ c/d = a/b × d/c = (a*d)/(b*c)
    const rawNum = aNum * bDen;
    const rawDen = aDen * bNum;
    const [sNum, sDen] = simplify(rawNum, rawDen);

    const ansWhole = Math.floor(sNum / sDen);
    const ansPartNum = sNum % sDen;

    problems.push({
      aNum, aDen, bNum, bDen,
      ansNum: sNum, ansDen: sDen,
      ...(ansWhole > 0 && ansPartNum > 0 ? { ansWhole, ansPartNum } : {}),
    });
  }
  return problems;
}

function generateRatio(
  seed: number,
  type: "simplify" | "fill" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 12; i++) {
    const t = type === "mixed"
      ? (rng() < 0.5 ? "simplify" : "fill")
      : type;

    if (t === "simplify") {
      // Simplify a ratio: e.g. "12:18 → 2:3"
      const base1 = 1 + Math.floor(rng() * 9);
      const base2 = 1 + Math.floor(rng() * 9);
      const mult = 2 + Math.floor(rng() * 5);
      const a = base1 * mult;
      const b = base2 * mult;
      const g = gcd(a, b);
      problems.push({
        question: `${a}：${b} を最も簡単な整数の比にしなさい`,
        answer: `${a / g}：${b / g}`,
      });
    } else {
      // Fill blank: "3:5 = □:20" → 12
      const a = 1 + Math.floor(rng() * 9);
      const b = 1 + Math.floor(rng() * 9);
      const mult = 2 + Math.floor(rng() * 5);
      if (rng() < 0.5) {
        // blank on left: □:b*mult = a:b → □ = a*mult
        problems.push({
          question: `${a}：${b} ＝ □：${b * mult}`,
          answer: `${a * mult}`,
        });
      } else {
        // blank on right: a*mult:□ = a:b → □ = b*mult
        problems.push({
          question: `${a}：${b} ＝ ${a * mult}：□`,
          answer: `${b * mult}`,
        });
      }
    }
  }
  return problems;
}

function generateCircleArea(
  seed: number,
  type: "basic" | "half" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const t = type === "mixed"
      ? (rng() < 0.6 ? "basic" : "half")
      : type;

    const radius = 1 + Math.floor(rng() * 15);

    if (t === "basic") {
      const area = radius * radius * 3.14;
      // round to 2 decimal places
      const areaStr = Number(area.toFixed(2)).toString();
      problems.push({
        question: `半径${radius}cmの円の面積は？（円周率3.14）`,
        answer: `${areaStr}cm²`,
      });
    } else {
      // semicircle
      const area = radius * radius * 3.14 / 2;
      const areaStr = Number(area.toFixed(2)).toString();
      problems.push({
        question: `半径${radius}cmの半円の面積は？（円周率3.14）`,
        answer: `${areaStr}cm²`,
      });
    }
  }
  return problems;
}

function generateProportion(
  seed: number,
  propType: "direct" | "inverse" | "mixed",
): ProportionProblem[] {
  const rng = mulberry32(seed);
  const problems: ProportionProblem[] = [];

  for (let i = 0; i < 6; i++) {
    const isDirect = propType === "direct" ? true
      : propType === "inverse" ? false
      : rng() < 0.5;

    const constant = 2 + Math.floor(rng() * 11); // 2-12
    const xValues = [1, 2, 3, 4, 5, 6];

    if (isDirect) {
      // y = constant * x
      const allY = xValues.map(x => constant * x);
      // blank 2 random y values
      const blankIndices = new Set<number>();
      while (blankIndices.size < 2) {
        blankIndices.add(Math.floor(rng() * 6));
      }
      const yValues: (number | null)[] = allY.map((y, idx) =>
        blankIndices.has(idx) ? null : y
      );
      const answers = [...blankIndices].sort().map(idx => allY[idx]);
      problems.push({ label: "比例", xValues, yValues, answers });
    } else {
      // y = constant / x — only use x values that divide evenly
      const xVals = [1, 2, 3, 4, 6]; // all divide into reasonable numbers
      const c = (2 + Math.floor(rng() * 5)) * 12; // 24,36,48,60,72 — divisible by 1,2,3,4,6
      const allY = xVals.map(x => c / x);
      const blankIndices = new Set<number>();
      while (blankIndices.size < 2) {
        blankIndices.add(Math.floor(rng() * xVals.length));
      }
      const yValues: (number | null)[] = allY.map((y, idx) =>
        blankIndices.has(idx) ? null : y
      );
      const answers = [...blankIndices].sort().map(idx => allY[idx]);
      problems.push({ label: "反比例", xValues: xVals, yValues, answers });
    }
  }
  return problems;
}

/* ================================================================
   Shared components
   ================================================================ */

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

const ALL_PARAMS = ["q", "answers", "rtype", "ctype", "ptype"];

function cleanParams(url: URL) {
  for (const k of ALL_PARAMS) url.searchParams.delete(k);
}

/* ================================================================
   Defaults
   ================================================================ */

const RATIO_DEF = { rtype: "mixed" as const };
const CIRCLE_DEF = { ctype: "mixed" as const };
const PROP_DEF = { ptype: "mixed" as const };

/* ================================================================
   Main component
   ================================================================ */

function Grade6({ operator }: { operator: string }) {
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

    return { seed, showAnswers, rtype, ctype, ptype };
  };

  const [initial] = useState(getInitial);
  const [seed, setSeed] = useState(initial.seed);
  const [showAnswers, setShowAnswers] = useState(initial.showAnswers);
  const [showSettings, setShowSettings] = useState(false);

  const [rtype, setRtype] = useState(initial.rtype);
  const [ctype, setCtype] = useState(initial.ctype);
  const [ptype, setPtype] = useState(initial.ptype);

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
      case "frac-mul":
      case "frac-div":
        break;
    }
    return m;
  }, [op, rtype, ctype, ptype]);

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

  /* ---- settings panel ---- */

  const renderSettings = () => {
    switch (op) {
      case "frac-mul":
      case "frac-div":
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

export default Grade6;

export const devGrade6: ProblemGroup = {
  id: "dev6",
  label: "6年（開発中）",
  operators: [
    { operator: "frac-mul", label: "分数×分数" },
    { operator: "frac-div", label: "分数÷分数" },
    { operator: "ratio", label: "比" },
    { operator: "circle-area", label: "円の面積" },
    { operator: "proportion", label: "比例と反比例" },
  ],
  Component: Grade6,
};
