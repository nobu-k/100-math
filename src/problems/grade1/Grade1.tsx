import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { mulberry32, randomSeed, seedToHex, hexToSeed } from "../random";

/* ================================================================
   Types
   ================================================================ */

type Grade1Op =
  | "decomposition"
  | "fill-blank"
  | "comparison"
  | "sequence"
  | "clock";

interface DecompositionProblem {
  target: number;
  given: number;
  answer: number;
  /** "left"  → target = given + □
   *  "right" → target = □ + given */
  position: "left" | "right";
}

interface FillBlankProblem {
  /** null = blank */
  left: number | null;
  right: number | null;
  result: number;
  op: "+" | "−";
  answer: number;
}

interface ComparisonProblem {
  left: number;
  right: number;
  answer: "＞" | "＜" | "＝";
}

interface SequenceProblem {
  cells: (number | null)[]; // null = blank
  answers: number[];
}

interface ClockProblem {
  hour: number;   // 1‑12
  minute: number; // 0‑59
}

/* ================================================================
   Generators
   ================================================================ */

function generateDecomposition(
  seed: number,
  target: number,
): DecompositionProblem[] {
  const rng = mulberry32(seed);
  const problems: DecompositionProblem[] = [];
  for (let i = 0; i < 12; i++) {
    const given = 1 + Math.floor(rng() * (target - 1));
    const answer = target - given;
    const position: "left" | "right" = rng() < 0.5 ? "left" : "right";
    problems.push({ target, given, answer, position });
  }
  return problems;
}

function generateFillBlank(
  seed: number,
  max: number,
  mode: "add" | "sub" | "mixed",
): FillBlankProblem[] {
  const rng = mulberry32(seed);
  const problems: FillBlankProblem[] = [];
  for (let i = 0; i < 12; i++) {
    const useAdd =
      mode === "add" ? true : mode === "sub" ? false : rng() < 0.5;
    if (useAdd) {
      const c = 2 + Math.floor(rng() * (max - 1));
      const a = 1 + Math.floor(rng() * (c - 1));
      const b = c - a;
      if (rng() < 0.5) {
        problems.push({ left: null, right: b, result: c, op: "+", answer: a });
      } else {
        problems.push({ left: a, right: null, result: c, op: "+", answer: b });
      }
    } else {
      const a = 2 + Math.floor(rng() * (max - 1));
      const b = 1 + Math.floor(rng() * (a - 1));
      const c = a - b;
      if (rng() < 0.5) {
        problems.push({ left: null, right: b, result: c, op: "−", answer: a });
      } else {
        problems.push({ left: a, right: null, result: c, op: "−", answer: b });
      }
    }
  }
  return problems;
}

function generateComparison(
  seed: number,
  max: number,
): ComparisonProblem[] {
  const rng = mulberry32(seed);
  const problems: ComparisonProblem[] = [];
  for (let i = 0; i < 15; i++) {
    let left: number, right: number;
    if (i < 2) {
      // guarantee a couple of equal pairs
      left = 1 + Math.floor(rng() * max);
      right = left;
    } else {
      left = 1 + Math.floor(rng() * max);
      right = 1 + Math.floor(rng() * max);
    }
    const answer: "＞" | "＜" | "＝" =
      left > right ? "＞" : left < right ? "＜" : "＝";
    problems.push({ left, right, answer });
  }
  return problems;
}

