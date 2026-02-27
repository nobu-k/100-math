import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { randomSeed, seedToHex, hexToSeed } from "../random";
import { M, texRed } from "../shared/M";
import { DEFAULTS, PARAM_KEYS, frac, updateUrl, generateReductionProblems } from "./generators";
import "./fraction.css";

const defaults = DEFAULTS.reduction;
const minFloor = 4;
const maxCeil = 99;

const Reduction = () => {
  const [initial] = useState(getInitialState);
  const [seed, setSeed] = useState(initial.seed);
  const [showAnswers, setShowAnswers] = useState(initial.showAnswers);
  const [minDenom, setMinDenom] = useState(initial.minDenom);
  const [maxDenom, setMaxDenom] = useState(initial.maxDenom);
  const [showSettings, setShowSettings] = useState(false);
  const [editMin, setEditMin] = useState<string | null>(null);
  const [editMax, setEditMax] = useState<string | null>(null);

  const problems = useMemo(
    () => generateReductionProblems(seed, minDenom, maxDenom),
    [seed, minDenom, maxDenom],
  );

  const handleNewProblems = useCallback(() => {
    const newSeed = randomSeed();
    updateUrl(newSeed, false, minDenom, maxDenom, defaults);
    setSeed(newSeed);
    setShowAnswers(false);
  }, [minDenom, maxDenom]);

  const handleToggleAnswers = useCallback(() => {
    setShowAnswers((prev) => {
      updateUrl(seed, !prev, minDenom, maxDenom, defaults);
      return !prev;
    });
  }, [seed, minDenom, maxDenom]);

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
    [],
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
    [],
  );

  const qrUrl = useMemo(() => buildQrUrl(seed, minDenom, maxDenom), [seed, minDenom, maxDenom]);

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
            <M tex={`${frac(p.numerator, p.denominator)} = `} />
            <span className={showAnswers ? "" : "fraction-hidden"}>
              <M tex={texRed(frac(p.answerNumerator, p.answerDenominator))} />
            </span>
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

const getInitialState = () => {
  const params = new URLSearchParams(window.location.search);
  const dmin = Math.max(minFloor, Math.min(maxCeil, parseInt(params.get("dmin") ?? String(defaults.dmin), 10) || defaults.dmin));
  const dmax = Math.max(dmin, Math.min(maxCeil, parseInt(params.get("dmax") ?? String(defaults.dmax), 10) || defaults.dmax));
  const q = params.get("q");
  const parsedSeed = q ? hexToSeed(q) : null;
  const seed = parsedSeed ?? randomSeed();
  const showAnswers = params.get("answers") === "1";
  if (parsedSeed === null) updateUrl(seed, showAnswers, dmin, dmax, defaults);
  return { seed, showAnswers, minDenom: dmin, maxDenom: dmax };
};

const buildQrUrl = (seed: number, minDenom: number, maxDenom: number): string => {
  const url = new URL(window.location.href);
  for (const key of PARAM_KEYS) {
    url.searchParams.delete(key);
  }
  url.searchParams.set("q", seedToHex(seed));
  url.searchParams.set("answers", "1");
  if (minDenom !== defaults.dmin) url.searchParams.set("dmin", String(minDenom));
  if (maxDenom !== defaults.dmax) url.searchParams.set("dmax", String(maxDenom));
  return url.toString();
};

export default Reduction;
