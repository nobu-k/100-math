import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { ProblemGroup } from "./types";
import { mulberry32, randomSeed, seedToHex, hexToSeed } from "./random";
import "../App.css";

type FractionOperator = "addition" | "reduction" | "commonDenom";

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

interface CommonDenomProblem {
  kind: "commonDenom";
  fractions: [{ n: number; d: number }, { n: number; d: number }];
  commonDenom: number;
  answerNumerators: [number, number];
  multipliers: [number, number];
}

type FractionProblem = AdditionProblem | ReductionProblem | CommonDenomProblem;

const gcd = (a: number, b: number): number => {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
};

const lcm = (a: number, b: number): number => (a / gcd(a, b)) * b;

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

const generateCommonDenomProblems = (
  seed: number,
  minDenom: number,
  maxDenom: number,
): CommonDenomProblem[] => {
  const rng = mulberry32(seed);
  const problems: CommonDenomProblem[] = [];
  for (let i = 0; i < 10; i++) {
    let found = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      const useInteger = rng() < 0.1;
      let d1: number, d2: number;
      if (useInteger) {
        // One fraction is an integer (d=1), the other is a proper fraction
        const fracDenom = Math.max(minDenom, 2) + Math.floor(rng() * (maxDenom - Math.max(minDenom, 2) + 1));
        if (rng() < 0.5) { d1 = 1; d2 = fracDenom; } else { d1 = fracDenom; d2 = 1; }
      } else {
        d1 = Math.max(minDenom, 2) + Math.floor(rng() * (maxDenom - Math.max(minDenom, 2) + 1));
        d2 = Math.max(minDenom, 2) + Math.floor(rng() * (maxDenom - Math.max(minDenom, 2) + 1));
      }
      if (d1 === d2) continue;
      const lcd = lcm(d1, d2);
      if (lcd > 99) continue;
      const n1 = d1 === 1 ? 1 + Math.floor(rng() * 9) : 1 + Math.floor(rng() * (d1 - 1));
      const n2 = d2 === 1 ? 1 + Math.floor(rng() * 9) : 1 + Math.floor(rng() * (d2 - 1));
      const m1 = lcd / d1;
      const m2 = lcd / d2;
      problems.push({
        kind: "commonDenom",
        fractions: [{ n: n1, d: d1 }, { n: n2, d: d2 }],
        commonDenom: lcd,
        answerNumerators: [n1 * m1, n2 * m2],
        multipliers: [m1, m2],
      });
      found = true;
      break;
    }
    if (!found) {
      problems.push({
        kind: "commonDenom",
        fractions: [{ n: 1, d: 2 }, { n: 1, d: 3 }],
        commonDenom: 6,
        answerNumerators: [3, 2],
        multipliers: [3, 2],
      });
    }
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
  if (op === "commonDenom") return generateCommonDenomProblems(seed, minDenom, maxDenom);
  return generateAdditionProblems(seed, minDenom, maxDenom);
};

const DEFAULTS: Record<FractionOperator, { dmin: number; dmax: number }> = {
  addition: { dmin: 2, dmax: 10 },
  reduction: { dmin: 4, dmax: 20 },
  commonDenom: { dmin: 2, dmax: 12 },
};

const Frac = ({ n, d, className }: { n: number; d: number; className?: string }) => (
  <div className={`fraction-frac${className ? ` ${className}` : ""}`}>
    <span className="fraction-numerator">{n}</span>
    <span className="fraction-denominator">{d}</span>
  </div>
);

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

const Fraction = ({ operator }: { operator: string }) => {
  const op: FractionOperator = operator === "reduction" ? "reduction" : operator === "common-denominator" ? "commonDenom" : "addition";
  const defaults = DEFAULTS[op];

  const getInitialState = () => {
    const params = new URLSearchParams(window.location.search);
    const minFloor = op === "reduction" ? 4 : op === "commonDenom" ? 1 : 2;
    const maxCeil = op === "addition" ? 20 : 99;
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

  const minFloor = op === "reduction" ? 4 : op === "commonDenom" ? 1 : 2;
  const maxCeil = op === "addition" ? 20 : 99;

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
        {problems.map((p, i) =>
          p.kind === "commonDenom" ? (
            <div key={i} className="fraction-cd-item">
              <div className="fraction-problem">
                <span className="fraction-number">({i + 1})</span>
                <span className="fraction-symbol">(</span>
                {p.fractions[0].d === 1
                  ? <span className="fraction-int">{p.fractions[0].n}</span>
                  : <Frac n={p.fractions[0].n} d={p.fractions[0].d} />}
                <span className="fraction-symbol">,</span>
                {p.fractions[1].d === 1
                  ? <span className="fraction-int">{p.fractions[1].n}</span>
                  : <Frac n={p.fractions[1].n} d={p.fractions[1].d} />}
                <span className="fraction-symbol">)</span>
                <span className="fraction-equals">=</span>
                <div className={`fraction-cd-answers fraction-answer${showAnswers ? "" : " fraction-hidden"}`}>
                  <span>(</span>
                  <Frac n={p.answerNumerators[0]} d={p.commonDenom} />
                  <span>,</span>
                  <Frac n={p.answerNumerators[1]} d={p.commonDenom} />
                  <span>)</span>
                </div>
              </div>
              <div className={`fraction-guide fraction-answer${showAnswers ? "" : " fraction-hidden"}`}>
                {[0, 1].map((j) => {
                  const f = p.fractions[j];
                  return (
                    <div key={j} className="fraction-guide-row">
                      {f.d === 1 ? (
                        <>
                          <span className="fraction-int">{f.n}</span>
                          <span className="fraction-guide-sym">=</span>
                          <Frac n={f.n} d={1} />
                        </>
                      ) : (
                        <Frac n={f.n} d={f.d} />
                      )}
                      <span className="fraction-guide-sym">&times;</span>
                      <Frac n={p.multipliers[j]} d={p.multipliers[j]} />
                      <span className="fraction-guide-sym">=</span>
                      <Frac n={p.answerNumerators[j]} d={p.commonDenom} />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div key={i} className="fraction-problem">
              <span className="fraction-number">({i + 1})</span>
              {p.kind === "addition" ? (
                <>
                  <Frac n={p.numerators[0]} d={p.denominator} />
                  <span className="fraction-operator">+</span>
                  <Frac n={p.numerators[1]} d={p.denominator} />
                </>
              ) : (
                <Frac n={p.numerator} d={p.denominator} />
              )}
              <span className="fraction-equals">=</span>
              <Frac n={p.answerNumerator} d={p.answerDenominator}
                className={`fraction-answer${showAnswers ? "" : " fraction-hidden"}`} />
            </div>
          ),
        )}
      </div>
      <div className="qr-section">
        <QRCodeSVG value={qrUrl} size={80} />
        <span className="qr-label">答え</span>
      </div>
    </>
  );
};

export const fraction: ProblemGroup = {
  id: "fraction",
  label: "分数",
  operators: [
    { operator: "addition", label: "たし算", grades: [4, 5, 6] },
    { operator: "reduction", label: "約分", grades: [5, 6] },
    { operator: "common-denominator", label: "通分", grades: [5, 6] },
  ],
  Component: Fraction,
};