function generateSequence(
  seed: number,
  step: number,
  max: number,
): SequenceProblem[] {
  const rng = mulberry32(seed);
  const problems: SequenceProblem[] = [];
  const length = 8;

  for (let i = 0; i < 6; i++) {
    const ascending = rng() < 0.7;
    let start: number;
    if (ascending) {
      const maxStart = max - step * (length - 1);
      if (maxStart < 1) {
        start = step;
      } else {
        start = 1 + Math.floor(rng() * maxStart);
        if (step > 1) start = Math.max(step, Math.ceil(start / step) * step);
      }
    } else {
      const minStart = step * (length - 1) + 1;
      if (minStart > max) {
        start = max;
      } else {
        start = minStart + Math.floor(rng() * (max - minStart + 1));
        if (step > 1) start = Math.floor(start / step) * step;
        if (start < minStart) start = minStart;
      }
    }

    const allNums: number[] = [];
    for (let j = 0; j < length; j++) {
      allNums.push(ascending ? start + step * j : start - step * j);
    }

    // pick 3 blanks (not first or last)
    const inner = Array.from({ length: length - 2 }, (_, k) => k + 1);
    for (let j = inner.length - 1; j > 0; j--) {
      const k = Math.floor(rng() * (j + 1));
      [inner[j], inner[k]] = [inner[k], inner[j]];
    }
    const blankSet = new Set(inner.slice(0, 3));

    const cells: (number | null)[] = [];
    const answers: number[] = [];
    for (let j = 0; j < length; j++) {
      if (blankSet.has(j)) {
        cells.push(null);
        answers.push(allNums[j]);
      } else {
        cells.push(allNums[j]);
      }
    }
    problems.push({ cells, answers });
  }
  return problems;
}

function generateClock(
  seed: number,
  precision: "hour" | "half" | "5min" | "1min",
): ClockProblem[] {
  const rng = mulberry32(seed);
  const problems: ClockProblem[] = [];
  for (let i = 0; i < 8; i++) {
    const hour = 1 + Math.floor(rng() * 12);
    let minute: number;
    switch (precision) {
      case "hour":
        minute = 0;
        break;
      case "half":
        minute = rng() < 0.5 ? 0 : 30;
        break;
      case "5min":
        minute = Math.floor(rng() * 12) * 5;
        break;
      case "1min":
        minute = Math.floor(rng() * 60);
        break;
    }
    problems.push({ hour, minute });
  }
  return problems;
}

/* ================================================================
   Clock SVG
   ================================================================ */

function ClockFace({ hour, minute }: { hour: number; minute: number }) {
  const cx = 100, cy = 100, r = 88;
  const hourAngle = ((hour % 12) + minute / 60) * 30;
  const minuteAngle = minute * 6;

  const hand = (angle: number, len: number, w: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return (
      <line
        x1={cx}
        y1={cy}
        x2={cx + len * Math.cos(rad)}
        y2={cy + len * Math.sin(rad)}
        stroke="#000"
        strokeWidth={w}
        strokeLinecap="round"
      />
    );
  };

  return (
    <svg className="g1-clock-svg" viewBox="0 0 200 200">
      {/* face */}
      <circle cx={cx} cy={cy} r={r} fill="#fff" stroke="#000" strokeWidth="3" />
      {/* hour marks & numbers */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = ((i * 30 - 90) * Math.PI) / 180;
        const inner = r - 10;
        const numR = r - 22;
        return (
          <g key={i}>
            <line
              x1={cx + inner * Math.cos(a)}
              y1={cy + inner * Math.sin(a)}
              x2={cx + r * Math.cos(a)}
              y2={cy + r * Math.sin(a)}
              stroke="#000"
              strokeWidth="3"
            />
            <text
              x={cx + numR * Math.cos(a)}
              y={cy + numR * Math.sin(a)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="18"
              fontWeight="bold"
              fill="#000"
            >
              {i === 0 ? 12 : i}
            </text>
          </g>
        );
      })}
      {/* minute ticks */}
      {Array.from({ length: 60 }, (_, i) => {
        if (i % 5 === 0) return null;
        const a = ((i * 6 - 90) * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={cx + (r - 4) * Math.cos(a)}
            y1={cy + (r - 4) * Math.sin(a)}
            x2={cx + r * Math.cos(a)}
            y2={cy + r * Math.sin(a)}
            stroke="#000"
            strokeWidth="1"
          />
        );
      })}
      {/* hands */}
      {hand(hourAngle, 48, 5)}
      {hand(minuteAngle, 68, 3)}
      {/* center */}
      <circle cx={cx} cy={cy} r="4" fill="#000" />
    </svg>
  );
}

/* ================================================================
   Helpers: Blank box component
   ================================================================ */

