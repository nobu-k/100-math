import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { ProblemGroup } from "./types";
import { mulberry32, randomSeed, seedToHex, hexToSeed } from "./random";
import "../App.css";

type IntegerOperator = "multiples" | "factors" | "lcm" | "gcd";

interface MultiplesProblem {
  kind: "multiples";
  number: number;
  count: number;
  answers: number[];
}

interface FactorsProblem {
  kind: "factors";
  number: number;
  answers: number[];
}

interface LcmProblem {
  kind: "lcm";
  a: number;
  b: number;
  answer: number;
  // Ladder division steps: each row is [divisor, ...remainders]
  ladder: { divisor: number; values: [number, number] }[];
  ladderBottom: [number, number];
}

interface GcdProblem {
  kind: "gcd";
  a: number;
  b: number;
  answer: number;
  ladder: { divisor: number; values: [number, number] }[];
  ladderBottom: [number, number];
}

type IntegerProblem = MultiplesProblem | FactorsProblem | LcmProblem | GcdProblem;

const pickUnique = (rng: () => number, min: number, max: number, n: number): number[] => {
  const range = max - min + 1;
  const pool = Array.from({ length: range }, (_, i) => i + min);
  const limit = Math.min(n, range);
  for (let i = 0; i < limit; i++) {
    const j = i + Math.floor(rng() * (range - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const result: number[] = [];
  for (let i = 0; i < n; i++) result.push(pool[i % limit]);
  return result;
};

const generateMultiplesProblems = (
  seed: number,
  nmin: number,
  nmax: number,
  count: number,
): MultiplesProblem[] => {
  const rng = mulberry32(seed);
  const nums = pickUnique(rng, nmin, nmax, 10);
  return nums.map((n) => {
    const answers: number[] = [];
    for (let j = 1; j <= count; j++) answers.push(n * j);
    return { kind: "multiples" as const, number: n, count, answers };
  });
};

const getFactors = (n: number): number[] => {
  const factors: number[] = [];
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      factors.push(i);
      if (i !== n / i) factors.push(n / i);
    }
  }
  return factors.sort((a, b) => a - b);
};

const generateFactorsProblems = (
  seed: number,
  nmin: number,
  nmax: number,
): FactorsProblem[] => {
  const rng = mulberry32(seed);
  const nums = pickUnique(rng, nmin, nmax, 10);
  return nums.map((n) => ({
    kind: "factors" as const,
    number: n,
    answers: getFactors(n),
  }));
};

const computeLadder = (a: number, b: number): { ladder: { divisor: number; values: [number, number] }[]; bottom: [number, number] } => {
  const ladder: { divisor: number; values: [number, number] }[] = [];
  let x = a, y = b;
  for (let d = 2; d <= Math.min(x, y); ) {
    if (x % d === 0 && y % d === 0) {
      ladder.push({ divisor: d, values: [x, y] });
      x /= d;
      y /= d;
    } else {
      d++;
    }
  }
  return { ladder, bottom: [x, y] };
};

const gcd = (a: number, b: number): number => {
  while (b) { [a, b] = [b, a % b]; }
  return a;
};

const lcmOf = (a: number, b: number): number => (a / gcd(a, b)) * b;

const generateLcmProblems = (
  seed: number,
  nmin: number,
  nmax: number,
): LcmProblem[] => {
  const rng = mulberry32(seed);
  const problems: LcmProblem[] = [];
  for (let i = 0; i < 10; i++) {
    let a: number, b: number;
    // Pick a shared factor g >= 2, then two coprime multipliers
    let found = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      const maxG = Math.floor(nmax / 2);
      if (maxG < 2) break;
      const g = 2 + Math.floor(rng() * (maxG - 1));
      const lo = Math.max(1, Math.ceil(nmin / g));
      const hi = Math.floor(nmax / g);
      if (hi - lo < 1) continue;
      const ma = lo + Math.floor(rng() * (hi - lo + 1));
      const mb = lo + Math.floor(rng() * (hi - lo + 1));
      if (ma === mb || gcd(ma, mb) !== 1) continue;
      a = g * ma;
      b = g * mb;
      const answer = lcmOf(a, b);
      const { ladder, bottom } = computeLadder(a, b);
      problems.push({ kind: "lcm", a, b, answer, ladder, ladderBottom: bottom });
      found = true;
      break;
    }
    if (!found) {
      a = nmin + Math.floor(rng() * (nmax - nmin + 1));
      do {
        b = nmin + Math.floor(rng() * (nmax - nmin + 1));
      } while (b === a);
      const answer = lcmOf(a, b);
      const { ladder, bottom } = computeLadder(a, b);
      problems.push({ kind: "lcm", a, b, answer, ladder, ladderBottom: bottom });
    }
  }
  return problems;
};

