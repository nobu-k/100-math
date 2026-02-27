import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { randomSeed, seedToHex, hexToSeed } from "../random";
import { generateLcmProblems, DEFAULTS, PARAM_KEYS } from "./generators";
import type { LcmProblem } from "./generators";
import "./integer.css";

const defaults = DEFAULTS.lcm;

const Lcm = () => {
  const [initial] = useState(parseInitialState);
  const [seed, setSeed] = useState(initial.seed);
  const [showAnswers, setShowAnswers] = useState(initial.showAnswers);
  const [nmin, setNmin] = useState(initial.nmin);
  const [nmax, setNmax] = useState(initial.nmax);
  const [showSettings, setShowSettings] = useState(false);
  const [editMin, setEditMin] = useState<string | null>(null);
  const [editMax, setEditMax] = useState<string | null>(null);

  const problems = useMemo(
    () => generateLcmProblems(seed, nmin, nmax),
    [seed, nmin, nmax],
  );

  const qrUrl = useMemo(
    () => buildQrUrl(seed, nmin, nmax),
    [seed, nmin, nmax],
  );

  const handleNewProblems = useCallback(() => {
    const newSeed = randomSeed();
    updateUrl(newSeed, false, nmin, nmax);
    setSeed(newSeed);
    setShowAnswers(false);
  }, [nmin, nmax]);

  const handleToggleAnswers = useCallback(() => {
    setShowAnswers((prev) => {
      updateUrl(seed, !prev, nmin, nmax);
      return !prev;
    });
  }, [seed, nmin, nmax]);

  const regenerate = useCallback((nextMin: number, nextMax: number) => {
    const newSeed = randomSeed();
    setSeed(newSeed);
    setShowAnswers(false);
    updateUrl(newSeed, false, nextMin, nextMax);
  }, []);

  const commitMin = useCallback(
    (raw: string) => {
      setEditMin(null);
      const parsed = parseInt(raw, 10);
      if (isNaN(parsed)) return;
      const v = Math.max(2, Math.min(99, parsed));
      setNmin(v);
      setNmax((prev) => {
        const next = Math.max(prev, v);
        regenerate(v, next);
        return next;
      });
    },
    [regenerate],
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
        regenerate(next, v);
        return next;
      });
    },
    [regenerate],
  );

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
        </div>
      )}
      <div className="integer-page">
        {problems.map((p, i) => (
          <div key={i} className="integer-problem integer-lcm-problem">
            <div className="integer-question">
              <span className="integer-number">({i + 1})</span>
              <span className="integer-text">
                {p.a} と {p.b} の最小公倍数
              </span>
            </div>
            <div className="integer-ladder-area">
              {renderLadder(p, showAnswers)}
              {renderAnswerText(p, showAnswers)}
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
};

export default Lcm;

const renderLadder = (p: LcmProblem, showAnswers: boolean) => (
  <table className={`integer-ladder${showAnswers ? "" : " integer-hidden"}`}>
    <tbody>
      {p.ladder.map((row, ri) => (
        <tr key={ri}>
          <td className="integer-ladder-cell integer-ladder-div integer-ladder-hl">{row.divisor}</td>
          <td className="integer-ladder-cell integer-ladder-val integer-ladder-val-start">
            <svg className="integer-ladder-bracket" viewBox="0 0 10 30" preserveAspectRatio="none">
              <path d="M0,8 C10,14 10,22 0,30" stroke="currentColor" strokeWidth="3" fill="none" />
            </svg>
            {row.values[0]}
          </td>
          <td className="integer-ladder-cell integer-ladder-val">{row.values[1]}</td>
        </tr>
      ))}
      <tr>
        <td className="integer-ladder-cell integer-ladder-div"></td>
        <td className="integer-ladder-cell integer-ladder-bottom integer-ladder-hl">{p.ladderBottom[0]}</td>
        <td className="integer-ladder-cell integer-ladder-bottom integer-ladder-hl">{p.ladderBottom[1]}</td>
      </tr>
    </tbody>
  </table>
);

const renderAnswerText = (p: LcmProblem, showAnswers: boolean) => {
  const parts = p.ladder.map((r) => r.divisor);
  parts.push(p.ladderBottom[0], p.ladderBottom[1]);
  return (
    <div className={`integer-answer-text${showAnswers ? "" : " integer-hidden"}`}>
      {parts.join(" × ") + " = " + p.answer}
    </div>
  );
};

const parseInitialState = () => {
  const params = new URLSearchParams(window.location.search);
  const nmin = Math.max(2, Math.min(99, parseInt(params.get("nmin") ?? String(defaults.nmin), 10) || defaults.nmin));
  const nmax = Math.max(nmin, Math.min(99, parseInt(params.get("nmax") ?? String(defaults.nmax), 10) || defaults.nmax));
  const q = params.get("q");
  const parsedSeed = q ? hexToSeed(q) : null;
  const seed = parsedSeed ?? randomSeed();
  const showAnswers = params.get("answers") === "1";
  if (parsedSeed === null) updateUrl(seed, showAnswers, nmin, nmax);
  return { seed, showAnswers, nmin, nmax };
};

const updateUrl = (
  seed: number,
  showAnswers: boolean,
  nmin: number,
  nmax: number,
) => {
  const url = new URL(window.location.href);
  for (const key of PARAM_KEYS) {
    url.searchParams.delete(key);
  }
  url.searchParams.set("q", seedToHex(seed));
  if (showAnswers) url.searchParams.set("answers", "1");
  if (nmin !== defaults.nmin) url.searchParams.set("nmin", String(nmin));
  if (nmax !== defaults.nmax) url.searchParams.set("nmax", String(nmax));
  window.history.replaceState(null, "", url.toString());
};

const buildQrUrl = (
  seed: number,
  nmin: number,
  nmax: number,
): string => {
  const url = new URL(window.location.href);
  for (const key of PARAM_KEYS) {
    url.searchParams.delete(key);
  }
  url.searchParams.set("q", seedToHex(seed));
  url.searchParams.set("answers", "1");
  if (nmin !== defaults.nmin) url.searchParams.set("nmin", String(nmin));
  if (nmax !== defaults.nmax) url.searchParams.set("nmax", String(nmax));
  return url.toString();
};
