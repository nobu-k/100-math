import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { ProblemGroup } from "./types";
import { mulberry32, randomSeed, seedToHex, hexToSeed } from "./random";
import "../App.css";

type FractionOperator = "addition" | "reduction";

interface AdditionProblem {
  kind: "addition";
  numerators: [number, number];
  denominator: number;
  answerNumerator: number;
  answerDenominator: number;
}

interface ReductionProblem {
  kind: "reduction";
  numerator: number;
  denominator: number;
  answerNumerator: number;
  answerDenominator: number;
}

type FractionProblem = AdditionProblem | ReductionProblem;

const gcd = (a: number, b: number): number => {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
};

const generateAdditionProblems = (
  seed: number,
  minDenom: number,
  maxDenom: number,
): AdditionProblem[] => {
  const rng = mulberry32(seed);
  const problems: AdditionProblem[] = [];
  for (let i = 0; i < 10; i++) {
    const d = minDenom + Math.floor(rng() * (maxDenom - minDenom + 1));
    const a = 1 + Math.floor(rng() * (d - 1));
    const b = 1 + Math.floor(rng() * (d - 1));
    problems.push({
      kind: "addition",
      numerators: [a, b],
      denominator: d,
      answerNumerator: a + b,
      answerDenominator: d,
    });
  }
  return problems;
};

const generateReductionProblems = (
  seed: number,
  minDenom: number,
  maxDenom: number,
): ReductionProblem[] => {
  const rng = mulberry32(seed);
  const problems: ReductionProblem[] = [];
  // Collect all reducible fractions n/D where D in [minDenom, maxDenom]
  const candidates: { n: number; D: number; rn: number; rd: number }[] = [];
  for (let D = Math.max(minDenom, 4); D <= maxDenom; D++) {
    for (let n = 1; n < D; n++) {
      const g = gcd(n, D);
      if (g > 1) {
        candidates.push({ n, D, rn: n / g, rd: D / g });
      }
    }
  }
  // Fallback: if no candidates (shouldn't happen for dmin>=4), use trivial
  if (candidates.length === 0) {
    for (let i = 0; i < 10; i++) {
      problems.push({
        kind: "reduction",
        numerator: 2,
        denominator: 4,
        answerNumerator: 1,
        answerDenominator: 2,
      });
    }
    return problems;
  }
  for (let i = 0; i < 10; i++) {
    const idx = Math.floor(rng() * candidates.length);
    const c = candidates[idx];
    problems.push({
      kind: "reduction",
      numerator: c.n,
      denominator: c.D,
      answerNumerator: c.rn,
      answerDenominator: c.rd,
    });
  }
  return problems;
};

const generateProblems = (
  op: FractionOperator,
  seed: number,
  minDenom: number,
  maxDenom: number,
): FractionProblem[] => {
  if (op === "reduction") return generateReductionProblems(seed, minDenom, maxDenom);
  return generateAdditionProblems(seed, minDenom, maxDenom);
};

const DEFAULTS: Record<FractionOperator, { dmin: number; dmax: number }> = {
  addition: { dmin: 2, dmax: 10 },
  reduction: { dmin: 4, dmax: 20 },
};

const PARAM_KEYS = ["q", "answers", "dmin", "dmax"];

const updateUrl = (
  seed: number,
  showAnswers: boolean,
  minDenom: number,
  maxDenom: number,
  defaults: { dmin: number; dmax: number },
) => {
  const url = new URL(window.location.href);
  for (const key of PARAM_KEYS) {
    url.searchParams.delete(key);
  }
  url.searchParams.set("q", seedToHex(seed));
  if (showAnswers) url.searchParams.set("answers", "1");
  if (minDenom !== defaults.dmin) url.searchParams.set("dmin", String(minDenom));
  if (maxDenom !== defaults.dmax) url.searchParams.set("dmax", String(maxDenom));
  window.history.replaceState(null, "", url.toString());
};

