import React, { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { ProblemGroup } from "./types";
import { mulberry32, randomSeed, seedToHex, hexToSeed } from "./random";
import "../App.css";

interface FractionProblem {
  numerators: [number, number];
  denominator: number;
}

const generateProblems = (
  seed: number,
  minDenom: number,
  maxDenom: number,
): FractionProblem[] => {
  const rng = mulberry32(seed);
  const problems: FractionProblem[] = [];
  for (let i = 0; i < 10; i++) {
    const d = minDenom + Math.floor(rng() * (maxDenom - minDenom + 1));
    const a = 1 + Math.floor(rng() * (d - 1));
    const b = 1 + Math.floor(rng() * (d - 1));
    problems.push({ numerators: [a, b], denominator: d });
  }
  return problems;
};

const PARAM_KEYS = ["q", "answers", "dmin", "dmax"];

const updateUrl = (
  seed: number,
  showAnswers: boolean,
  minDenom: number,
  maxDenom: number,
) => {
  const url = new URL(window.location.href);
  for (const key of PARAM_KEYS) {
    url.searchParams.delete(key);
  }
  url.searchParams.set("q", seedToHex(seed));
  if (showAnswers) url.searchParams.set("answers", "1");
  if (minDenom !== 2) url.searchParams.set("dmin", String(minDenom));
  if (maxDenom !== 10) url.searchParams.set("dmax", String(maxDenom));
  window.history.replaceState(null, "", url.toString());
};

function Fraction({ operator: _operator }: { operator: string }) {
  const getInitialState = () => {
    const params = new URLSearchParams(window.location.search);
    const dmin = Math.max(2, Math.min(20, parseInt(params.get("dmin") ?? "2", 10) || 2));
    const dmax = Math.max(dmin, Math.min(20, parseInt(params.get("dmax") ?? "10", 10) || 10));
    const q = params.get("q");
    const parsedSeed = q ? hexToSeed(q) : null;
    const seed = parsedSeed ?? randomSeed();
    const showAnswers = params.get("answers") === "1";
    if (parsedSeed === null) updateUrl(seed, showAnswers, dmin, dmax);
    return { seed, showAnswers, minDenom: dmin, maxDenom: dmax };
  };

  const [initial] = useState(getInitialState);
  const [seed, setSeed] = useState(initial.seed);
  const [showAnswers, setShowAnswers] = useState(initial.showAnswers);
  const [minDenom, setMinDenom] = useState(initial.minDenom);
  const [maxDenom, setMaxDenom] = useState(initial.maxDenom);
  const [showSettings, setShowSettings] = useState(false);

  const problems = useMemo(
    () => generateProblems(seed, minDenom, maxDenom),
    [seed, minDenom, maxDenom],
  );

  const handleNewProblems = useCallback(() => {
    const newSeed = randomSeed();
    updateUrl(newSeed, false, minDenom, maxDenom);
    setSeed(newSeed);
    setShowAnswers(false);
  }, [minDenom, maxDenom]);

  const handleToggleAnswers = useCallback(() => {
    setShowAnswers((prev) => {
      updateUrl(seed, !prev, minDenom, maxDenom);
      return !prev;
    });
  }, [seed, minDenom, maxDenom]);

  const handleMinDenom = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = parseInt(e.target.value, 10);
      setMinDenom(v);
      setMaxDenom((prev) => {
        const next = Math.max(prev, v);
        const newSeed = randomSeed();
        setSeed(newSeed);
        setShowAnswers(false);
        updateUrl(newSeed, false, v, next);
        return next;
      });
    },
    [],
  );

  const handleMaxDenom = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = parseInt(e.target.value, 10);
      setMaxDenom(v);
      setMinDenom((prev) => {
        const next = Math.min(prev, v);
        const newSeed = randomSeed();
        setSeed(newSeed);
        setShowAnswers(false);
        updateUrl(newSeed, false, next, v);
        return next;
      });
    },
    [],
  );

  const qrUrl = useMemo(() => {
    const url = new URL(window.location.href);
    for (const key of PARAM_KEYS) {
      url.searchParams.delete(key);
    }
    url.searchParams.set("q", seedToHex(seed));
    url.searchParams.set("answers", "1");
    if (minDenom !== 2) url.searchParams.set("dmin", String(minDenom));
    if (maxDenom !== 10) url.searchParams.set("dmax", String(maxDenom));
    return url.toString();
  }, [seed, minDenom, maxDenom]);

  const denomOptions = Array.from({ length: 19 }, (_, i) => i + 2);

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
            <select
              className="operator-select"
              value={minDenom}
              onChange={handleMinDenom}
            >
              {denomOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label>
            最大{" "}
            <select
              className="operator-select"
              value={maxDenom}
              onChange={handleMaxDenom}
            >
              {denomOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      <div className="fraction-page">
        {problems.map((p, i) => {
          const sum = p.numerators[0] + p.numerators[1];
          return (
            <div key={i} className="fraction-problem">
              <span className="fraction-number">({i + 1})</span>
              <div className="fraction-frac">
                <span className="fraction-numerator">{p.numerators[0]}</span>
                <span className="fraction-denominator">{p.denominator}</span>
              </div>
              <span className="fraction-operator">+</span>
              <div className="fraction-frac">
                <span className="fraction-numerator">{p.numerators[1]}</span>
                <span className="fraction-denominator">{p.denominator}</span>
              </div>
              <span className="fraction-equals">=</span>
              <div className={`fraction-frac fraction-answer${showAnswers ? "" : " fraction-hidden"}`}>
                <span className="fraction-numerator">{sum}</span>
                <span className="fraction-denominator">{p.denominator}</span>
              </div>
            </div>
          );
        })}
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
  operators: [{ operator: "addition", label: "たし算" }],
  Component: Fraction,
};
