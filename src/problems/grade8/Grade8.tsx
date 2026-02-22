import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { randomSeed, seedToHex, hexToSeed } from "../random";
import type { ProblemGroup } from "../types";
import { Frac } from "../shared/Frac";
import {
  generatePolyAddSub,
  generateMonoMulDiv,
  generateSimEq,
  generatePolygonAngle,
  generateTriAngle,
  generateParallelAngle,
  generateParallelogram,
  generateLinearFunc,
  generateProbability,
} from "./generators";
import type {
  MonoMulDivMode,
  SimEqMode,
  PolygonAngleMode,
  PolygonAngleProblem,
  TriAngleMode,
  TriAngleProblem,
  ParallelAngleMode,
  ParallelAngleProblem,
  ParallelogramMode,
  ParallelogramProblem,
  LinearFuncMode,
  ProbabilityMode,
} from "./generators";

/* ================================================================
   Types
   ================================================================ */

type Grade8Op =
  | "poly-add-sub"
  | "mono-mul-div"
  | "simultaneous-eq"
  | "polygon-angle"
  | "triangle-angle"
  | "parallel-angle"
  | "parallelogram"
  | "linear-func"
  | "probability";

/* ================================================================
   URL state helpers
   ================================================================ */

const ALL_PARAMS = [
  "q", "answers", "mmmode", "seqmode", "pamode", "tamode",
  "plmode", "pgmode", "lfmode", "pbmode",
];

const cleanParams = (url: URL) => {
  for (const k of ALL_PARAMS) url.searchParams.delete(k);
};

/* ================================================================
   Defaults
   ================================================================ */

const MONO_DEF = { mmmode: "mixed" as MonoMulDivMode };
const SIMEQ_DEF = { seqmode: "mixed" as SimEqMode };
const POLYANGLE_DEF = { pamode: "mixed" as PolygonAngleMode };
const TRIANGLE_DEF = { tamode: "mixed" as TriAngleMode };
const PARALLEL_DEF = { plmode: "mixed" as ParallelAngleMode };
const PGRAM_DEF = { pgmode: "mixed" as ParallelogramMode };
const LINFUNC_DEF = { lfmode: "mixed" as LinearFuncMode };
const PROB_DEF = { pbmode: "mixed" as ProbabilityMode };

/* ================================================================
   Main component
   ================================================================ */