function Fraction({ operator }: { operator: string }) {
  const op: FractionOperator = operator === "reduction" ? "reduction" : "addition";
  const defaults = DEFAULTS[op];

  const getInitialState = () => {
    const params = new URLSearchParams(window.location.search);
    const minFloor = op === "reduction" ? 4 : 2;
    const maxCeil = op === "reduction" ? 99 : 20;
    const dmin = Math.max(minFloor, Math.min(maxCeil, parseInt(params.get("dmin") ?? String(defaults.dmin), 10) || defaults.dmin));
    const dmax = Math.max(dmin, Math.min(maxCeil, parseInt(params.get("dmax") ?? String(defaults.dmax), 10) || defaults.dmax));
    const q = params.get("q");
    const parsedSeed = q ? hexToSeed(q) : null;
    const seed = parsedSeed ?? randomSeed();
    const showAnswers = params.get("answers") === "1";
    if (parsedSeed === null) updateUrl(seed, showAnswers, dmin, dmax, defaults);
    return { seed, showAnswers, minDenom: dmin, maxDenom: dmax };
  };

  const [initial] = useState(getInitialState);
  const [seed, setSeed] = useState(initial.seed);
  const [showAnswers, setShowAnswers] = useState(initial.showAnswers);
  const [minDenom, setMinDenom] = useState(initial.minDenom);
  const [maxDenom, setMaxDenom] = useState(initial.maxDenom);
  const [showSettings, setShowSettings] = useState(false);
  const [editMin, setEditMin] = useState<string | null>(null);
  const [editMax, setEditMax] = useState<string | null>(null);

  const problems = useMemo(
    () => generateProblems(op, seed, minDenom, maxDenom),
    [op, seed, minDenom, maxDenom],
  );

  const handleNewProblems = useCallback(() => {
    const newSeed = randomSeed();
    updateUrl(newSeed, false, minDenom, maxDenom, defaults);
    setSeed(newSeed);
    setShowAnswers(false);
  }, [minDenom, maxDenom, defaults]);

  const handleToggleAnswers = useCallback(() => {
    setShowAnswers((prev) => {
      updateUrl(seed, !prev, minDenom, maxDenom, defaults);
      return !prev;
    });
  }, [seed, minDenom, maxDenom, defaults]);

  const minFloor = op === "reduction" ? 4 : 2;
  const maxCeil = op === "reduction" ? 99 : 20;

  const commitMin = useCallback(
    (raw: string) => {
      setEditMin(null);
      const parsed = parseInt(raw, 10);
      if (isNaN(parsed)) return;
      const v = Math.max(minFloor, Math.min(maxCeil, parsed));
      setMinDenom(v);
      setMaxDenom((prev) => {
        const next = Math.max(prev, v);
        const newSeed = randomSeed();
        setSeed(newSeed);
        setShowAnswers(false);
        updateUrl(newSeed, false, v, next, defaults);
        return next;
      });
    },
    [minFloor, maxCeil, defaults],
  );

  const commitMax = useCallback(
    (raw: string) => {
      setEditMax(null);
      const parsed = parseInt(raw, 10);
      if (isNaN(parsed)) return;
      const v = Math.max(minFloor, Math.min(maxCeil, parsed));
      setMaxDenom(v);
      setMinDenom((prev) => {
        const next = Math.min(prev, v);
        const newSeed = randomSeed();
        setSeed(newSeed);
        setShowAnswers(false);
        updateUrl(newSeed, false, next, v, defaults);
        return next;
      });
    },
    [minFloor, maxCeil, defaults],
  );

  const qrUrl = useMemo(() => {
    const url = new URL(window.location.href);
    for (const key of PARAM_KEYS) {
      url.searchParams.delete(key);
    }
    url.searchParams.set("q", seedToHex(seed));
    url.searchParams.set("answers", "1");
    if (minDenom !== defaults.dmin) url.searchParams.set("dmin", String(minDenom));
    if (maxDenom !== defaults.dmax) url.searchParams.set("dmax", String(maxDenom));
    return url.toString();
  }, [seed, minDenom, maxDenom, defaults]);

  return (
    <>
      <div className="no-print controls">
        <button onClick={handleNewProblems}>新しい問題</button>
        <button onClick={handleToggleAnswers}>
          {showAnswers ? "答えを隠す" : "答え"}
        </button>
        <button onClick={() => setShowSettings((prev) => !prev)}>設定</button>
      </div>
      {showSettings && (
        <div className="no-print settings-panel">
          <label>
            分母 最小{" "}
            <input
              type="number"
              className="operator-select"
              value={editMin ?? minDenom}
              min={minFloor}
              max={maxCeil}
              onFocus={(e) => { setEditMin(String(minDenom)); e.target.select(); }}
              onChange={(e) => setEditMin(e.target.value)}
              onBlur={(e) => commitMin(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
            />
          </label>
          <label>
            最大{" "}
            <input
              type="number"
              className="operator-select"
              value={editMax ?? maxDenom}
              min={minFloor}
              max={maxCeil}
              onFocus={(e) => { setEditMax(String(maxDenom)); e.target.select(); }}
              onChange={(e) => setEditMax(e.target.value)}
              onBlur={(e) => commitMax(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
            />
          </label>
        </div>
      )}
      <div className="fraction-page">
        {problems.map((p, i) => (
          <div key={i} className="fraction-problem">
            <span className="fraction-number">({i + 1})</span>
            {p.kind === "addition" ? (
              <>
                <div className="fraction-frac">
                  <span className="fraction-numerator">{p.numerators[0]}</span>
                  <span className="fraction-denominator">{p.denominator}</span>
                </div>
                <span className="fraction-operator">+</span>
                <div className="fraction-frac">
                  <span className="fraction-numerator">{p.numerators[1]}</span>
                  <span className="fraction-denominator">{p.denominator}</span>
                </div>
              </>
            ) : (
              <div className="fraction-frac">
                <span className="fraction-numerator">{p.numerator}</span>
                <span className="fraction-denominator">{p.denominator}</span>
              </div>
            )}
            <span className="fraction-equals">=</span>
            <div className={`fraction-frac fraction-answer${showAnswers ? "" : " fraction-hidden"}`}>
              <span className="fraction-numerator">{p.answerNumerator}</span>
              <span className="fraction-denominator">{p.answerDenominator}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="qr-section">
        <QRCodeSVG value={qrUrl} size={80} />
        <span className="qr-label">答え</span>
      </div>
    </>
  );
}

export const fraction: ProblemGroup = {
  id: "fraction",
  label: "分数",
  operators: [
    { operator: "addition", label: "たし算" },
    { operator: "reduction", label: "約分" },
  ],
  Component: Fraction,
};