function Box({
  answer,
  show,
}: {
  answer: number | string;
  show: boolean;
}) {
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

const ALL_PARAMS = [
  "q", "answers", "target", "max", "mode", "step", "smax", "prec",
];

function cleanParams(url: URL) {
  for (const k of ALL_PARAMS) url.searchParams.delete(k);
}

/* ================================================================
   Defaults per operator
   ================================================================ */

interface DecompDefaults { target: number }
interface FillDefaults { max: number; mode: "add" | "sub" | "mixed" }
interface CompDefaults { max: number }
interface SeqDefaults { step: number; max: number }
interface ClockDefaults { prec: "hour" | "half" | "5min" | "1min" }

const DECOMP_DEF: DecompDefaults = { target: 10 };
const FILL_DEF: FillDefaults = { max: 10, mode: "mixed" };
const COMP_DEF: CompDefaults = { max: 20 };
const SEQ_DEF: SeqDefaults = { step: 2, max: 20 };
const CLOCK_DEF: ClockDefaults = { prec: "half" };

/* ================================================================
   Main component
   ================================================================ */

export default function Grade1({ operator }: { operator: string }) {
  const op = operator as Grade1Op;

  // ---- read initial URL state ----
  const getInitial = () => {
    const p = new URLSearchParams(window.location.search);
    const qHex = p.get("q");
    const seed = qHex ? hexToSeed(qHex) ?? randomSeed() : randomSeed();
    const showAnswers = p.get("answers") === "1";

    // operator-specific settings
    const target = Math.max(2, Math.min(20,
      parseInt(p.get("target") ?? String(DECOMP_DEF.target), 10) || DECOMP_DEF.target));
    const max = Math.max(5, Math.min(100,
      parseInt(p.get("max") ?? String(op === "comparison" ? COMP_DEF.max : FILL_DEF.max), 10)
        || (op === "comparison" ? COMP_DEF.max : FILL_DEF.max)));
    const modeRaw = p.get("mode") ?? FILL_DEF.mode;
    const mode: "add" | "sub" | "mixed" =
      modeRaw === "add" || modeRaw === "sub" ? modeRaw : "mixed";
    const step = Math.max(1, Math.min(10,
      parseInt(p.get("step") ?? String(SEQ_DEF.step), 10) || SEQ_DEF.step));
    const smax = Math.max(10, Math.min(100,
      parseInt(p.get("smax") ?? String(SEQ_DEF.max), 10) || SEQ_DEF.max));
    const precRaw = p.get("prec") ?? CLOCK_DEF.prec;
    const prec: "hour" | "half" | "5min" | "1min" =
      (["hour", "half", "5min", "1min"] as const).includes(precRaw as any)
        ? (precRaw as any) : CLOCK_DEF.prec;

    return { seed, showAnswers, target, max, mode, step, smax, prec };
  };

  const [initial] = useState(getInitial);
  const [seed, setSeed] = useState(initial.seed);
  const [showAnswers, setShowAnswers] = useState(initial.showAnswers);
  const [showSettings, setShowSettings] = useState(false);

  // per-operator settings
  const [target, setTarget] = useState(initial.target);
  const [max, setMax] = useState(initial.max);
  const [mode, setMode] = useState(initial.mode);
  const [step, setStep] = useState(initial.step);
  const [smax, setSmax] = useState(initial.smax);
  const [prec, setPrec] = useState(initial.prec);

  // ---- URL updater ----
  const syncUrl = useCallback(
    (s: number, ans: boolean, overrides?: Record<string, string>) => {
      const url = new URL(window.location.href);
      cleanParams(url);
      url.searchParams.set("q", seedToHex(s));
      if (ans) url.searchParams.set("answers", "1");
      if (overrides) {
        for (const [k, v] of Object.entries(overrides)) {
          url.searchParams.set(k, v);
        }
      }
      window.history.replaceState(null, "", url.toString());
    },
    [],
  );

  // Build operator-specific URL overrides
  const settingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    switch (op) {
      case "decomposition":
        if (target !== DECOMP_DEF.target) m.target = String(target);
        break;
      case "fill-blank":
        if (max !== FILL_DEF.max) m.max = String(max);
        if (mode !== FILL_DEF.mode) m.mode = mode;
        break;
      case "comparison":
        if (max !== COMP_DEF.max) m.max = String(max);
        break;
      case "sequence":
        if (step !== SEQ_DEF.step) m.step = String(step);
        if (smax !== SEQ_DEF.max) m.smax = String(smax);
        break;
      case "clock":
        if (prec !== CLOCK_DEF.prec) m.prec = prec;
        break;
    }
    return m;
  }, [op, target, max, mode, step, smax, prec]);

  // ---- initial URL sync ----
  useState(() => { syncUrl(seed, showAnswers, settingsParams()); });

  // ---- actions ----
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

  // ---- QR ----
  const qrUrl = useMemo(() => {
    const url = new URL(window.location.href);
    cleanParams(url);
    url.searchParams.set("q", seedToHex(seed));
    url.searchParams.set("answers", "1");
    const sp = settingsParams();
    for (const [k, v] of Object.entries(sp)) url.searchParams.set(k, v);
    return url.toString();
  }, [seed, settingsParams]);

  // ---- settings change handlers ----
  const onTargetChange = useCallback((v: number) => {
    setTarget(v);
    const p: Record<string, string> = {};
    if (v !== DECOMP_DEF.target) p.target = String(v);
    regen(p);
  }, [regen]);

  const onMaxChange = useCallback((v: number) => {
    setMax(v);
    const p: Record<string, string> = {};
    if (op === "fill-blank") {
      if (v !== FILL_DEF.max) p.max = String(v);
      if (mode !== FILL_DEF.mode) p.mode = mode;
    } else if (op === "comparison") {
      if (v !== COMP_DEF.max) p.max = String(v);
    }
    regen(p);
  }, [op, mode, regen]);

  const onModeChange = useCallback((v: "add" | "sub" | "mixed") => {
    setMode(v);
    const p: Record<string, string> = {};
    if (max !== FILL_DEF.max) p.max = String(max);
    if (v !== FILL_DEF.mode) p.mode = v;
    regen(p);
  }, [max, regen]);

  const onStepChange = useCallback((v: number) => {
    setStep(v);
    const p: Record<string, string> = {};
    if (v !== SEQ_DEF.step) p.step = String(v);
    if (smax !== SEQ_DEF.max) p.smax = String(smax);
    regen(p);
  }, [smax, regen]);

  const onSmaxChange = useCallback((v: number) => {
    setSmax(v);
    const p: Record<string, string> = {};
    if (step !== SEQ_DEF.step) p.step = String(step);
    if (v !== SEQ_DEF.max) p.smax = String(v);
    regen(p);
  }, [step, regen]);

  const onPrecChange = useCallback((v: "hour" | "half" | "5min" | "1min") => {
    setPrec(v);
    const p: Record<string, string> = {};
    if (v !== CLOCK_DEF.prec) p.prec = v;
    regen(p);
  }, [regen]);

  // ---- generate problems ----
  const decompProblems = useMemo(
    () => op === "decomposition" ? generateDecomposition(seed, target) : [],
    [op, seed, target],
  );
  const fillProblems = useMemo(
    () => op === "fill-blank" ? generateFillBlank(seed, max, mode) : [],
    [op, seed, max, mode],
  );
  const compProblems = useMemo(
    () => op === "comparison" ? generateComparison(seed, max) : [],
    [op, seed, max],
  );
  const seqProblems = useMemo(
    () => op === "sequence" ? generateSequence(seed, step, smax) : [],
    [op, seed, step, smax],
  );
  const clockProblems = useMemo(
    () => op === "clock" ? generateClock(seed, prec) : [],
    [op, seed, prec],
  );

  // ---- settings panel ----
  const renderSettings = () => {
    switch (op) {
      case "decomposition":
        return (
          <div className="no-print settings-panel">
            <label>
              いくつにする{" "}
              <select
                className="operator-select"
                value={target}
                onChange={(e) => onTargetChange(Number(e.target.value))}
              >
                {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(
                  (n) => <option key={n} value={n}>{n}</option>,
                )}
              </select>
            </label>
          </div>
        );
      case "fill-blank":
        return (
          <div className="no-print settings-panel">
            <label>
              最大の数{" "}
              <select
                className="operator-select"
                value={max}
                onChange={(e) => onMaxChange(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </label>
            <label>
              計算{" "}
              <select
                className="operator-select"
                value={mode}
                onChange={(e) => onModeChange(e.target.value as any)}
              >
                <option value="mixed">たし算・ひき算</option>
                <option value="add">たし算のみ</option>
                <option value="sub">ひき算のみ</option>
              </select>
            </label>
          </div>
        );
      case "comparison":
        return (
          <div className="no-print settings-panel">
            <label>
              最大の数{" "}
              <select
                className="operator-select"
                value={max}
                onChange={(e) => onMaxChange(Number(e.target.value))}
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
          </div>
        );
      case "sequence":
        return (
          <div className="no-print settings-panel">
            <label>
              いくつとび{" "}
              <select
                className="operator-select"
                value={step}
                onChange={(e) => onStepChange(Number(e.target.value))}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
            </label>
            <label>
              最大の数{" "}
              <select
                className="operator-select"
                value={smax}
                onChange={(e) => onSmaxChange(Number(e.target.value))}
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
          </div>
        );
      case "clock":
        return (
          <div className="no-print settings-panel">
            <label>
              むずかしさ{" "}
              <select
                className="operator-select"
                value={prec}
                onChange={(e) => onPrecChange(e.target.value as any)}
              >
                <option value="hour">ちょうど（○時）</option>
                <option value="half">30分（○時／○時半）</option>
                <option value="5min">5分きざみ</option>
                <option value="1min">1分きざみ</option>
              </select>
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  // ---- render problems ----
  const renderProblems = () => {
    switch (op) {
      case "decomposition":
        return (
          <div className="g1-page g1-cols-2">
            {decompProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  <span className="g1-val">{p.target}</span>
                  <span className="g1-op">=</span>
                  {p.position === "left" ? (
                    <>
                      <span className="g1-val">{p.given}</span>
                      <span className="g1-op">+</span>
                      <Box answer={p.answer} show={showAnswers} />
                    </>
                  ) : (
                    <>
                      <Box answer={p.answer} show={showAnswers} />
                      <span className="g1-op">+</span>
                      <span className="g1-val">{p.given}</span>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        );

      case "fill-blank":
        return (
          <div className="g1-page g1-cols-2">
            {fillProblems.map((p, i) => (
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
                  <span className="g1-val">{p.result}</span>
                </span>
              </div>
            ))}
          </div>
        );

      case "comparison":
        return (
          <div className="g1-page g1-cols-3">
            {compProblems.map((p, i) => (
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

      case "sequence":
        return (
          <div className="g1-seq-page">
            {seqProblems.map((p, i) => (
              <div key={i} className="g1-seq-row">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-seq-cells">
                  {p.cells.map((c, j) => {
                    // find the answer index for this blank
                    const blankIdx =
                      c === null
                        ? p.cells.slice(0, j).filter((x) => x === null).length
                        : -1;
                    return (
                      <span key={j} className="g1-seq-cell-wrap">
                        {j > 0 && <span className="g1-seq-arrow">→</span>}
                        {c !== null ? (
                          <span className="g1-seq-cell">{c}</span>
                        ) : (
                          <Box answer={p.answers[blankIdx]} show={showAnswers} />
                        )}
                      </span>
                    );
                  })}
                </span>
              </div>
            ))}
          </div>
        );

      case "clock":
        return (
          <div className="g1-clock-grid">
            {clockProblems.map((p, i) => (
              <div key={i} className="g1-clock-item">
                <span className="g1-num">({i + 1})</span>
                <ClockFace hour={p.hour} minute={p.minute} />
                <span className={`g1-clock-answer${showAnswers ? "" : " g1-hidden"}`}>
                  {p.minute === 0
                    ? `${p.hour}時`
                    : `${p.hour}時${p.minute}分`}
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