const generateGcdProblems = (
  seed: number,
  nmin: number,
  nmax: number,
): GcdProblem[] => {
  const rng = mulberry32(seed);
  const problems: GcdProblem[] = [];
  for (let i = 0; i < 10; i++) {
    let a: number, b: number;
    // Pick a non-trivial GCD g, then two coprime multipliers
    let found = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      const maxG = Math.floor(nmax / 2);
      if (maxG < 2) break;
      const g = 2 + Math.floor(rng() * (maxG - 1));
      const lo = Math.max(1, Math.ceil(nmin / g));
      const hi = Math.floor(nmax / g);
      if (hi - lo < 1) continue;
      const ma = lo + Math.floor(rng() * (hi - lo + 1));
      const mb = lo + Math.floor(rng() * (hi - lo + 1));
      if (ma === mb || gcd(ma, mb) !== 1) continue;
      a = g * ma;
      b = g * mb;
      const answer = g;
      const { ladder, bottom } = computeLadder(a, b);
      problems.push({ kind: "gcd", a, b, answer, ladder, ladderBottom: bottom });
      found = true;
      break;
    }
    if (!found) {
      // Fallback: random pair
      a = nmin + Math.floor(rng() * (nmax - nmin + 1));
      do {
        b = nmin + Math.floor(rng() * (nmax - nmin + 1));
      } while (b === a);
      const answer = gcd(a, b);
      const { ladder, bottom } = computeLadder(a, b);
      problems.push({ kind: "gcd", a, b, answer, ladder, ladderBottom: bottom });
    }
  }
  return problems;
};

const generateProblems = (
  op: IntegerOperator,
  seed: number,
  nmin: number,
  nmax: number,
  count: number,
): IntegerProblem[] => {
  if (op === "multiples") return generateMultiplesProblems(seed, nmin, nmax, count);
  if (op === "factors") return generateFactorsProblems(seed, nmin, nmax);
  if (op === "lcm") return generateLcmProblems(seed, nmin, nmax);
  if (op === "gcd") return generateGcdProblems(seed, nmin, nmax);
  return generateMultiplesProblems(seed, nmin, nmax, count);
};

const DEFAULTS: Record<IntegerOperator, { nmin: number; nmax: number; count: number }> = {
  multiples: { nmin: 2, nmax: 9, count: 5 },
  factors: { nmin: 2, nmax: 36, count: 5 },
  lcm: { nmin: 2, nmax: 20, count: 5 },
  gcd: { nmin: 2, nmax: 36, count: 5 },
};

const PARAM_KEYS = ["q", "answers", "nmin", "nmax", "count"];

const updateUrl = (
  seed: number,
  showAnswers: boolean,
  nmin: number,
  nmax: number,
  count: number,
  defaults: { nmin: number; nmax: number; count: number },
) => {
  const url = new URL(window.location.href);
  for (const key of PARAM_KEYS) {
    url.searchParams.delete(key);
  }
  url.searchParams.set("q", seedToHex(seed));
  if (showAnswers) url.searchParams.set("answers", "1");
  if (nmin !== defaults.nmin) url.searchParams.set("nmin", String(nmin));
  if (nmax !== defaults.nmax) url.searchParams.set("nmax", String(nmax));
  if (count !== defaults.count) url.searchParams.set("count", String(count));
  window.history.replaceState(null, "", url.toString());
};

