import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { ProblemGroup } from "./types";
import { mulberry32, randomSeed, seedToHex, hexToSeed } from "./random";
import "../App.css";

type IntegerOperator = "multiples";

interface MultiplesProblem {
  kind: "multiples";
  number: number;
  count: number;
  answers: number[];
}

type IntegerProblem = MultiplesProblem;

const generateMultiplesProblems = (
  seed: number,
  nmin: number,
  nmax: number,
  count: number,
): MultiplesProblem[] => {
  const rng = mulberry32(seed);
  const problems: MultiplesProblem[] = [];
  for (let i = 0; i < 10; i++) {
    const n = nmin + Math.floor(rng() * (nmax - nmin + 1));
    const answers: number[] = [];
    for (let j = 1; j <= count; j++) answers.push(n * j);
    problems.push({ kind: "multiples", number: n, count, answers });
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
  return generateMultiplesProblems(seed, nmin, nmax, count);
};

const DEFAULTS: Record<IntegerOperator, { nmin: number; nmax: number; count: number }> = {
  multiples: { nmin: 2, nmax: 9, count: 5 },
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
        {problems.map((p, i) => (
          <div key={i} className="integer-problem">
            <div className="integer-question">
              <span className="integer-number">({i + 1})</span>
              {p.kind === "multiples" && (
                <span className="integer-text">
                  {p.number} の倍数を {p.count} つ書きなさい
                </span>
              )}
            </div>
            <div className={`integer-answer-text${showAnswers ? "" : " integer-hidden"}`}>
              {p.answers.join(", ")}
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

export const integer: ProblemGroup = {
  id: "integer",
  label: "整数",
  operators: [
    { operator: "multiples", label: "倍数" },
  ],
  Component: Integer,
};
