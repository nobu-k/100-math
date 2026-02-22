import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { randomSeed, seedToHex, hexToSeed } from "../random";
import type { ProblemGroup } from "../types";
import {
  generateSqrt,
  generateExpansion,
  generateFactoring,
  generateQuadEq,
  generateSimilarity,
  generateCircleAngle,
  generatePythagorean,
  generateQuadFunc,
  generateSampling,
} from "./generators";
import type {
  SqrtMode,
  ExpansionMode,
  FactoringMode,
  QuadEqMode,
  SimilarityMode,
  SimilarityProblem,
  CircleAngleMode,
  CircleAngleProblem,
  PythagoreanMode,
  PythagoreanProblem,
  QuadFuncMode,
  SamplingMode,
} from "./generators";

/* ================================================================
   Types
   ================================================================ */

type Grade9Op =
  | "square-root"
  | "expansion"
  | "factoring"
  | "quadratic-eq"
  | "similarity"
  | "circle-angle"
  | "pythagorean"
  | "quadratic-func"
  | "sampling";

/* ================================================================
   URL state helpers
   ================================================================ */

const ALL_PARAMS = [
  "q", "answers", "sqmode", "exmode", "fcmode", "qemode",
  "smmode", "camode", "ptmode", "qfmode", "spmode",
];

const cleanParams = (url: URL) => {
  for (const k of ALL_PARAMS) url.searchParams.delete(k);
};

/* ================================================================
   Defaults
   ================================================================ */

const SQRT_DEF = { sqmode: "mixed" as SqrtMode };
const EXP_DEF = { exmode: "mixed" as ExpansionMode };
const FAC_DEF = { fcmode: "mixed" as FactoringMode };
const QUADEQ_DEF = { qemode: "mixed" as QuadEqMode };
const SIM_DEF = { smmode: "mixed" as SimilarityMode };
const CIRCLE_DEF = { camode: "mixed" as CircleAngleMode };
const PYTH_DEF = { ptmode: "mixed" as PythagoreanMode };
const QUADF_DEF = { qfmode: "mixed" as QuadFuncMode };
const SAMP_DEF = { spmode: "mixed" as SamplingMode };

/* ================================================================
   Main component
   ================================================================ */