function Integer({ operator }: { operator: string }) {
  const op: IntegerOperator = operator as IntegerOperator;
  const defaults = DEFAULTS[op] ?? DEFAULTS.multiples;

  const getInitialState = () => {
    const params = new URLSearchParams(window.location.search);
    const nmin = Math.max(2, Math.min(99, parseInt(params.get("nmin") ?? String(defaults.nmin), 10) || defaults.nmin));
    const nmax = Math.max(nmin, Math.min(99, parseInt(params.get("nmax") ?? String(defaults.nmax), 10) || defaults.nmax));
    const count = Math.max(1, Math.min(10, parseInt(params.get("count") ?? String(defaults.count), 10) || defaults.count));
    const q = params.get("q");
    const parsedSeed = q ? hexToSeed(q) : null;
    const seed = parsedSeed ?? randomSeed();
    const showAnswers = params.get("answers") === "1";
    if (parsedSeed === null) updateUrl(seed, showAnswers, nmin, nmax, count, defaults);
    return { seed, showAnswers, nmin, nmax, count };
  };

  const [initial] = useState(getInitialState);
  const [seed, setSeed] = useState(initial.seed);
  const [showAnswers, setShowAnswers] = useState(initial.showAnswers);
  const [nmin, setNmin] = useState(initial.nmin);
  const [nmax, setNmax] = useState(initial.nmax);
  const [count, setCount] = useState(initial.count);
  const [showSettings, setShowSettings] = useState(false);
  const [editMin, setEditMin] = useState<string | null>(null);
  const [editMax, setEditMax] = useState<string | null>(null);
  const [editCount, setEditCount] = useState<string | null>(null);

  const problems = useMemo(
    () => generateProblems(op, seed, nmin, nmax, count),
    [op, seed, nmin, nmax, count],
  );

  const handleNewProblems = useCallback(() => {
    const newSeed = randomSeed();
    updateUrl(newSeed, false, nmin, nmax, count, defaults);
    setSeed(newSeed);
    setShowAnswers(false);
  }, [nmin, nmax, count, defaults]);

  const handleToggleAnswers = useCallback(() => {
    setShowAnswers((prev) => {
      updateUrl(seed, !prev, nmin, nmax, count, defaults);
      return !prev;
    });
  }, [seed, nmin, nmax, count, defaults]);

  const regenerate = useCallback(
    (nextMin: number, nextMax: number, nextCount: number) => {
      const newSeed = randomSeed();
      setSeed(newSeed);
      setShowAnswers(false);
      updateUrl(newSeed, false, nextMin, nextMax, nextCount, defaults);
    },
    [defaults],
  );

  const commitMin = useCallback(
    (raw: string) => {
      setEditMin(null);
      const parsed = parseInt(raw, 10);
      if (isNaN(parsed)) return;
      const v = Math.max(2, Math.min(99, parsed));
      setNmin(v);
      setNmax((prev) => {
        const next = Math.max(prev, v);
        regenerate(v, next, count);
        return next;
      });
    },
    [count, regenerate],
  );

  const commitMax = useCallback(
    (raw: string) => {
      setEditMax(null);
      const parsed = parseInt(raw, 10);
      if (isNaN(parsed)) return;
      const v = Math.max(2, Math.min(99, parsed));
      setNmax(v);
      setNmin((prev) => {
        const next = Math.min(prev, v);
        regenerate(next, v, count);
        return next;
      });
    },
    [count, regenerate],
  );

  const commitCount = useCallback(
    (raw: string) => {
      setEditCount(null);
      const parsed = parseInt(raw, 10);
      if (isNaN(parsed)) return;
      const v = Math.max(1, Math.min(10, parsed));
      setCount(v);
      regenerate(nmin, nmax, v);
    },
    [nmin, nmax, regenerate],
  );

  const qrUrl = useMemo(() => {
    const url = new URL(window.location.href);
    for (const key of PARAM_KEYS) {
      url.searchParams.delete(key);
    }
    url.searchParams.set("q", seedToHex(seed));
    url.searchParams.set("answers", "1");
    if (nmin !== defaults.nmin) url.searchParams.set("nmin", String(nmin));
    if (nmax !== defaults.nmax) url.searchParams.set("nmax", String(nmax));
    if (count !== defaults.count) url.searchParams.set("count", String(count));
    return url.toString();
  }, [seed, nmin, nmax, count, defaults]);

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
            最小{" "}
            <input
              type="number"
              className="operator-select"
              value={editMin ?? nmin}
              min={2}
              max={99}
              onFocus={(e) => { setEditMin(String(nmin)); e.target.select(); }}
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
              value={editMax ?? nmax}
              min={2}
              max={99}
              onFocus={(e) => { setEditMax(String(nmax)); e.target.select(); }}
              onChange={(e) => setEditMax(e.target.value)}
              onBlur={(e) => commitMax(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
            />
          </label>
          {op === "multiples" && (
            <label>
              個数{" "}
              <input
                type="number"
                className="operator-select"
                value={editCount ?? count}
                min={1}
                max={10}
                onFocus={(e) => { setEditCount(String(count)); e.target.select(); }}
                onChange={(e) => setEditCount(e.target.value)}
                onBlur={(e) => commitCount(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
              />
            </label>
          )}
        </div>
      )}
      <div className="integer-page">
        {problems.map((p, i) =>
          p.kind === "lcm" || p.kind === "gcd" ? (
            <div key={i} className="integer-problem integer-lcm-problem">
              <div className="integer-question">
                <span className="integer-number">({i + 1})</span>
                <span className="integer-text">
                  {p.a} と {p.b} の{p.kind === "lcm" ? "最小公倍数" : "最大公約数"}
                </span>
              </div>
              <div className="integer-ladder-area">
                <table className={`integer-ladder${showAnswers ? "" : " integer-hidden"}`}>
                  <tbody>
                    {p.ladder.map((row, ri) => (
                      <tr key={ri}>
                        <td className="integer-ladder-div integer-ladder-hl">{row.divisor}</td>
                        <td className="integer-ladder-val">{row.values[0]}</td>
                        <td className="integer-ladder-val">{row.values[1]}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="integer-ladder-div"></td>
                      <td className={`integer-ladder-bottom${p.kind === "lcm" ? " integer-ladder-hl" : ""}`}>{p.ladderBottom[0]}</td>
                      <td className={`integer-ladder-bottom${p.kind === "lcm" ? " integer-ladder-hl" : ""}`}>{p.ladderBottom[1]}</td>
                    </tr>
                  </tbody>
                </table>
                <div className={`integer-answer-text${showAnswers ? "" : " integer-hidden"}`}>
                  {(() => {
                    const parts = p.ladder.map((r) => r.divisor);
                    if (p.kind === "lcm") parts.push(p.ladderBottom[0], p.ladderBottom[1]);
                    return parts.join(" × ") + " = " + p.answer;
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div key={i} className="integer-problem">
              <div className="integer-question">
                <span className="integer-number">({i + 1})</span>
                {p.kind === "multiples" ? (
                  <span className="integer-text">
                    {p.number} の倍数を小さい方から {p.count} つ書きなさい
                  </span>
                ) : p.kind === "factors" ? (
                  <span className="integer-text">
                    {p.number} の約数をすべて書きなさい
                  </span>
                ) : null}
              </div>
              <div className={`integer-answer-text${showAnswers ? "" : " integer-hidden"}`}>
                {p.answers.join(", ")}
              </div>
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
}

export const integer: ProblemGroup = {
  id: "integer",
  label: "整数",
  operators: [
    { operator: "multiples", label: "倍数" },
    { operator: "factors", label: "約数" },
    { operator: "lcm", label: "最小公倍数" },
    { operator: "gcd", label: "最大公約数" },
  ],
  Component: Integer,
};
