import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { randomSeed, seedToHex, hexToSeed } from "../random";
import type { ProblemGroup } from "../types";
import { Box } from "../shared/Box";
import {
  generateDivision,
  generateBoxEq,
  generateMentalMath,
  generateUnitConv3,
  generateDecimalComp,
  generateTimeCalc3,
  generateLargeNum3,
  generateBarGraph,
  generateCircleRD,
} from "./generators";
import type { BarGraphProblem, CircleRDProblem } from "./generators";

/* ================================================================
   Types
   ================================================================ */

type Grade3Op =
  | "division"
  | "box-eq"
  | "mental-math"
  | "unit-conv3"
  | "decimal-comp"
  | "time-calc3"
  | "large-num3"
  | "bar-graph"
  | "circle-rd";

/* ================================================================
   Defaults
   ================================================================ */

const DIV_DEF = { rem: "mixed" as const };
const BOX_DEF = { ops: "addsub" as const };
const MENTAL_DEF = { mmode: "mixed" as const };
const UNIT3_DEF = { unit3: "mixed" as const };
const DCOMP_DEF = { dmax: 10 };
const TIME3_DEF = { t3mode: "mixed" as const };
const LARGE3_DEF = { ln3mode: "mixed" as const };
const BAR_DEF = { bars: 4 };

/* ================================================================
   Main component
   ================================================================ */