const Grade9 = ({ operator }: { operator: string }) => {
  const op = operator as Grade9Op;

  const getInitial = () => {
    const p = new URLSearchParams(window.location.search);
    const qHex = p.get("q");
    const seed = qHex ? hexToSeed(qHex) ?? randomSeed() : randomSeed();
    const showAnswers = p.get("answers") === "1";

    const sqmodeRaw = p.get("sqmode") ?? SQRT_DEF.sqmode;
    const sqmode = (["find", "simplify", "mul-div", "add-sub", "rationalize", "mixed"] as const).includes(sqmodeRaw as any)
      ? (sqmodeRaw as SqrtMode) : SQRT_DEF.sqmode;

    const exmodeRaw = p.get("exmode") ?? EXP_DEF.exmode;
    const exmode = (["distribute", "formula", "mixed"] as const).includes(exmodeRaw as any)
      ? (exmodeRaw as ExpansionMode) : EXP_DEF.exmode;

    const fcmodeRaw = p.get("fcmode") ?? FAC_DEF.fcmode;
    const fcmode = (["common", "formula", "mixed"] as const).includes(fcmodeRaw as any)
      ? (fcmodeRaw as FactoringMode) : FAC_DEF.fcmode;

    const qemodeRaw = p.get("qemode") ?? QUADEQ_DEF.qemode;
    const qemode = (["factoring", "formula", "mixed"] as const).includes(qemodeRaw as any)
      ? (qemodeRaw as QuadEqMode) : QUADEQ_DEF.qemode;

    const smmodeRaw = p.get("smmode") ?? SIM_DEF.smmode;
    const smmode = (["ratio", "parallel-line", "midpoint", "mixed"] as const).includes(smmodeRaw as any)
      ? (smmodeRaw as SimilarityMode) : SIM_DEF.smmode;

    const camodeRaw = p.get("camode") ?? CIRCLE_DEF.camode;
    const camode = (["basic", "inscribed", "mixed"] as const).includes(camodeRaw as any)
      ? (camodeRaw as CircleAngleMode) : CIRCLE_DEF.camode;

    const ptmodeRaw = p.get("ptmode") ?? PYTH_DEF.ptmode;
    const ptmode = (["basic", "special", "applied", "mixed"] as const).includes(ptmodeRaw as any)
      ? (ptmodeRaw as PythagoreanMode) : PYTH_DEF.ptmode;

    const qfmodeRaw = p.get("qfmode") ?? QUADF_DEF.qfmode;
    const qfmode = (["value", "rate-of-change", "graph", "mixed"] as const).includes(qfmodeRaw as any)
      ? (qfmodeRaw as QuadFuncMode) : QUADF_DEF.qfmode;

    const spmodeRaw = p.get("spmode") ?? SAMP_DEF.spmode;
    const spmode = (["concept", "estimation", "mixed"] as const).includes(spmodeRaw as any)
      ? (spmodeRaw as SamplingMode) : SAMP_DEF.spmode;

    return { seed, showAnswers, sqmode, exmode, fcmode, qemode, smmode, camode, ptmode, qfmode, spmode };
  };

  const [initial] = useState(getInitial);
  const [seed, setSeed] = useState(initial.seed);
  const [showAnswers, setShowAnswers] = useState(initial.showAnswers);
  const [showSettings, setShowSettings] = useState(false);

  const [sqmode, setSqmode] = useState(initial.sqmode);
  const [exmode, setExmode] = useState(initial.exmode);
  const [fcmode, setFcmode] = useState(initial.fcmode);
  const [qemode, setQemode] = useState(initial.qemode);
  const [smmode, setSmmode] = useState(initial.smmode);
  const [camode, setCamode] = useState(initial.camode);
  const [ptmode, setPtmode] = useState(initial.ptmode);
  const [qfmode, setQfmode] = useState(initial.qfmode);
  const [spmode, setSpmode] = useState(initial.spmode);

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
      case "square-root":
        if (sqmode !== SQRT_DEF.sqmode) m.sqmode = sqmode;
        break;
      case "expansion":
        if (exmode !== EXP_DEF.exmode) m.exmode = exmode;
        break;
      case "factoring":
        if (fcmode !== FAC_DEF.fcmode) m.fcmode = fcmode;
        break;
      case "quadratic-eq":
        if (qemode !== QUADEQ_DEF.qemode) m.qemode = qemode;
        break;
      case "similarity":
        if (smmode !== SIM_DEF.smmode) m.smmode = smmode;
        break;
      case "circle-angle":
        if (camode !== CIRCLE_DEF.camode) m.camode = camode;
        break;
      case "pythagorean":
        if (ptmode !== PYTH_DEF.ptmode) m.ptmode = ptmode;
        break;
      case "quadratic-func":
        if (qfmode !== QUADF_DEF.qfmode) m.qfmode = qfmode;
        break;
      case "sampling":
        if (spmode !== SAMP_DEF.spmode) m.spmode = spmode;
        break;
    }
    return m;
  }, [op, sqmode, exmode, fcmode, qemode, smmode, camode, ptmode, qfmode, spmode]);

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

  const onSettingChange = useCallback(
    <T,>(setter: (v: T) => void, key: string, defVal: T) =>
      (v: T) => {
        setter(v);
        const p: Record<string, string> = {};
        if (v !== defVal) p[key] = String(v);
        regen(p);
      },
    [regen],
  );

  /* ---- generate problems ---- */

  const sqrtProblems = useMemo(
    () => op === "square-root" ? generateSqrt(seed, sqmode) : [],
    [op, seed, sqmode],
  );
  const expProblems = useMemo(
    () => op === "expansion" ? generateExpansion(seed, exmode) : [],
    [op, seed, exmode],
  );
  const facProblems = useMemo(
    () => op === "factoring" ? generateFactoring(seed, fcmode) : [],
    [op, seed, fcmode],
  );
  const quadEqProblems = useMemo(
    () => op === "quadratic-eq" ? generateQuadEq(seed, qemode) : [],
    [op, seed, qemode],
  );
  const simProblems = useMemo(
    () => op === "similarity" ? generateSimilarity(seed, smmode) : [],
    [op, seed, smmode],
  );
  const circleProblems = useMemo(
    () => op === "circle-angle" ? generateCircleAngle(seed, camode) : [],
    [op, seed, camode],
  );
  const pythProblems = useMemo(
    () => op === "pythagorean" ? generatePythagorean(seed, ptmode) : [],
    [op, seed, ptmode],
  );
  const quadFuncProblems = useMemo(
    () => op === "quadratic-func" ? generateQuadFunc(seed, qfmode) : [],
    [op, seed, qfmode],
  );
  const sampProblems = useMemo(
    () => op === "sampling" ? generateSampling(seed, spmode) : [],
    [op, seed, spmode],
  );

  /* ---- settings panel ---- */

  const renderSettings = () => {
    switch (op) {
      case "square-root":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={sqmode}
                onChange={(e) => onSettingChange(setSqmode, "sqmode", SQRT_DEF.sqmode)(e.target.value as SqrtMode)}>
                <option value="mixed">すべて</option>
                <option value="find">平方根を求める</option>
                <option value="simplify">根号の簡約化</option>
                <option value="mul-div">乗除</option>
                <option value="add-sub">加減</option>
                <option value="rationalize">有理化</option>
              </select>
            </label>
          </div>
        );
      case "expansion":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={exmode}
                onChange={(e) => onSettingChange(setExmode, "exmode", EXP_DEF.exmode)(e.target.value as ExpansionMode)}>
                <option value="mixed">すべて</option>
                <option value="distribute">分配法則</option>
                <option value="formula">乗法公式</option>
              </select>
            </label>
          </div>
        );
      case "factoring":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={fcmode}
                onChange={(e) => onSettingChange(setFcmode, "fcmode", FAC_DEF.fcmode)(e.target.value as FactoringMode)}>
                <option value="mixed">すべて</option>
                <option value="common">共通因数</option>
                <option value="formula">乗法公式の逆</option>
              </select>
            </label>
          </div>
        );
      case "quadratic-eq":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={qemode}
                onChange={(e) => onSettingChange(setQemode, "qemode", QUADEQ_DEF.qemode)(e.target.value as QuadEqMode)}>
                <option value="mixed">すべて</option>
                <option value="factoring">因数分解</option>
                <option value="formula">解の公式</option>
              </select>
            </label>
          </div>
        );
      case "similarity":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={smmode}
                onChange={(e) => onSettingChange(setSmmode, "smmode", SIM_DEF.smmode)(e.target.value as SimilarityMode)}>
                <option value="mixed">すべて</option>
                <option value="ratio">相似比</option>
                <option value="parallel-line">平行線と比</option>
                <option value="midpoint">中点連結定理</option>
              </select>
            </label>
          </div>
        );
      case "circle-angle":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={camode}
                onChange={(e) => onSettingChange(setCamode, "camode", CIRCLE_DEF.camode)(e.target.value as CircleAngleMode)}>
                <option value="mixed">すべて</option>
                <option value="basic">基本</option>
                <option value="inscribed">内接図形</option>
              </select>
            </label>
          </div>
        );
      case "pythagorean":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={ptmode}
                onChange={(e) => onSettingChange(setPtmode, "ptmode", PYTH_DEF.ptmode)(e.target.value as PythagoreanMode)}>
                <option value="mixed">すべて</option>
                <option value="basic">基本</option>
                <option value="special">特殊な直角三角形</option>
                <option value="applied">応用</option>
              </select>
            </label>
          </div>
        );
      case "quadratic-func":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={qfmode}
                onChange={(e) => onSettingChange(setQfmode, "qfmode", QUADF_DEF.qfmode)(e.target.value as QuadFuncMode)}>
                <option value="mixed">すべて</option>
                <option value="value">値を求める</option>
                <option value="rate-of-change">変化の割合</option>
                <option value="graph">グラフ</option>
              </select>
            </label>
          </div>
        );
      case "sampling":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={spmode}
                onChange={(e) => onSettingChange(setSpmode, "spmode", SAMP_DEF.spmode)(e.target.value as SamplingMode)}>
                <option value="mixed">すべて</option>
                <option value="concept">概念問題</option>
                <option value="estimation">推定</option>
              </select>
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  /* ---- render circle angle SVG ---- */

  const renderCircleAngleFigure = (p: CircleAngleProblem) => {
    const W = 200;
    const H = 180;
    const cx = W / 2;
    const cy = H / 2;
    const r = 65;
    const toRad = (d: number) => (d * Math.PI) / 180;

    if (p.figure.type === "central-inscribed") {
      // Points A and B on circle (arc at top)
      const aAngle = -70; // degrees from right
      const bAngle = -110;
      const ax = cx + r * Math.cos(toRad(aAngle));
      const ay = cy + r * Math.sin(toRad(aAngle));
      const bx = cx + r * Math.cos(toRad(bAngle));
      const by = cy + r * Math.sin(toRad(bAngle));
      // Point P on major arc (bottom)
      const pAngle = 90;
      const px = cx + r * Math.cos(toRad(pAngle));
      const py = cy + r * Math.sin(toRad(pAngle));

      const centralLabel = p.figure.findTarget === "central"
        ? "?" : `${p.figure.centralAngle}°`;
      const inscribedLabel = p.figure.findTarget === "inscribed"
        ? "?" : `${p.figure.inscribedAngle}°`;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#333" strokeWidth={1.5} />
          <circle cx={cx} cy={cy} r={2} fill="#333" />
          <text x={cx + 6} y={cy - 4} fontSize={8} fill="#666">O</text>
          {/* OA and OB (central angle) */}
          <line x1={cx} y1={cy} x2={ax} y2={ay} stroke="#1976d2" strokeWidth={1.2} />
          <line x1={cx} y1={cy} x2={bx} y2={by} stroke="#1976d2" strokeWidth={1.2} />
          {/* PA and PB (inscribed angle) */}
          <line x1={px} y1={py} x2={ax} y2={ay} stroke="#d32f2f" strokeWidth={1} strokeDasharray="4 3" />
          <line x1={px} y1={py} x2={bx} y2={by} stroke="#d32f2f" strokeWidth={1} strokeDasharray="4 3" />
          {/* Point labels */}
          <circle cx={ax} cy={ay} r={2.5} fill="#333" />
          <text x={ax + 6} y={ay - 4} fontSize={9} fill="#333">A</text>
          <circle cx={bx} cy={by} r={2.5} fill="#333" />
          <text x={bx - 14} y={by - 4} fontSize={9} fill="#333">B</text>
          <circle cx={px} cy={py} r={2.5} fill="#333" />
          <text x={px + 6} y={py + 4} fontSize={9} fill="#333">P</text>
          {/* Central angle label */}
          <text x={cx} y={cy - 14} textAnchor="middle" fontSize={9}
            fill={p.figure.findTarget === "central" ? "#d32f2f" : "#1976d2"} fontWeight="bold">
            {centralLabel}
          </text>
          {/* Inscribed angle label */}
          <text x={px} y={py - 10} textAnchor="middle" fontSize={9}
            fill={p.figure.findTarget === "inscribed" ? "#d32f2f" : "#1976d2"} fontWeight="bold">
            {inscribedLabel}
          </text>
        </svg>
      );
    }

    if (p.figure.type === "semicircle") {
      // Diameter BC horizontal, point A on top
      const bx = cx - r;
      const by = cy;
      const ccx = cx + r;
      const ccy = cy;
      // Point A on semicircle top
      const aAngle = p.figure.otherAngle ? -(90 - p.figure.otherAngle) : -45;
      const aax = cx + r * Math.cos(toRad(aAngle));
      const aay = cy + r * Math.sin(toRad(aAngle));

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#333" strokeWidth={1.5} />
          {/* Diameter */}
          <line x1={bx} y1={by} x2={ccx} y2={ccy} stroke="#333" strokeWidth={1.5} />
          <circle cx={cx} cy={cy} r={2} fill="#333" />
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize={8} fill="#666">O</text>
          {/* Triangle */}
          <line x1={bx} y1={by} x2={aax} y2={aay} stroke="#1976d2" strokeWidth={1.2} />
          <line x1={ccx} y1={ccy} x2={aax} y2={aay} stroke="#1976d2" strokeWidth={1.2} />
          {/* Right angle at A */}
          <rect x={aax - 3} y={aay - 3} width={6} height={6}
            fill="none" stroke="#d32f2f" strokeWidth={0.8}
            transform={`rotate(${aAngle + 45}, ${aax}, ${aay})`} />
          {/* Labels */}
          <circle cx={bx} cy={by} r={2.5} fill="#333" />
          <text x={bx - 10} y={by + 4} fontSize={9} fill="#333">B</text>
          <circle cx={ccx} cy={ccy} r={2.5} fill="#333" />
          <text x={ccx + 6} y={ccy + 4} fontSize={9} fill="#333">C</text>
          <circle cx={aax} cy={aay} r={2.5} fill="#333" />
          <text x={aax} y={aay - 10} textAnchor="middle" fontSize={9} fill="#333">A</text>
          <text x={aax + 10} y={aay + 4} fontSize={9} fill="#d32f2f" fontWeight="bold">90°</text>
          {p.figure.otherAngle && (
            <text x={bx + 18} y={by - 6} fontSize={9} fill="#1976d2" fontWeight="bold">{p.figure.otherAngle}°</text>
          )}
        </svg>
      );
    }

    // Inscribed quadrilateral
    const pts = [0, 1, 2, 3].map((i) => {
      const angle = -90 + i * 90 + (i % 2 === 0 ? 15 : -15);
      return { x: cx + r * Math.cos(toRad(angle)), y: cy + r * Math.sin(toRad(angle)) };
    });
    const labels = ["A", "B", "C", "D"];
    const givenIdx = labels.indexOf(p.figure.givenVertex ?? "A");
    const oppositeIdx = (givenIdx + 2) % 4;

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#333" strokeWidth={1.5} />
        <polygon points={pts.map((pt) => `${pt.x},${pt.y}`).join(" ")}
          fill="#e3f2fd" stroke="#333" strokeWidth={1.2} />
        {pts.map((pt, i) => {
          const dx = pt.x - cx;
          const dy = pt.y - cy;
          const len = Math.sqrt(dx * dx + dy * dy);
          const lx = pt.x + (dx / len) * 14;
          const ly = pt.y + (dy / len) * 14;
          return (
            <g key={i}>
              <circle cx={pt.x} cy={pt.y} r={2} fill="#333" />
              <text x={lx} y={ly + 4} textAnchor="middle" fontSize={9} fill="#333">{labels[i]}</text>
              {i === givenIdx && (
                <text x={pt.x + (dx > 0 ? 8 : -8)} y={pt.y + (dy > 0 ? 16 : -6)}
                  textAnchor="middle" fontSize={9} fill="#1976d2" fontWeight="bold">{p.figure.givenAngle}°</text>
              )}
              {i === oppositeIdx && (
                <text x={pt.x + (dx > 0 ? 8 : -8)} y={pt.y + (dy > 0 ? 16 : -6)}
                  textAnchor="middle" fontSize={9} fill="#d32f2f" fontWeight="bold">?</text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  /* ---- render pythagorean SVG ---- */

  const renderPythagoreanFigure = (p: PythagoreanProblem) => {
    const fig = p.figure;

    if (fig.type === "basic") {
      const W = 180;
      const H = 140;
      const pad = 25;
      // Right triangle: right angle at B (bottom-left)
      const bx = pad;
      const by = H - pad;
      const cx2 = W - pad;
      const cy2 = H - pad;
      const ax2 = pad;
      const ay2 = pad + 10;

      const labelA = fig.unknownSide === "b" ? "?" : `${fig.b}`;
      const labelB = fig.unknownSide === "a" ? "?" : `${fig.a}`;
      const labelC = fig.unknownSide === "c" ? "?" : `${fig.c ?? "?"}`;
      const colorA = fig.unknownSide === "b" ? "#d32f2f" : "#1976d2";
      const colorB = fig.unknownSide === "a" ? "#d32f2f" : "#1976d2";
      const colorC = fig.unknownSide === "c" ? "#d32f2f" : "#1976d2";

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
          <polygon points={`${ax2},${ay2} ${bx},${by} ${cx2},${cy2}`}
            fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
          {/* Right angle at B */}
          <polyline points={`${bx + 10},${by} ${bx + 10},${by - 10} ${bx},${by - 10}`}
            fill="none" stroke="#333" strokeWidth={0.8} />
          {/* Side a (bottom: B→C) */}
          <text x={(bx + cx2) / 2} y={by + 14} textAnchor="middle" fontSize={9} fill={colorB} fontWeight="bold">{labelB}</text>
          {/* Side b (left: A→B) */}
          <text x={ax2 - 10} y={(ay2 + by) / 2} textAnchor="middle" fontSize={9} fill={colorA} fontWeight="bold">{labelA}</text>
          {/* Side c (hypotenuse: A→C) */}
          <text x={(ax2 + cx2) / 2 + 10} y={(ay2 + cy2) / 2 - 6} textAnchor="middle" fontSize={9} fill={colorC} fontWeight="bold">{labelC}</text>
        </svg>
      );
    }

    if (fig.type === "special-45") {
      const W = 160;
      const H = 140;
      const pad = 25;
      const bx = pad;
      const by = H - pad;
      const cx2 = W - pad;
      const cy2 = H - pad;
      const ax2 = pad;
      const ay2 = pad + 10;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
          <polygon points={`${ax2},${ay2} ${bx},${by} ${cx2},${cy2}`}
            fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
          <polyline points={`${bx + 10},${by} ${bx + 10},${by - 10} ${bx},${by - 10}`}
            fill="none" stroke="#333" strokeWidth={0.8} />
          <text x={ax2 + 14} y={ay2 + 12} fontSize={9} fill="#666">45°</text>
          <text x={cx2 - 20} y={cy2 - 6} fontSize={9} fill="#666">45°</text>
          <text x={(bx + cx2) / 2} y={by + 14} textAnchor="middle" fontSize={9} fill="#1976d2" fontWeight="bold">{fig.side}</text>
          <text x={ax2 - 10} y={(ay2 + by) / 2} textAnchor="middle" fontSize={9} fill="#1976d2" fontWeight="bold">{fig.side}</text>
          <text x={(ax2 + cx2) / 2 + 10} y={(ay2 + cy2) / 2 - 6} textAnchor="middle" fontSize={9}
            fill={fig.findHypotenuse ? "#d32f2f" : "#1976d2"} fontWeight="bold">
            {fig.findHypotenuse ? "?" : `${fig.side}√2`}
          </text>
        </svg>
      );
    }

    if (fig.type === "special-30-60") {
      const W = 180;
      const H = 150;
      const pad = 25;
      const bx = pad;
      const by = H - pad;
      const cx2 = W - pad;
      const cy2 = H - pad;
      const ax2 = pad;
      const ay2 = pad;
      const shortLabel = fig.findTarget === "short-leg" ? "?" : `${fig.shortSide}`;
      const longLabel = fig.findTarget === "long-leg" ? "?" : `${fig.shortSide}√3`;
      const hypLabel = fig.findTarget === "hypotenuse" ? "?" : `${(fig.shortSide ?? 0) * 2}`;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
          <polygon points={`${ax2},${ay2} ${bx},${by} ${cx2},${cy2}`}
            fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
          <polyline points={`${bx + 10},${by} ${bx + 10},${by - 10} ${bx},${by - 10}`}
            fill="none" stroke="#333" strokeWidth={0.8} />
          <text x={ax2 + 10} y={ay2 + 16} fontSize={9} fill="#666">60°</text>
          <text x={cx2 - 22} y={cy2 - 6} fontSize={9} fill="#666">30°</text>
          <text x={ax2 - 10} y={(ay2 + by) / 2} textAnchor="middle" fontSize={9}
            fill={fig.findTarget === "short-leg" ? "#d32f2f" : "#1976d2"} fontWeight="bold">{shortLabel}</text>
          <text x={(bx + cx2) / 2} y={by + 14} textAnchor="middle" fontSize={9}
            fill={fig.findTarget === "long-leg" ? "#d32f2f" : "#1976d2"} fontWeight="bold">{longLabel}</text>
          <text x={(ax2 + cx2) / 2 + 10} y={(ay2 + cy2) / 2 - 6} textAnchor="middle" fontSize={9}
            fill={fig.findTarget === "hypotenuse" ? "#d32f2f" : "#1976d2"} fontWeight="bold">{hypLabel}</text>
        </svg>
      );
    }

    if (fig.type === "equilateral-height") {
      const W = 180;
      const H = 160;
      const pad = 20;
      const baseW = W - pad * 2;
      const bx = pad;
      const by = H - pad;
      const cx2 = pad + baseW;
      const cy2 = H - pad;
      const mx = (bx + cx2) / 2;
      const ax2 = mx;
      const ay2 = by - baseW * 0.866;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
          <polygon points={`${ax2},${ay2} ${bx},${by} ${cx2},${cy2}`}
            fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
          {/* Height line */}
          <line x1={mx} y1={ay2} x2={mx} y2={by} stroke="#d32f2f" strokeWidth={1.2} strokeDasharray="4 3" />
          {/* Right angle at M */}
          <polyline points={`${mx + 8},${by} ${mx + 8},${by - 8} ${mx},${by - 8}`}
            fill="none" stroke="#333" strokeWidth={0.8} />
          {/* Labels */}
          <text x={bx - 4} y={by + 14} fontSize={9} fill="#333">B</text>
          <text x={cx2 + 4} y={cy2 + 14} fontSize={9} fill="#333">C</text>
          <text x={ax2} y={ay2 - 8} textAnchor="middle" fontSize={9} fill="#333">A</text>
          <text x={mx + 2} y={by + 14} textAnchor="middle" fontSize={9} fill="#333">M</text>
          <text x={(bx + ax2) / 2 - 12} y={(by + ay2) / 2} fontSize={9} fill="#1976d2" fontWeight="bold">{fig.side}</text>
          <text x={mx + 10} y={(ay2 + by) / 2} fontSize={9} fill="#d32f2f" fontWeight="bold">h=?</text>
          {/* Equal marks */}
          <line x1={(bx + ax2) / 2 - 2} y1={(by + ay2) / 2 + 4} x2={(bx + ax2) / 2 + 2} y2={(by + ay2) / 2 - 2}
            stroke="#333" strokeWidth={1} />
          <line x1={(cx2 + ax2) / 2 - 2} y1={(cy2 + ay2) / 2 + 4} x2={(cx2 + ax2) / 2 + 2} y2={(cy2 + ay2) / 2 - 2}
            stroke="#333" strokeWidth={1} />
        </svg>
      );
    }

    if (fig.type === "coordinate") {
      const W = 180;
      const H = 180;
      const pa = fig.pointA!;
      const pb = fig.pointB!;
      const allX = [pa.x, pb.x];
      const allY = [pa.y, pb.y];
      const minX = Math.min(...allX) - 1;
      const maxX = Math.max(...allX) + 1;
      const minY = Math.min(...allY) - 1;
      const maxY = Math.max(...allY) + 1;
      const rangeX = maxX - minX;
      const rangeY = maxY - minY;
      const pad2 = 30;
      const scale = Math.min((W - pad2 * 2) / rangeX, (H - pad2 * 2) / rangeY);
      const toSvgX = (x: number) => pad2 + (x - minX) * scale;
      const toSvgY = (y: number) => H - pad2 - (y - minY) * scale;
      const ox = toSvgX(0);
      const oy = toSvgY(0);

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
          {/* Axes */}
          <line x1={pad2 - 5} y1={oy} x2={W - pad2 + 5} y2={oy} stroke="#999" strokeWidth={0.8} />
          <line x1={ox} y1={H - pad2 + 5} x2={ox} y2={pad2 - 5} stroke="#999" strokeWidth={0.8} />
          {/* Distance line */}
          <line x1={toSvgX(pa.x)} y1={toSvgY(pa.y)} x2={toSvgX(pb.x)} y2={toSvgY(pb.y)}
            stroke="#d32f2f" strokeWidth={1.5} />
          {/* Dashed right triangle */}
          <line x1={toSvgX(pa.x)} y1={toSvgY(pa.y)} x2={toSvgX(pb.x)} y2={toSvgY(pa.y)}
            stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
          <line x1={toSvgX(pb.x)} y1={toSvgY(pa.y)} x2={toSvgX(pb.x)} y2={toSvgY(pb.y)}
            stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
          {/* Points */}
          <circle cx={toSvgX(pa.x)} cy={toSvgY(pa.y)} r={3} fill="#1976d2" />
          <text x={toSvgX(pa.x) - 8} y={toSvgY(pa.y) + 14} fontSize={8} fill="#1976d2">
            ({pa.x},{pa.y})
          </text>
          <circle cx={toSvgX(pb.x)} cy={toSvgY(pb.y)} r={3} fill="#1976d2" />
          <text x={toSvgX(pb.x) + 4} y={toSvgY(pb.y) - 6} fontSize={8} fill="#1976d2">
            ({pb.x},{pb.y})
          </text>
          <text x={(toSvgX(pa.x) + toSvgX(pb.x)) / 2 + 8} y={(toSvgY(pa.y) + toSvgY(pb.y)) / 2 - 4}
            fontSize={9} fill="#d32f2f" fontWeight="bold">?</text>
        </svg>
      );
    }

    // Cuboid
    const W = 200;
    const H = 160;
    const dims = fig.dims!;
    const cos30 = 0.866;
    const sin30 = 0.5;
    const sx = 0.8;
    const w = dims.a * 8;
    const h = dims.c * 8;
    const d = dims.b * 6;
    const ox = 30;
    const oy = H - 30;
    const pts2 = {
      A: { x: ox, y: oy },
      B: { x: ox + w, y: oy },
      C: { x: ox + w + d * cos30 * sx, y: oy - d * sin30 * sx },
      D: { x: ox + d * cos30 * sx, y: oy - d * sin30 * sx },
      E: { x: ox, y: oy - h },
      F: { x: ox + w, y: oy - h },
      G: { x: ox + w + d * cos30 * sx, y: oy - h - d * sin30 * sx },
      H: { x: ox + d * cos30 * sx, y: oy - h - d * sin30 * sx },
    };

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        {/* Back edges (dashed) */}
        <line x1={pts2.D.x} y1={pts2.D.y} x2={pts2.A.x} y2={pts2.A.y} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
        <line x1={pts2.D.x} y1={pts2.D.y} x2={pts2.C.x} y2={pts2.C.y} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
        <line x1={pts2.D.x} y1={pts2.D.y} x2={pts2.H.x} y2={pts2.H.y} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
        {/* Front face */}
        <polygon points={`${pts2.A.x},${pts2.A.y} ${pts2.B.x},${pts2.B.y} ${pts2.F.x},${pts2.F.y} ${pts2.E.x},${pts2.E.y}`}
          fill="white" stroke="#333" strokeWidth={1.2} />
        {/* Right face */}
        <polygon points={`${pts2.B.x},${pts2.B.y} ${pts2.C.x},${pts2.C.y} ${pts2.G.x},${pts2.G.y} ${pts2.F.x},${pts2.F.y}`}
          fill="#f5f5f5" stroke="#333" strokeWidth={1.2} />
        {/* Top face */}
        <polygon points={`${pts2.E.x},${pts2.E.y} ${pts2.F.x},${pts2.F.y} ${pts2.G.x},${pts2.G.y} ${pts2.H.x},${pts2.H.y}`}
          fill="#eeeeee" stroke="#333" strokeWidth={1.2} />
        {/* Space diagonal */}
        <line x1={pts2.A.x} y1={pts2.A.y} x2={pts2.G.x} y2={pts2.G.y}
          stroke="#d32f2f" strokeWidth={1.5} strokeDasharray="6 4" />
        {/* Labels */}
        <text x={(pts2.A.x + pts2.B.x) / 2} y={pts2.A.y + 14} textAnchor="middle" fontSize={9} fill="#1976d2" fontWeight="bold">{dims.a}</text>
        <text x={pts2.B.x + (pts2.C.x - pts2.B.x) / 2 + 6} y={(pts2.B.y + pts2.C.y) / 2 + 10} fontSize={9} fill="#1976d2" fontWeight="bold">{dims.b}</text>
        <text x={pts2.A.x - 12} y={(pts2.A.y + pts2.E.y) / 2} fontSize={9} fill="#1976d2" fontWeight="bold">{dims.c}</text>
        <text x={(pts2.A.x + pts2.G.x) / 2 + 8} y={(pts2.A.y + pts2.G.y) / 2} fontSize={9} fill="#d32f2f" fontWeight="bold">?</text>
      </svg>
    );
  };

  /* ---- render similarity SVG ---- */

  const renderSimilarityFigure = (p: SimilarityProblem) => {
    const fig = p.figure;

    if (fig.type === "similar-triangles") {
      const W = 260;
      const H = 130;
      const rA = fig.ratioA ?? 2;
      const rB = fig.ratioB ?? 3;
      const maxR = Math.max(rA, rB);
      const s1 = (rA / maxR) * 50;
      const s2 = (rB / maxR) * 50;
      // Small triangle
      const t1bx = 20;
      const t1by = H - 20;
      const t1cx = t1bx + s1 * 1.6;
      const t1cy = t1by;
      const t1ax = t1bx + s1 * 0.5;
      const t1ay = t1by - s1 * 1.2;
      // Large triangle
      const gap = 40;
      const t2bx = t1cx + gap;
      const t2by = H - 20;
      const t2cx = t2bx + s2 * 1.6;
      const t2cy = t2by;
      const t2ax = t2bx + s2 * 0.5;
      const t2ay = t2by - s2 * 1.2;

      const isFillArea = fig.findTarget === "area";

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
          <polygon points={`${t1ax},${t1ay} ${t1bx},${t1by} ${t1cx},${t1cy}`}
            fill={isFillArea ? "#bbdefb" : "#e3f2fd"} stroke="#333" strokeWidth={1.2} />
          <polygon points={`${t2ax},${t2ay} ${t2bx},${t2by} ${t2cx},${t2cy}`}
            fill={isFillArea ? "#e3f2fd" : "#e3f2fd"} stroke="#333" strokeWidth={1.2} />
          {/* Labels */}
          <text x={t1ax} y={t1ay - 4} textAnchor="middle" fontSize={8} fill="#333">A</text>
          <text x={t1bx - 4} y={t1by + 10} fontSize={8} fill="#333">B</text>
          <text x={t1cx + 4} y={t1cy + 10} fontSize={8} fill="#333">C</text>
          <text x={t2ax} y={t2ay - 4} textAnchor="middle" fontSize={8} fill="#333">D</text>
          <text x={t2bx - 4} y={t2by + 10} fontSize={8} fill="#333">E</text>
          <text x={t2cx + 4} y={t2cy + 10} fontSize={8} fill="#333">F</text>
          {/* Ratio label */}
          <text x={(t1cx + t2bx) / 2} y={20} textAnchor="middle" fontSize={9} fill="#666">
            {rA}:{rB}
          </text>
        </svg>
      );
    }

    if (fig.type === "parallel-line") {
      const W = 200;
      const H = 160;
      const pad = 15;
      // Triangle ABC
      const bx = pad;
      const by = H - pad;
      const cx2 = W - pad;
      const cy2 = H - pad;
      const ax2 = pad + 60;
      const ay2 = pad + 10;
      // D on AB, E on AC, ratio m:n
      const m = fig.m ?? 1;
      const n = fig.n ?? 2;
      const t = m / (m + n);
      const dx = ax2 + (bx - ax2) * t;
      const dy = ay2 + (by - ay2) * t;
      const ex = ax2 + (cx2 - ax2) * t;
      const ey = ay2 + (cy2 - ay2) * t;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
          <polygon points={`${ax2},${ay2} ${bx},${by} ${cx2},${cy2}`}
            fill="#e3f2fd" stroke="#333" strokeWidth={1.2} />
          {/* DE parallel to BC */}
          <line x1={dx} y1={dy} x2={ex} y2={ey} stroke="#1976d2" strokeWidth={1.5} />
          {/* Parallel marks */}
          <text x={(dx + ex) / 2} y={(dy + ey) / 2 - 5} textAnchor="middle" fontSize={7} fill="#1976d2">▸▸</text>
          <text x={(bx + cx2) / 2} y={(by + cy2) / 2 - 5} textAnchor="middle" fontSize={7} fill="#333">▸▸</text>
          {/* Labels */}
          <text x={ax2} y={ay2 - 6} textAnchor="middle" fontSize={9} fill="#333">A</text>
          <text x={bx - 6} y={by + 4} fontSize={9} fill="#333">B</text>
          <text x={cx2 + 4} y={cy2 + 4} fontSize={9} fill="#333">C</text>
          <text x={dx - 10} y={dy + 4} fontSize={9} fill="#333">D</text>
          <text x={ex + 6} y={ey + 4} fontSize={9} fill="#333">E</text>
          {/* Segment labels */}
          <text x={(ax2 + dx) / 2 - 14} y={(ay2 + dy) / 2} fontSize={8} fill="#1976d2" fontWeight="bold">{m}</text>
          <text x={(dx + bx) / 2 - 14} y={(dy + by) / 2} fontSize={8} fill="#1976d2" fontWeight="bold">{n}</text>
          <text x={(ax2 + ex) / 2 + 10} y={(ay2 + ey) / 2} fontSize={8} fill="#1976d2" fontWeight="bold">{fig.ae}</text>
          <text x={(ex + cx2) / 2 + 10} y={(ey + cy2) / 2} fontSize={8} fill="#d32f2f" fontWeight="bold">?</text>
        </svg>
      );
    }

    // Midpoint
    const W = 200;
    const H = 160;
    const pad = 15;
    const bx = pad;
    const by = H - pad;
    const cx2 = W - pad;
    const cy2 = H - pad;
    const ax2 = pad + 60;
    const ay2 = pad + 10;
    const mx = (ax2 + bx) / 2;
    const my = (ay2 + by) / 2;
    const nx = (ax2 + cx2) / 2;
    const ny = (ay2 + cy2) / 2;

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <polygon points={`${ax2},${ay2} ${bx},${by} ${cx2},${cy2}`}
          fill="#e3f2fd" stroke="#333" strokeWidth={1.2} />
        {/* MN line */}
        <line x1={mx} y1={my} x2={nx} y2={ny} stroke="#1976d2" strokeWidth={1.5} />
        {/* Midpoint dots */}
        <circle cx={mx} cy={my} r={3} fill="#1976d2" />
        <circle cx={nx} cy={ny} r={3} fill="#1976d2" />
        {/* Equal marks on AM, MB */}
        {[[ax2, ay2, mx, my], [mx, my, bx, by]].map(([x1, y1, x2, y2], i) => {
          const mmx = (x1 + x2) / 2;
          const mmy = (y1 + y2) / 2;
          const ddx = x2 - x1;
          const ddy = y2 - y1;
          const len = Math.sqrt(ddx * ddx + ddy * ddy);
          return <line key={`am${i}`} x1={mmx - ddy / len * 4} y1={mmy + ddx / len * 4}
            x2={mmx + ddy / len * 4} y2={mmy - ddx / len * 4} stroke="#333" strokeWidth={1} />;
        })}
        {/* Equal marks on AN, NC */}
        {[[ax2, ay2, nx, ny], [nx, ny, cx2, cy2]].map(([x1, y1, x2, y2], i) => {
          const mmx = (x1 + x2) / 2;
          const mmy = (y1 + y2) / 2;
          const ddx = x2 - x1;
          const ddy = y2 - y1;
          const len = Math.sqrt(ddx * ddx + ddy * ddy);
          return <line key={`an${i}`} x1={mmx - ddy / len * 4} y1={mmy + ddx / len * 4}
            x2={mmx + ddy / len * 4} y2={mmy - ddx / len * 4} stroke="#333" strokeWidth={1} />;
        })}
        {/* Labels */}
        <text x={ax2} y={ay2 - 6} textAnchor="middle" fontSize={9} fill="#333">A</text>
        <text x={bx - 6} y={by + 4} fontSize={9} fill="#333">B</text>
        <text x={cx2 + 4} y={cy2 + 4} fontSize={9} fill="#333">C</text>
        <text x={mx - 10} y={my + 4} fontSize={9} fill="#333">M</text>
        <text x={nx + 6} y={ny + 4} fontSize={9} fill="#333">N</text>
        {/* BC label */}
        <text x={(bx + cx2) / 2} y={by + 14} textAnchor="middle" fontSize={9} fill="#1976d2" fontWeight="bold">{fig.bc}</text>
        {/* MN label */}
        <text x={(mx + nx) / 2} y={(my + ny) / 2 - 6} textAnchor="middle" fontSize={9} fill="#d32f2f" fontWeight="bold">?</text>
      </svg>
    );
  };

  /* ---- render problems ---- */

  const renderExprProblems = (
    items: { expr: string; answerExpr: string }[],
  ) => (
    <div className="g1-page g1-cols-2">
      {items.map((p, i) => (
        <div key={i} className="g1-problem">
          <span className="g1-num">({i + 1})</span>
          <span className="g1-expr">
            <span className="g1-val">{p.expr}</span>
            <span className="g1-op">=</span>
            <span className={showAnswers ? "" : "g1-hidden"}>
              <span className="g1-val">{p.answerExpr}</span>
            </span>
          </span>
        </div>
      ))}
    </div>
  );

  const renderTextProblems = (
    items: { question: string; answerDisplay: string }[],
  ) => (
    <div className="dev-text-page">
      {items.map((p, i) => (
        <div key={i} className="dev-text-row">
          <span className="g1-num">({i + 1})</span>
          <span className="dev-text-q">{p.question}</span>
          <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
            {p.answerDisplay}
          </span>
        </div>
      ))}
    </div>
  );

  const renderProblems = () => {
    switch (op) {
      case "square-root":
        return (
          <div className="g1-page g1-cols-2">
            {sqrtProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  <span className="g1-val">{p.expr}</span>
                  <span className="g1-op">=</span>
                  <span className={showAnswers ? "" : "g1-hidden"}>
                    <span className="g1-val">{p.answerDisplay}</span>
                  </span>
                </span>
              </div>
            ))}
          </div>
        );

      case "expansion":
        return renderExprProblems(expProblems);

      case "factoring":
        return renderExprProblems(facProblems);

      case "quadratic-eq":
        return (
          <div className="g1-page g1-cols-2">
            {quadEqProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  <span className="g1-val">{p.equation}</span>
                </span>
                <span className={`g1-expr${showAnswers ? "" : " g1-hidden"}`} style={{ marginLeft: "1em" }}>
                  <span className="g1-val">{p.answerDisplay}</span>
                </span>
              </div>
            ))}
          </div>
        );

      case "similarity":
        return (
          <div className="dev-fig-page">
            {simProblems.map((p, i) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1})</div>
                {renderSimilarityFigure(p)}
                <div className="dev-text-q">{p.question}</div>
                <div className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                  {p.answerDisplay}
                </div>
              </div>
            ))}
          </div>
        );

      case "circle-angle":
        return (
          <div className="dev-fig-page">
            {circleProblems.map((p, i) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1})</div>
                {renderCircleAngleFigure(p)}
                <div className="dev-text-q">{p.question}</div>
                <div className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                  {p.answerDisplay}
                </div>
              </div>
            ))}
          </div>
        );

      case "pythagorean":
        return (
          <div className="dev-fig-page">
            {pythProblems.map((p, i) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1})</div>
                {renderPythagoreanFigure(p)}
                <div className="dev-text-q">{p.question}</div>
                <div className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                  {p.answerDisplay}
                </div>
              </div>
            ))}
          </div>
        );

      case "quadratic-func":
        return renderTextProblems(quadFuncProblems);

      case "sampling":
        return renderTextProblems(sampProblems);

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

export default Grade9;

export const devGrade9: ProblemGroup = {
  id: "dev9",
  label: "中3（開発中）",
  operators: [
    { operator: "square-root", label: "平方根", grades: [9] },
    { operator: "expansion", label: "式の展開", grades: [9] },
    { operator: "factoring", label: "因数分解", grades: [9] },
    { operator: "quadratic-eq", label: "二次方程式", grades: [9] },
    { operator: "similarity", label: "相似", grades: [9] },
    { operator: "circle-angle", label: "円周角", grades: [9] },
    { operator: "pythagorean", label: "三平方の定理", grades: [9] },
    { operator: "quadratic-func", label: "関数 y=ax²", grades: [9] },
    { operator: "sampling", label: "標本調査", grades: [9] },
  ],
  Component: Grade9,
};