const Grade8 = ({ operator }: { operator: string }) => {
  const op = operator as Grade8Op;

  const getInitial = () => {
    const p = new URLSearchParams(window.location.search);
    const qHex = p.get("q");
    const seed = qHex ? hexToSeed(qHex) ?? randomSeed() : randomSeed();
    const showAnswers = p.get("answers") === "1";

    const mmmodeRaw = p.get("mmmode") ?? MONO_DEF.mmmode;
    const mmmode = (["mul", "div", "mixed"] as const).includes(mmmodeRaw as any)
      ? (mmmodeRaw as MonoMulDivMode) : MONO_DEF.mmmode;

    const seqmodeRaw = p.get("seqmode") ?? SIMEQ_DEF.seqmode;
    const seqmode = (["addition", "substitution", "mixed"] as const).includes(seqmodeRaw as any)
      ? (seqmodeRaw as SimEqMode) : SIMEQ_DEF.seqmode;

    const pamodeRaw = p.get("pamode") ?? POLYANGLE_DEF.pamode;
    const pamode = (["interior-sum", "regular", "exterior", "find-n", "mixed"] as const).includes(pamodeRaw as any)
      ? (pamodeRaw as PolygonAngleMode) : POLYANGLE_DEF.pamode;

    const tamodeRaw = p.get("tamode") ?? TRIANGLE_DEF.tamode;
    const tamode = (["interior", "exterior", "mixed"] as const).includes(tamodeRaw as any)
      ? (tamodeRaw as TriAngleMode) : TRIANGLE_DEF.tamode;

    const plmodeRaw = p.get("plmode") ?? PARALLEL_DEF.plmode;
    const plmode = (["vertical", "corresponding", "alternate", "mixed"] as const).includes(plmodeRaw as any)
      ? (plmodeRaw as ParallelAngleMode) : PARALLEL_DEF.plmode;

    const pgmodeRaw = p.get("pgmode") ?? PGRAM_DEF.pgmode;
    const pgmode = (["sides", "angles", "diagonals", "mixed"] as const).includes(pgmodeRaw as any)
      ? (pgmodeRaw as ParallelogramMode) : PGRAM_DEF.pgmode;

    const lfmodeRaw = p.get("lfmode") ?? LINFUNC_DEF.lfmode;
    const lfmode = (["slope-intercept", "two-points", "rate-of-change", "mixed"] as const).includes(lfmodeRaw as any)
      ? (lfmodeRaw as LinearFuncMode) : LINFUNC_DEF.lfmode;

    const pbmodeRaw = p.get("pbmode") ?? PROB_DEF.pbmode;
    const pbmode = (["basic", "two-dice", "mixed"] as const).includes(pbmodeRaw as any)
      ? (pbmodeRaw as ProbabilityMode) : PROB_DEF.pbmode;

    return { seed, showAnswers, mmmode, seqmode, pamode, tamode, plmode, pgmode, lfmode, pbmode };
  };

  const [initial] = useState(getInitial);
  const [seed, setSeed] = useState(initial.seed);
  const [showAnswers, setShowAnswers] = useState(initial.showAnswers);
  const [showSettings, setShowSettings] = useState(false);

  const [mmmode, setMmmode] = useState(initial.mmmode);
  const [seqmode, setSeqmode] = useState(initial.seqmode);
  const [pamode, setPamode] = useState(initial.pamode);
  const [tamode, setTamode] = useState(initial.tamode);
  const [plmode, setPlmode] = useState(initial.plmode);
  const [pgmode, setPgmode] = useState(initial.pgmode);
  const [lfmode, setLfmode] = useState(initial.lfmode);
  const [pbmode, setPbmode] = useState(initial.pbmode);

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
      case "mono-mul-div":
        if (mmmode !== MONO_DEF.mmmode) m.mmmode = mmmode;
        break;
      case "simultaneous-eq":
        if (seqmode !== SIMEQ_DEF.seqmode) m.seqmode = seqmode;
        break;
      case "polygon-angle":
        if (pamode !== POLYANGLE_DEF.pamode) m.pamode = pamode;
        break;
      case "triangle-angle":
        if (tamode !== TRIANGLE_DEF.tamode) m.tamode = tamode;
        break;
      case "parallel-angle":
        if (plmode !== PARALLEL_DEF.plmode) m.plmode = plmode;
        break;
      case "parallelogram":
        if (pgmode !== PGRAM_DEF.pgmode) m.pgmode = pgmode;
        break;
      case "linear-func":
        if (lfmode !== LINFUNC_DEF.lfmode) m.lfmode = lfmode;
        break;
      case "probability":
        if (pbmode !== PROB_DEF.pbmode) m.pbmode = pbmode;
        break;
      case "poly-add-sub":
        break;
    }
    return m;
  }, [op, mmmode, seqmode, pamode, tamode, plmode, pgmode, lfmode, pbmode]);

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

  const polyProblems = useMemo(
    () => op === "poly-add-sub" ? generatePolyAddSub(seed) : [],
    [op, seed],
  );
  const monoProblems = useMemo(
    () => op === "mono-mul-div" ? generateMonoMulDiv(seed, mmmode) : [],
    [op, seed, mmmode],
  );
  const simEqProblems = useMemo(
    () => op === "simultaneous-eq" ? generateSimEq(seed, seqmode) : [],
    [op, seed, seqmode],
  );
  const polyAngleProblems = useMemo(
    () => op === "polygon-angle" ? generatePolygonAngle(seed, pamode) : [],
    [op, seed, pamode],
  );
  const triAngleProblems = useMemo(
    () => op === "triangle-angle" ? generateTriAngle(seed, tamode) : [],
    [op, seed, tamode],
  );
  const parallelProblems = useMemo(
    () => op === "parallel-angle" ? generateParallelAngle(seed, plmode) : [],
    [op, seed, plmode],
  );
  const pgramProblems = useMemo(
    () => op === "parallelogram" ? generateParallelogram(seed, pgmode) : [],
    [op, seed, pgmode],
  );
  const linFuncProblems = useMemo(
    () => op === "linear-func" ? generateLinearFunc(seed, lfmode) : [],
    [op, seed, lfmode],
  );
  const probProblems = useMemo(
    () => op === "probability" ? generateProbability(seed, pbmode) : [],
    [op, seed, pbmode],
  );

  /* ---- settings panel ---- */

  const renderSettings = () => {
    switch (op) {
      case "poly-add-sub":
        return null;
      case "mono-mul-div":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={mmmode}
                onChange={(e) => onSettingChange(setMmmode, "mmmode", MONO_DEF.mmmode)(e.target.value as MonoMulDivMode)}>
                <option value="mixed">すべて</option>
                <option value="mul">乗法のみ</option>
                <option value="div">除法のみ</option>
              </select>
            </label>
          </div>
        );
      case "simultaneous-eq":
        return (
          <div className="no-print settings-panel">
            <label>
              解法{" "}
              <select className="operator-select" value={seqmode}
                onChange={(e) => onSettingChange(setSeqmode, "seqmode", SIMEQ_DEF.seqmode)(e.target.value as SimEqMode)}>
                <option value="mixed">すべて</option>
                <option value="addition">加減法</option>
                <option value="substitution">代入法</option>
              </select>
            </label>
          </div>
        );
      case "polygon-angle":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={pamode}
                onChange={(e) => onSettingChange(setPamode, "pamode", POLYANGLE_DEF.pamode)(e.target.value as PolygonAngleMode)}>
                <option value="mixed">すべて</option>
                <option value="interior-sum">内角の和</option>
                <option value="regular">正多角形の内角</option>
                <option value="exterior">外角の和</option>
                <option value="find-n">何角形？</option>
              </select>
            </label>
          </div>
        );
      case "triangle-angle":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={tamode}
                onChange={(e) => onSettingChange(setTamode, "tamode", TRIANGLE_DEF.tamode)(e.target.value as TriAngleMode)}>
                <option value="mixed">すべて</option>
                <option value="interior">内角</option>
                <option value="exterior">外角</option>
              </select>
            </label>
          </div>
        );
      case "parallel-angle":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={plmode}
                onChange={(e) => onSettingChange(setPlmode, "plmode", PARALLEL_DEF.plmode)(e.target.value as ParallelAngleMode)}>
                <option value="mixed">すべて</option>
                <option value="vertical">対頂角</option>
                <option value="corresponding">同位角</option>
                <option value="alternate">錯角</option>
              </select>
            </label>
          </div>
        );
      case "parallelogram":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={pgmode}
                onChange={(e) => onSettingChange(setPgmode, "pgmode", PGRAM_DEF.pgmode)(e.target.value as ParallelogramMode)}>
                <option value="mixed">すべて</option>
                <option value="sides">辺</option>
                <option value="angles">角度</option>
                <option value="diagonals">対角線</option>
              </select>
            </label>
          </div>
        );
      case "linear-func":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={lfmode}
                onChange={(e) => onSettingChange(setLfmode, "lfmode", LINFUNC_DEF.lfmode)(e.target.value as LinearFuncMode)}>
                <option value="mixed">すべて</option>
                <option value="slope-intercept">傾き・切片</option>
                <option value="two-points">2点から</option>
                <option value="rate-of-change">変化の割合</option>
              </select>
            </label>
          </div>
        );
      case "probability":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={pbmode}
                onChange={(e) => onSettingChange(setPbmode, "pbmode", PROB_DEF.pbmode)(e.target.value as ProbabilityMode)}>
                <option value="mixed">すべて</option>
                <option value="basic">基本</option>
                <option value="two-dice">2つのさいころ</option>
              </select>
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  /* ---- render triangle angle SVG ---- */

  const renderTriAngleFigure = (p: TriAngleProblem) => {
    const W = 200;
    const H = 140;
    const pad = 20;
    // Draw a triangle that roughly matches the angles
    const a1 = p.knownAngles[0];
    const a2 = p.knownAngles[1];
    const toRad = (d: number) => (d * Math.PI) / 180;
    const bx = W - pad;
    const by = H - pad;
    const ax = pad;
    const ay = H - pad;
    const baseLen = bx - ax;
    // Apex from angle at A (a1) using sin rule approximation
    const apexX = ax + baseLen * 0.4;
    const h = Math.min(H - pad * 2, baseLen * 0.6);
    const apexY = ay - h;

    const arcPath = (vx: number, vy: number, startDeg: number, endDeg: number, r: number) => {
      const s = { x: vx + r * Math.cos(toRad(startDeg)), y: vy - r * Math.sin(toRad(startDeg)) };
      const e = { x: vx + r * Math.cos(toRad(endDeg)), y: vy - r * Math.sin(toRad(endDeg)) };
      return `M ${s.x} ${s.y} A ${r} ${r} 0 0 0 ${e.x} ${e.y}`;
    };

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <polygon points={`${ax},${ay} ${bx},${by} ${apexX},${apexY}`}
          fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
        {/* Angle at A */}
        <path d={arcPath(ax, ay, 0, Math.atan2(ay - apexY, apexX - ax) * 180 / Math.PI, 18)}
          fill="none" stroke="#1976d2" strokeWidth={1.2} />
        <text x={ax + 25} y={ay - 8} fontSize={9} fill="#1976d2" fontWeight="bold">{a1}°</text>
        {/* Angle at B */}
        <path d={arcPath(bx, by, 180 - Math.atan2(by - apexY, bx - apexX) * 180 / Math.PI, 180, 18)}
          fill="none" stroke="#1976d2" strokeWidth={1.2} />
        <text x={bx - 30} y={by - 8} fontSize={9} fill="#1976d2" fontWeight="bold">{a2}°</text>
        {/* Unknown at apex */}
        <text x={apexX} y={apexY - 6} textAnchor="middle" fontSize={9} fill="#d32f2f" fontWeight="bold">?</text>
        {/* Vertex labels */}
        <text x={ax - 4} y={ay + 14} textAnchor="middle" fontSize={9} fill="#666">A</text>
        <text x={bx + 4} y={by + 14} textAnchor="middle" fontSize={9} fill="#666">B</text>
        <text x={apexX} y={apexY - 14} textAnchor="middle" fontSize={9} fill="#666">C</text>
        {/* Exterior angle extension if needed */}
        {p.type === "exterior" && (
          <>
            <line x1={bx} y1={by} x2={bx + 40} y2={by} stroke="#333" strokeWidth={1} />
            <path d={arcPath(bx, by, 0, Math.atan2(by - apexY, bx - apexX) * 180 / Math.PI, 22)}
              fill="none" stroke="#d32f2f" strokeWidth={1.5} strokeDasharray="3 2" />
          </>
        )}
      </svg>
    );
  };

  /* ---- render parallel angle SVG ---- */

  const renderParallelAngleFigure = (p: ParallelAngleProblem) => {
    const W = 200;
    const H = 150;
    const lineLen = 180;
    const lineY1 = 35;
    const lineY2 = 115;
    const transAngle = 65; // degrees from horizontal
    const toRad = (d: number) => (d * Math.PI) / 180;

    if (p.type === "vertical") {
      const cx = W / 2;
      const cy = H / 2;
      const len = 60;
      const ang = 50;
      const r1 = { x: cx + len * Math.cos(toRad(ang)), y: cy - len * Math.sin(toRad(ang)) };
      const r2 = { x: cx - len * Math.cos(toRad(ang)), y: cy + len * Math.sin(toRad(ang)) };
      const r3 = { x: cx + len * Math.cos(toRad(180 - ang)), y: cy - len * Math.sin(toRad(180 - ang)) };
      const r4 = { x: cx - len * Math.cos(toRad(180 - ang)), y: cy + len * Math.sin(toRad(180 - ang)) };
      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
          <line x1={r1.x} y1={r1.y} x2={r2.x} y2={r2.y} stroke="#333" strokeWidth={1.5} />
          <line x1={r3.x} y1={r3.y} x2={r4.x} y2={r4.y} stroke="#333" strokeWidth={1.5} />
          <circle cx={cx} cy={cy} r={2} fill="#333" />
          <text x={cx + 20} y={cy - 8} fontSize={10} fill="#1976d2" fontWeight="bold">∠a={p.givenAngle}°</text>
          <text x={cx - 45} y={cy + 16} fontSize={10} fill="#d32f2f" fontWeight="bold">∠b=?</text>
        </svg>
      );
    }

    // Parallel lines + transversal
    const ox = 10;
    // Intersection points
    const ix1 = ox + (H / 2 - lineY1) / Math.tan(toRad(transAngle)) + 30;
    const ix2 = ox + (H / 2 - lineY1 + (lineY2 - lineY1)) / Math.tan(toRad(transAngle)) + 30;
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        {/* Parallel lines */}
        <line x1={ox} y1={lineY1} x2={ox + lineLen} y2={lineY1} stroke="#333" strokeWidth={1.5} />
        <line x1={ox} y1={lineY2} x2={ox + lineLen} y2={lineY2} stroke="#333" strokeWidth={1.5} />
        {/* Parallel markers */}
        <text x={ox + lineLen - 20} y={lineY1 - 4} fontSize={8} fill="#333">▸</text>
        <text x={ox + lineLen - 20} y={lineY2 - 4} fontSize={8} fill="#333">▸</text>
        {/* Transversal */}
        <line x1={ix1 - 25} y1={lineY1 - 20} x2={ix2 + 25} y2={lineY2 + 20}
          stroke="#333" strokeWidth={1.2} />
        {/* Angle labels */}
        <text x={ix1 + 8} y={lineY1 + 14} fontSize={9} fill="#1976d2" fontWeight="bold">∠a={p.givenAngle}°</text>
        {p.type === "corresponding" ? (
          <text x={ix2 + 8} y={lineY2 + 14} fontSize={9} fill="#d32f2f" fontWeight="bold">∠b=?</text>
        ) : (
          <text x={ix2 - 50} y={lineY2 - 4} fontSize={9} fill="#d32f2f" fontWeight="bold">∠b=?</text>
        )}
      </svg>
    );
  };

  /* ---- render polygon angle SVG ---- */

  const renderPolygonAngleFigure = (p: PolygonAngleProblem) => {
    const W = 160;
    const H = 140;
    const cx = W / 2;
    const cy = H / 2 + 5;
    const r = 50;
    const n = p.n ?? 5;
    const offset = -Math.PI / 2 + Math.PI / n; // rotate so bottom is flat
    const pts = Array.from({ length: n }, (_, i) => {
      const angle = offset + (2 * Math.PI * i) / n;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
    const pointsStr = pts.map((p) => `${p.x},${p.y}`).join(" ");

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <polygon points={pointsStr} fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
        {p.type === "regular" && pts.map((pt, i) => {
          const next = pts[(i + 1) % n];
          const mx = (pt.x + next.x) / 2;
          const my = (pt.y + next.y) / 2;
          const dx = next.x - pt.x;
          const dy = next.y - pt.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const nx = -dy / len * 4;
          const ny = dx / len * 4;
          return <line key={i} x1={mx + nx - 3 * dy / len} y1={my + ny + 3 * dx / len}
            x2={mx + nx + 3 * dy / len} y2={my + ny - 3 * dx / len}
            stroke="#333" strokeWidth={0.8} />;
        })}
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
          {n}角形
        </text>
      </svg>
    );
  };

  /* ---- render parallelogram SVG ---- */

  const renderParallelogramFigure = (p: ParallelogramProblem) => {
    const W = 220;
    const H = 140;
    const slant = 25;
    const bw = 120;
    const bh = 60;
    const ox = 20;
    const oy = H - 25;
    // A=top-left, B=bottom-left, C=bottom-right, D=top-right
    const B = { x: ox, y: oy };
    const C = { x: ox + bw, y: oy };
    const D = { x: ox + bw + slant, y: oy - bh };
    const A = { x: ox + slant, y: oy - bh };
    const pts = `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`;

    const hasAngle = p.type === "angles";
    const hasDiag = p.type === "diagonals";

    // Diagonals intersection
    const O = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <polygon points={pts} fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
        {/* Parallel marks */}
        <text x={(A.x + D.x) / 2} y={(A.y + D.y) / 2 - 4} textAnchor="middle" fontSize={7} fill="#333">▸▸</text>
        <text x={(B.x + C.x) / 2} y={(B.y + C.y) / 2 + 10} textAnchor="middle" fontSize={7} fill="#333">▸▸</text>
        {/* Vertex labels */}
        <text x={A.x - 2} y={A.y - 6} textAnchor="middle" fontSize={9} fill="#333">A</text>
        <text x={B.x - 6} y={B.y + 4} textAnchor="end" fontSize={9} fill="#333">B</text>
        <text x={C.x + 6} y={C.y + 4} textAnchor="start" fontSize={9} fill="#333">C</text>
        <text x={D.x + 2} y={D.y - 6} textAnchor="middle" fontSize={9} fill="#333">D</text>
        {/* Diagonals */}
        {hasDiag && (
          <>
            <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke="#1976d2" strokeWidth={1} />
            <line x1={B.x} y1={B.y} x2={D.x} y2={D.y} stroke="#1976d2" strokeWidth={1} />
            <circle cx={O.x} cy={O.y} r={2.5} fill="#333" />
            <text x={O.x + 6} y={O.y - 4} fontSize={9} fill="#333">O</text>
          </>
        )}
        {/* Angle arc at A if angles type */}
        {hasAngle && (
          <text x={A.x + 14} y={A.y + 14} fontSize={9} fill="#1976d2" fontWeight="bold">
            ∠A
          </text>
        )}
      </svg>
    );
  };

  /* ---- render problems ---- */

  const renderProblems = () => {
    switch (op) {
      case "poly-add-sub":
        return (
          <div className="g1-page g1-cols-2">
            {polyProblems.map((p, i) => (
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

      case "mono-mul-div":
        return (
          <div className="g1-page g1-cols-2">
            {monoProblems.map((p, i) => (
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

      case "simultaneous-eq":
        return (
          <div className="dev-text-page">
            {simEqProblems.map((p, i) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1})</div>
                <div className="dev-text-q" style={{ display: "flex", flexDirection: "column", gap: "0.2em" }}>
                  <span>{p.eq1}</span>
                  <span>{p.eq2}</span>
                </div>
                <div className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                  x = {p.answerX}, y = {p.answerY}
                </div>
              </div>
            ))}
          </div>
        );

      case "polygon-angle":
        return (
          <div className="dev-fig-page">
            {polyAngleProblems.map((p, i) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1})</div>
                {renderPolygonAngleFigure(p)}
                <div className="dev-text-q">{p.question}</div>
                <div className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                  {p.answerDisplay}
                </div>
              </div>
            ))}
          </div>
        );

      case "triangle-angle":
        return (
          <div className="dev-fig-page">
            {triAngleProblems.map((p, i) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1})</div>
                {renderTriAngleFigure(p)}
                <div className="dev-text-q">{p.question}</div>
                <div className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                  {p.answerDisplay}
                </div>
              </div>
            ))}
          </div>
        );

      case "parallel-angle":
        return (
          <div className="dev-fig-page">
            {parallelProblems.map((p, i) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1})</div>
                {renderParallelAngleFigure(p)}
                <div className="dev-text-q">{p.question}</div>
                <div className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                  {p.answerDisplay}
                </div>
              </div>
            ))}
          </div>
        );

      case "parallelogram":
        return (
          <div className="dev-fig-page">
            {pgramProblems.map((p, i) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1})</div>
                {renderParallelogramFigure(p)}
                <div className="dev-text-q">{p.question}</div>
                <div className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                  {p.answerDisplay}
                </div>
              </div>
            ))}
          </div>
        );

      case "linear-func":
        return (
          <div className="dev-text-page">
            {linFuncProblems.map((p, i) => (
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

      case "probability":
        return (
          <div className="dev-text-page">
            {probProblems.map((p, i) => (
              <div key={i} className="dev-text-row">
                <span className="g1-num">({i + 1})</span>
                <span className="dev-text-q">{p.question}</span>
                <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`} style={{ alignItems: "center" }}>
                  {p.ansDen === 1 ? (
                    p.ansNum
                  ) : (
                    <Frac num={p.ansNum} den={p.ansDen} />
                  )}
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
};

export default Grade8;

export const devGrade8: ProblemGroup = {
  id: "dev8",
  label: "中2（開発中）",
  operators: [
    { operator: "poly-add-sub", label: "多項式の加減", grades: [8] },
    { operator: "mono-mul-div", label: "単項式の乗除", grades: [8] },
    { operator: "simultaneous-eq", label: "連立方程式", grades: [8] },
    { operator: "polygon-angle", label: "多角形の角", grades: [8] },
    { operator: "triangle-angle", label: "三角形の角度", grades: [8] },
    { operator: "parallel-angle", label: "平行線と角", grades: [8] },
    { operator: "parallelogram", label: "平行四辺形", grades: [8] },
    { operator: "linear-func", label: "一次関数", grades: [8] },
    { operator: "probability", label: "確率", grades: [8] },
  ],
  Component: Grade8,
};