const Grade3 = ({ operator }: { operator: string }) => {
  const op = operator as Grade3Op;

  const getInitial = () => {
    const p = new URLSearchParams(window.location.search);
    const qHex = p.get("q");
    const seed = qHex ? hexToSeed(qHex) ?? randomSeed() : randomSeed();
    const showAnswers = p.get("answers") === "1";

    const remRaw = p.get("rem") ?? DIV_DEF.rem;
    const rem: "none" | "yes" | "mixed" =
      (["none", "yes", "mixed"] as const).includes(remRaw as any)
        ? (remRaw as any) : DIV_DEF.rem;

    const opsRaw = p.get("ops") ?? BOX_DEF.ops;
    const ops: "addsub" | "all" =
      opsRaw === "all" ? "all" : "addsub";

    const mmodeRaw = p.get("mmode") ?? MENTAL_DEF.mmode;
    const mmode: "add" | "sub" | "mixed" =
      mmodeRaw === "add" || mmodeRaw === "sub" ? mmodeRaw : "mixed";

    const unit3Raw = p.get("unit3") ?? UNIT3_DEF.unit3;
    const unit3: "length" | "weight" | "mixed" =
      (["length", "weight", "mixed"] as const).includes(unit3Raw as any)
        ? (unit3Raw as any) : UNIT3_DEF.unit3;

    const dmax = Math.max(5, Math.min(100,
      parseInt(p.get("dmax") ?? String(DCOMP_DEF.dmax), 10) || DCOMP_DEF.dmax));

    const t3modeRaw = p.get("t3mode") ?? TIME3_DEF.t3mode;
    const t3mode: "after" | "duration" | "seconds" | "mixed" =
      (["after", "duration", "seconds", "mixed"] as const).includes(t3modeRaw as any)
        ? (t3modeRaw as any) : TIME3_DEF.t3mode;

    const ln3modeRaw = p.get("ln3mode") ?? LARGE3_DEF.ln3mode;
    const ln3mode: "read" | "count" | "multiply" | "mixed" =
      (["read", "count", "multiply", "mixed"] as const).includes(ln3modeRaw as any)
        ? (ln3modeRaw as any) : LARGE3_DEF.ln3mode;

    const bars = Math.max(4, Math.min(6,
      parseInt(p.get("bars") ?? String(BAR_DEF.bars), 10) || BAR_DEF.bars));

    return { seed, showAnswers, rem, ops, mmode, unit3, dmax, t3mode, ln3mode, bars };
  };

  const [initial] = useState(getInitial);
  const [seed, setSeed] = useState(initial.seed);
  const [showAnswers, setShowAnswers] = useState(initial.showAnswers);
  const [showSettings, setShowSettings] = useState(false);

  const [rem, setRem] = useState(initial.rem);
  const [ops, setOps] = useState(initial.ops);
  const [mmode, setMmode] = useState(initial.mmode);
  const [unit3, setUnit3] = useState(initial.unit3);
  const [dmax, setDmax] = useState(initial.dmax);
  const [t3mode, setT3mode] = useState(initial.t3mode);
  const [ln3mode, setLn3mode] = useState(initial.ln3mode);
  const [bars, setBars] = useState(initial.bars);

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
      case "division":
        if (rem !== DIV_DEF.rem) m.rem = rem;
        break;
      case "box-eq":
        if (ops !== BOX_DEF.ops) m.ops = ops;
        break;
      case "mental-math":
        if (mmode !== MENTAL_DEF.mmode) m.mmode = mmode;
        break;
      case "unit-conv3":
        if (unit3 !== UNIT3_DEF.unit3) m.unit3 = unit3;
        break;
      case "decimal-comp":
        if (dmax !== DCOMP_DEF.dmax) m.dmax = String(dmax);
        break;
      case "time-calc3":
        if (t3mode !== TIME3_DEF.t3mode) m.t3mode = t3mode;
        break;
      case "large-num3":
        if (ln3mode !== LARGE3_DEF.ln3mode) m.ln3mode = ln3mode;
        break;
      case "bar-graph":
        if (bars !== BAR_DEF.bars) m.bars = String(bars);
        break;
      case "circle-rd":
        break;
    }
    return m;
  }, [op, rem, ops, mmode, unit3, dmax, t3mode, ln3mode, bars]);

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

  const onRemChange = useCallback((v: "none" | "yes" | "mixed") => {
    setRem(v);
    const p: Record<string, string> = {};
    if (v !== DIV_DEF.rem) p.rem = v;
    regen(p);
  }, [regen]);

  const onOpsChange = useCallback((v: "addsub" | "all") => {
    setOps(v);
    const p: Record<string, string> = {};
    if (v !== BOX_DEF.ops) p.ops = v;
    regen(p);
  }, [regen]);

  const onMmodeChange = useCallback((v: "add" | "sub" | "mixed") => {
    setMmode(v);
    const p: Record<string, string> = {};
    if (v !== MENTAL_DEF.mmode) p.mmode = v;
    regen(p);
  }, [regen]);

  const onUnit3Change = useCallback((v: "length" | "weight" | "mixed") => {
    setUnit3(v);
    const p: Record<string, string> = {};
    if (v !== UNIT3_DEF.unit3) p.unit3 = v;
    regen(p);
  }, [regen]);

  const onDmaxChange = useCallback((v: number) => {
    setDmax(v);
    const p: Record<string, string> = {};
    if (v !== DCOMP_DEF.dmax) p.dmax = String(v);
    regen(p);
  }, [regen]);

  const onT3modeChange = useCallback((v: "after" | "duration" | "seconds" | "mixed") => {
    setT3mode(v);
    const p: Record<string, string> = {};
    if (v !== TIME3_DEF.t3mode) p.t3mode = v;
    regen(p);
  }, [regen]);

  const onLn3modeChange = useCallback((v: "read" | "count" | "multiply" | "mixed") => {
    setLn3mode(v);
    const p: Record<string, string> = {};
    if (v !== LARGE3_DEF.ln3mode) p.ln3mode = v;
    regen(p);
  }, [regen]);

  const onBarsChange = useCallback((v: number) => {
    setBars(v);
    const p: Record<string, string> = {};
    if (v !== BAR_DEF.bars) p.bars = String(v);
    regen(p);
  }, [regen]);

  /* ---- generate problems ---- */

  const divProblems = useMemo(
    () => op === "division" ? generateDivision(seed, rem) : [],
    [op, seed, rem],
  );
  const boxProblems = useMemo(
    () => op === "box-eq" ? generateBoxEq(seed, ops) : [],
    [op, seed, ops],
  );
  const mentalProblems = useMemo(
    () => op === "mental-math" ? generateMentalMath(seed, mmode) : [],
    [op, seed, mmode],
  );
  const unitProblems = useMemo(
    () => op === "unit-conv3" ? generateUnitConv3(seed, unit3) : [],
    [op, seed, unit3],
  );
  const decimalProblems = useMemo(
    () => op === "decimal-comp" ? generateDecimalComp(seed, dmax) : [],
    [op, seed, dmax],
  );
  const timeCalc3Problems = useMemo(
    () => op === "time-calc3" ? generateTimeCalc3(seed, t3mode) : [],
    [op, seed, t3mode],
  );
  const largeNum3Problems = useMemo(
    () => op === "large-num3" ? generateLargeNum3(seed, ln3mode) : [],
    [op, seed, ln3mode],
  );
  const barGraphProblems = useMemo(
    () => op === "bar-graph" ? generateBarGraph(seed, bars) : [],
    [op, seed, bars],
  );
  const circleRDProblems = useMemo(
    () => op === "circle-rd" ? generateCircleRD(seed) : [],
    [op, seed],
  );

  /* ---- settings panel ---- */

  const renderSettings = () => {
    switch (op) {
      case "division":
        return (
          <div className="no-print settings-panel">
            <label>
              あまり{" "}
              <select className="operator-select" value={rem}
                onChange={(e) => onRemChange(e.target.value as any)}>
                <option value="mixed">あり・なし混合</option>
                <option value="none">あまりなし</option>
                <option value="yes">あまりあり</option>
              </select>
            </label>
          </div>
        );
      case "box-eq":
        return (
          <div className="no-print settings-panel">
            <label>
              演算{" "}
              <select className="operator-select" value={ops}
                onChange={(e) => onOpsChange(e.target.value as any)}>
                <option value="addsub">＋・− のみ</option>
                <option value="all">＋・−・×・÷</option>
              </select>
            </label>
          </div>
        );
      case "mental-math":
        return (
          <div className="no-print settings-panel">
            <label>
              計算{" "}
              <select className="operator-select" value={mmode}
                onChange={(e) => onMmodeChange(e.target.value as any)}>
                <option value="mixed">たし算・ひき算</option>
                <option value="add">たし算のみ</option>
                <option value="sub">ひき算のみ</option>
              </select>
            </label>
          </div>
        );
      case "unit-conv3":
        return (
          <div className="no-print settings-panel">
            <label>
              単位{" "}
              <select className="operator-select" value={unit3}
                onChange={(e) => onUnit3Change(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="length">長さ（m・km）</option>
                <option value="weight">重さ（g・kg・t）</option>
              </select>
            </label>
          </div>
        );
      case "decimal-comp":
        return (
          <div className="no-print settings-panel">
            <label>
              最大の数{" "}
              <select className="operator-select" value={dmax}
                onChange={(e) => onDmaxChange(Number(e.target.value))}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={100}>100</option>
              </select>
            </label>
          </div>
        );
      case "time-calc3":
        return (
          <div className="no-print settings-panel">
            <label>
              問題の種類{" "}
              <select className="operator-select" value={t3mode}
                onChange={(e) => onT3modeChange(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="after">○分後の時刻</option>
                <option value="duration">時間の長さ</option>
                <option value="seconds">秒の計算</option>
              </select>
            </label>
          </div>
        );
      case "large-num3":
        return (
          <div className="no-print settings-panel">
            <label>
              問題の種類{" "}
              <select className="operator-select" value={ln3mode}
                onChange={(e) => onLn3modeChange(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="read">読み書き</option>
                <option value="count">いくつ分</option>
                <option value="multiply">何倍・1/N</option>
              </select>
            </label>
          </div>
        );
      case "bar-graph":
        return (
          <div className="no-print settings-panel">
            <label>
              棒の数{" "}
              <select className="operator-select" value={bars}
                onChange={(e) => onBarsChange(Number(e.target.value))}>
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
              </select>
            </label>
          </div>
        );
      case "circle-rd":
        return null;
      default:
        return null;
    }
  };

  /* ---- render bar graph SVG ---- */

  const renderBarChart = (bp: BarGraphProblem) => {
    const chartWidth = 300;
    const chartHeight = 200;
    const marginLeft = 40;
    const marginBottom = 40;
    const marginTop = 10;
    const marginRight = 10;
    const plotWidth = chartWidth - marginLeft - marginRight;
    const plotHeight = chartHeight - marginTop - marginBottom;
    const barCount = bp.categories.length;
    const barGap = 4;
    const barWidth = Math.max(10, (plotWidth - barGap * (barCount + 1)) / barCount);

    const scaleSteps: number[] = [];
    for (let v = 0; v <= bp.scaleMax; v += bp.scaleStep) {
      scaleSteps.push(v);
    }

    return (
      <svg
        width={chartWidth}
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        style={{ display: "block", margin: "8px 0" }}
      >
        {/* Y-axis */}
        <line
          x1={marginLeft} y1={marginTop}
          x2={marginLeft} y2={chartHeight - marginBottom}
          stroke="#333" strokeWidth={1}
        />
        {/* X-axis */}
        <line
          x1={marginLeft} y1={chartHeight - marginBottom}
          x2={chartWidth - marginRight} y2={chartHeight - marginBottom}
          stroke="#333" strokeWidth={1}
        />
        {/* Y-axis labels and grid lines */}
        {scaleSteps.map((v) => {
          const y = chartHeight - marginBottom - (v / bp.scaleMax) * plotHeight;
          return (
            <g key={v}>
              <line
                x1={marginLeft - 3} y1={y}
                x2={chartWidth - marginRight} y2={y}
                stroke="#ddd" strokeWidth={0.5}
              />
              <text
                x={marginLeft - 6} y={y + 4}
                textAnchor="end" fontSize={10} fill="#333"
              >
                {v}
              </text>
            </g>
          );
        })}
        {/* Y-axis unit label */}
        <text
          x={marginLeft - 6} y={marginTop - 2}
          textAnchor="end" fontSize={9} fill="#666"
        >
          ({bp.unit})
        </text>
        {/* Bars */}
        {bp.categories.map((cat, i) => {
          const x = marginLeft + barGap + i * (barWidth + barGap);
          const barH = (bp.values[i] / bp.scaleMax) * plotHeight;
          const y = chartHeight - marginBottom - barH;
          return (
            <g key={i}>
              <rect
                x={x} y={y}
                width={barWidth} height={barH}
                fill="#4a90d9" stroke="#333" strokeWidth={0.5}
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight - marginBottom + 14}
                textAnchor="middle" fontSize={10} fill="#333"
              >
                {cat}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  /* ---- render circle radius/diameter SVG ---- */

  const renderCircleRD = (p: CircleRDProblem) => {
    const W = 160;
    const H = 160;
    const cx = W / 2;
    const cy = H / 2;
    const cr = 50;
    const { figure } = p;
    const isKnownRadius =
      figure.type === "radius-to-diameter" || figure.type === "conceptual";
    const isKnownDiameter = figure.type === "diameter-to-radius";

    const radiusLabel = isKnownRadius ? `${figure.radius}cm` : "?";
    const diameterLabel = isKnownDiameter ? `${figure.diameter}cm` : figure.type === "conceptual" ? `${figure.diameter}cm` : "?";
    const radiusColor = isKnownRadius ? "#1976d2" : "#d32f2f";
    const diameterColor = isKnownDiameter || figure.type === "conceptual" ? "#1976d2" : "#d32f2f";

    return (
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", margin: "8px 0" }}
      >
        {/* Circle */}
        <circle cx={cx} cy={cy} r={cr} fill="none" stroke="#333" strokeWidth={1.5} />
        {/* Center dot */}
        <circle cx={cx} cy={cy} r={2.5} fill="#333" />
        {/* Diameter line */}
        <line
          x1={cx - cr} y1={cy} x2={cx + cr} y2={cy}
          stroke={diameterColor} strokeWidth={1.5}
          strokeDasharray={isKnownDiameter || figure.type === "conceptual" ? "none" : "4 3"}
        />
        {/* Diameter label */}
        <text x={cx} y={cy - cr - 8} textAnchor="middle" fontSize={11} fill={diameterColor} fontWeight="bold">
          {figure.type === "conceptual" ? `直径 ${diameterLabel}` : `直径 = ${diameterLabel}`}
        </text>
        {/* Diameter arrows */}
        <line x1={cx - cr} y1={cy - 4} x2={cx - cr} y2={cy + 4} stroke={diameterColor} strokeWidth={1.5} />
        <line x1={cx + cr} y1={cy - 4} x2={cx + cr} y2={cy + 4} stroke={diameterColor} strokeWidth={1.5} />
        {/* Radius line (lower half) */}
        <line
          x1={cx} y1={cy} x2={cx + cr} y2={cy + 0.01}
          stroke={radiusColor} strokeWidth={2}
          strokeDasharray={isKnownRadius ? "none" : "4 3"}
        />
        {/* Radius label */}
        <text x={cx + cr / 2} y={cy + 20} textAnchor="middle" fontSize={11} fill={radiusColor} fontWeight="bold">
          {`半径 = ${radiusLabel}`}
        </text>
      </svg>
    );
  };

  /* ---- render problems ---- */

  const renderProblems = () => {
    switch (op) {
      case "division":
        return (
          <div className="g1-page g1-cols-3">
            {divProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  <span className="g1-val">{p.dividend}</span>
                  <span className="g1-op">&divide;</span>
                  <span className="g1-val">{p.divisor}</span>
                  <span className="g1-op">=</span>
                  <Box answer={p.quotient} show={showAnswers} />
                  {p.remainder > 0 && (
                    <>
                      <span className="g1-op" style={{ fontSize: 18 }}>あまり</span>
                      <Box answer={p.remainder} show={showAnswers} />
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        );

      case "box-eq":
        return (
          <div className="g1-page g1-cols-2">
            {boxProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  <span className="dev-text-q">{p.display}</span>
                  <span style={{ marginLeft: 8 }}>
                    <Box answer={p.answer} show={showAnswers} />
                  </span>
                </span>
              </div>
            ))}
          </div>
        );

      case "mental-math":
        return (
          <div className="g1-page g1-cols-4">
            {mentalProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  <span className="g1-val">{p.left}</span>
                  <span className="g1-op">{p.op}</span>
                  <span className="g1-val">{p.right}</span>
                  <span className="g1-op">=</span>
                  <Box answer={p.answer} show={showAnswers} />
                </span>
              </div>
            ))}
          </div>
        );

      case "unit-conv3":
        return (
          <div className="dev-text-page">
            {unitProblems.map((p, i) => (
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

      case "decimal-comp":
        return (
          <div className="g1-page g1-cols-3">
            {decimalProblems.map((p, i) => (
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

      case "time-calc3":
        return (
          <div className="dev-text-page">
            {timeCalc3Problems.map((p, i) => (
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

      case "large-num3":
        return (
          <div className="dev-text-page">
            {largeNum3Problems.map((p, i) => (
              <div key={i} className="dev-text-row">
                <span className="g1-num">({i + 1})</span>
                <span className="dev-text-q">{p.question}</span>
                <span className="dev-text-arrow">&rarr;</span>
                <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                  {p.answer}
                </span>
              </div>
            ))}
          </div>
        );

      case "bar-graph":
        return (
          <div className="dev-text-page">
            {barGraphProblems.map((bp, idx) => (
              <div key={idx} className="dev-prop-block">
                <div className="dev-prop-label">
                  ({idx + 1}) {bp.title}
                </div>
                {renderBarChart(bp)}
                <div style={{ marginTop: 8 }}>
                  {bp.questions.map((q, j) => (
                    <div key={j} className="dev-text-row">
                      <span className="dev-text-q">{q.question}</span>
                      <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                        {q.answer}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case "circle-rd":
        return (
          <div className="dev-fig-page">
            {circleRDProblems.map((p, i) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1})</div>
                {renderCircleRD(p)}
                <div style={{ marginTop: 8 }}>
                  <div className="dev-text-row">
                    <span className="dev-text-q">{p.question}</span>
                    <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                      {p.answer}
                    </span>
                  </div>
                </div>
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
};

export default Grade3;

/* ================================================================
   URL state helpers
   ================================================================ */

const ALL_PARAMS = ["q", "answers", "rem", "ops", "mmode", "unit3", "dmax", "t3mode", "ln3mode", "bars"];

const cleanParams = (url: URL) => {
  for (const k of ALL_PARAMS) url.searchParams.delete(k);
};

/* ================================================================
   Exported group definition
   ================================================================ */

export const devGrade3: ProblemGroup = {
  id: "dev3",
  label: "3年（開発中）",
  operators: [
    { operator: "division", label: "わり算", grades: [3] },
    { operator: "box-eq", label: "□を使った式", grades: [3] },
    { operator: "mental-math", label: "暗算", grades: [3] },
    { operator: "unit-conv3", label: "単位の換算", grades: [3] },
    { operator: "decimal-comp", label: "小数の大小比較", grades: [3] },
    { operator: "time-calc3", label: "時刻と時間（3年）", grades: [3] },
    { operator: "large-num3", label: "大きな数（万の位）", grades: [3] },
    { operator: "bar-graph", label: "棒グラフ", grades: [3] },
    { operator: "circle-rd", label: "円の半径と直径", grades: [3] },
  ],
  Component: Grade3,
};
