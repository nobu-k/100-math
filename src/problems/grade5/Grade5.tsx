import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { randomSeed, seedToHex, hexToSeed } from "../random";
import type { ProblemGroup } from "../types";
import {
  generatePercent,
  generateSpeed,
  generateAreaFormula,
  generateFracDecimal,
  generateAverage,
  generateDiffFrac,
  generateVolume,
  generateCircumference,
  generateEvenOdd,
  generateFracCompare,
  generateUnitAmount,
  generateDecimalShift,
  generatePatternEq,
} from "./generators";
import type { TextProblem, AreaFormulaProblem, CircumferenceProblem, VolumeProblem } from "./generators";
import { Box } from "../shared/Box";
import { Frac } from "../shared/Frac";

/* ================================================================
   Types
   ================================================================ */

type Grade5Op =
  | "percent"
  | "speed"
  | "area-formula"
  | "frac-decimal"
  | "average"
  | "diff-frac"
  | "volume"
  | "circumference"
  | "even-odd"
  | "frac-compare"
  | "unit-amount"
  | "decimal-shift"
  | "pattern-eq";

/* ================================================================
   Main component
   ================================================================ */

const Grade5 = ({ operator }: { operator: string }) => {
  const op = operator as Grade5Op;

  const getInitial = () => {
    const p = new URLSearchParams(window.location.search);
    const qHex = p.get("q");
    const seed = qHex ? hexToSeed(qHex) ?? randomSeed() : randomSeed();
    const showAnswers = p.get("answers") === "1";

    const pfindRaw = p.get("pfind") ?? PCT_DEF.pfind;
    const pfind: "ratio" | "compared" | "base" | "mixed" =
      (["ratio", "compared", "base", "mixed"] as const).includes(pfindRaw as any)
        ? (pfindRaw as any) : PCT_DEF.pfind;

    const sfindRaw = p.get("sfind") ?? SPD_DEF.sfind;
    const sfind: "speed" | "time" | "distance" | "mixed" =
      (["speed", "time", "distance", "mixed"] as const).includes(sfindRaw as any)
        ? (sfindRaw as any) : SPD_DEF.sfind;

    const ashapeRaw = p.get("ashape") ?? AREA_DEF.ashape;
    const ashape: "triangle" | "parallelogram" | "trapezoid" | "mixed" =
      (["triangle", "parallelogram", "trapezoid", "mixed"] as const).includes(ashapeRaw as any)
        ? (ashapeRaw as any) : AREA_DEF.ashape;

    const fdirRaw = p.get("fdir") ?? FRAC_DEF.fdir;
    const fdir: "to-decimal" | "to-fraction" | "mixed" =
      (["to-decimal", "to-fraction", "mixed"] as const).includes(fdirRaw as any)
        ? (fdirRaw as any) : FRAC_DEF.fdir;

    const acnt = Math.max(3, Math.min(6,
      parseInt(p.get("acnt") ?? String(AVG_DEF.acnt), 10) || AVG_DEF.acnt));

    const dfopRaw = p.get("dfop") ?? DFRAC_DEF.dfop;
    const dfop: "add" | "sub" | "mixed" =
      (["add", "sub", "mixed"] as const).includes(dfopRaw as any)
        ? (dfopRaw as any) : DFRAC_DEF.dfop;

    const vshapeRaw = p.get("vshape") ?? VOL_DEF.vshape;
    const vshape: "cube" | "rect" | "mixed" =
      (["cube", "rect", "mixed"] as const).includes(vshapeRaw as any)
        ? (vshapeRaw as any) : VOL_DEF.vshape;

    const cmodeRaw = p.get("cmode") ?? CIRC_DEF.cmode;
    const cmode: "forward" | "reverse" | "mixed" =
      (["forward", "reverse", "mixed"] as const).includes(cmodeRaw as any)
        ? (cmodeRaw as any) : CIRC_DEF.cmode;

    const eorange = Math.max(100, Math.min(10000,
      parseInt(p.get("eorange") ?? String(EO_DEF.eorange), 10) || EO_DEF.eorange));

    return { seed, showAnswers, pfind, sfind, ashape, fdir, acnt, dfop, vshape, cmode, eorange };
  };

  const [initial] = useState(getInitial);
  const [seed, setSeed] = useState(initial.seed);
  const [showAnswers, setShowAnswers] = useState(initial.showAnswers);
  const [showSettings, setShowSettings] = useState(false);

  const [pfind, setPfind] = useState(initial.pfind);
  const [sfind, setSfind] = useState(initial.sfind);
  const [ashape, setAshape] = useState(initial.ashape);
  const [fdir, setFdir] = useState(initial.fdir);
  const [acnt, setAcnt] = useState(initial.acnt);
  const [dfop, setDfop] = useState(initial.dfop);
  const [vshape, setVshape] = useState(initial.vshape);
  const [cmode, setCmode] = useState(initial.cmode);
  const [eorange, setEorange] = useState(initial.eorange);

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
      case "percent":
        if (pfind !== PCT_DEF.pfind) m.pfind = pfind;
        break;
      case "speed":
        if (sfind !== SPD_DEF.sfind) m.sfind = sfind;
        break;
      case "area-formula":
        if (ashape !== AREA_DEF.ashape) m.ashape = ashape;
        break;
      case "frac-decimal":
        if (fdir !== FRAC_DEF.fdir) m.fdir = fdir;
        break;
      case "average":
        if (acnt !== AVG_DEF.acnt) m.acnt = String(acnt);
        break;
      case "diff-frac":
        if (dfop !== DFRAC_DEF.dfop) m.dfop = dfop;
        break;
      case "volume":
        if (vshape !== VOL_DEF.vshape) m.vshape = vshape;
        break;
      case "circumference":
        if (cmode !== CIRC_DEF.cmode) m.cmode = cmode;
        break;
      case "even-odd":
        if (eorange !== EO_DEF.eorange) m.eorange = String(eorange);
        break;
      case "frac-compare":
      case "unit-amount":
      case "decimal-shift":
      case "pattern-eq":
        break;
    }
    return m;
  }, [op, pfind, sfind, ashape, fdir, acnt, dfop, vshape, cmode, eorange]);

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

  const onPfindChange = useCallback((v: typeof pfind) => {
    setPfind(v);
    const p: Record<string, string> = {};
    if (v !== PCT_DEF.pfind) p.pfind = v;
    regen(p);
  }, [regen]);

  const onSfindChange = useCallback((v: typeof sfind) => {
    setSfind(v);
    const p: Record<string, string> = {};
    if (v !== SPD_DEF.sfind) p.sfind = v;
    regen(p);
  }, [regen]);

  const onAshapeChange = useCallback((v: typeof ashape) => {
    setAshape(v);
    const p: Record<string, string> = {};
    if (v !== AREA_DEF.ashape) p.ashape = v;
    regen(p);
  }, [regen]);

  const onFdirChange = useCallback((v: typeof fdir) => {
    setFdir(v);
    const p: Record<string, string> = {};
    if (v !== FRAC_DEF.fdir) p.fdir = v;
    regen(p);
  }, [regen]);

  const onAcntChange = useCallback((v: number) => {
    setAcnt(v);
    const p: Record<string, string> = {};
    if (v !== AVG_DEF.acnt) p.acnt = String(v);
    regen(p);
  }, [regen]);

  const onDfopChange = useCallback((v: typeof dfop) => {
    setDfop(v);
    const p: Record<string, string> = {};
    if (v !== DFRAC_DEF.dfop) p.dfop = v;
    regen(p);
  }, [regen]);

  const onVshapeChange = useCallback((v: typeof vshape) => {
    setVshape(v);
    const p: Record<string, string> = {};
    if (v !== VOL_DEF.vshape) p.vshape = v;
    regen(p);
  }, [regen]);

  const onCmodeChange = useCallback((v: typeof cmode) => {
    setCmode(v);
    const p: Record<string, string> = {};
    if (v !== CIRC_DEF.cmode) p.cmode = v;
    regen(p);
  }, [regen]);

  const onEorangeChange = useCallback((v: number) => {
    setEorange(v);
    const p: Record<string, string> = {};
    if (v !== EO_DEF.eorange) p.eorange = String(v);
    regen(p);
  }, [regen]);

  /* ---- generate problems ---- */

  const pctProblems = useMemo(
    () => op === "percent" ? generatePercent(seed, pfind) : [],
    [op, seed, pfind],
  );
  const spdProblems = useMemo(
    () => op === "speed" ? generateSpeed(seed, sfind) : [],
    [op, seed, sfind],
  );
  const areaProblems = useMemo(
    () => op === "area-formula" ? generateAreaFormula(seed, ashape) : [],
    [op, seed, ashape],
  );
  const fracProblems = useMemo(
    () => op === "frac-decimal" ? generateFracDecimal(seed, fdir) : [],
    [op, seed, fdir],
  );
  const avgProblems = useMemo(
    () => op === "average" ? generateAverage(seed, acnt) : [],
    [op, seed, acnt],
  );
  const diffFracProblems = useMemo(
    () => op === "diff-frac" ? generateDiffFrac(seed, dfop) : [],
    [op, seed, dfop],
  );
  const volProblems = useMemo(
    () => op === "volume" ? generateVolume(seed, vshape) : [],
    [op, seed, vshape],
  );
  const circProblems = useMemo(
    () => op === "circumference" ? generateCircumference(seed, cmode) : [],
    [op, seed, cmode],
  );
  const eoProblems = useMemo(
    () => op === "even-odd" ? generateEvenOdd(seed, eorange) : [],
    [op, seed, eorange],
  );
  const fcProblems = useMemo(
    () => op === "frac-compare" ? generateFracCompare(seed) : [],
    [op, seed],
  );
  const uaProblems = useMemo(
    () => op === "unit-amount" ? generateUnitAmount(seed) : [],
    [op, seed],
  );
  const dsProblems = useMemo(
    () => op === "decimal-shift" ? generateDecimalShift(seed) : [],
    [op, seed],
  );
  const peProblems = useMemo(
    () => op === "pattern-eq" ? generatePatternEq(seed) : [],
    [op, seed],
  );

  /* ---- settings panel ---- */

  const renderSettings = () => {
    switch (op) {
      case "percent":
        return (
          <div className="no-print settings-panel">
            <label>
              求めるもの{" "}
              <select className="operator-select" value={pfind}
                onChange={(e) => onPfindChange(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="ratio">割合（何%？）</option>
                <option value="compared">比べる量</option>
                <option value="base">もとにする量</option>
              </select>
            </label>
          </div>
        );
      case "speed":
        return (
          <div className="no-print settings-panel">
            <label>
              求めるもの{" "}
              <select className="operator-select" value={sfind}
                onChange={(e) => onSfindChange(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="distance">距離</option>
                <option value="time">時間</option>
                <option value="speed">速さ</option>
              </select>
            </label>
          </div>
        );
      case "area-formula":
        return (
          <div className="no-print settings-panel">
            <label>
              図形{" "}
              <select className="operator-select" value={ashape}
                onChange={(e) => onAshapeChange(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="triangle">三角形</option>
                <option value="parallelogram">平行四辺形</option>
                <option value="trapezoid">台形</option>
              </select>
            </label>
          </div>
        );
      case "frac-decimal":
        return (
          <div className="no-print settings-panel">
            <label>
              変換方向{" "}
              <select className="operator-select" value={fdir}
                onChange={(e) => onFdirChange(e.target.value as any)}>
                <option value="mixed">両方</option>
                <option value="to-decimal">分数→小数</option>
                <option value="to-fraction">小数→分数</option>
              </select>
            </label>
          </div>
        );
      case "average":
        return (
          <div className="no-print settings-panel">
            <label>
              データの個数{" "}
              <select className="operator-select" value={acnt}
                onChange={(e) => onAcntChange(Number(e.target.value))}>
                <option value={3}>3個</option>
                <option value={4}>4個</option>
                <option value={5}>5個</option>
                <option value={6}>6個</option>
              </select>
            </label>
          </div>
        );
      case "diff-frac":
        return (
          <div className="no-print settings-panel">
            <label>
              演算{" "}
              <select className="operator-select" value={dfop}
                onChange={(e) => onDfopChange(e.target.value as any)}>
                <option value="mixed">たし算・ひき算</option>
                <option value="add">たし算のみ</option>
                <option value="sub">ひき算のみ</option>
              </select>
            </label>
          </div>
        );
      case "volume":
        return (
          <div className="no-print settings-panel">
            <label>
              形{" "}
              <select className="operator-select" value={vshape}
                onChange={(e) => onVshapeChange(e.target.value as any)}>
                <option value="mixed">立方体・直方体</option>
                <option value="cube">立方体のみ</option>
                <option value="rect">直方体のみ</option>
              </select>
            </label>
          </div>
        );
      case "circumference":
        return (
          <div className="no-print settings-panel">
            <label>
              問題の種類{" "}
              <select className="operator-select" value={cmode}
                onChange={(e) => onCmodeChange(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="forward">円周を求める</option>
                <option value="reverse">直径を求める</option>
              </select>
            </label>
          </div>
        );
      case "even-odd":
        return (
          <div className="no-print settings-panel">
            <label>
              数の範囲{" "}
              <select className="operator-select" value={eorange}
                onChange={(e) => onEorangeChange(Number(e.target.value))}>
                <option value={100}>1〜100</option>
                <option value={1000}>1〜1000</option>
                <option value={10000}>1〜10000</option>
              </select>
            </label>
          </div>
        );
      case "frac-compare":
      case "unit-amount":
      case "decimal-shift":
      case "pattern-eq":
        return null;
      default:
        return null;
    }
  };

  /* ---- render helpers ---- */

  /* ---- render area-formula SVG ---- */

  const renderAreaFormulaFigure = (p: AreaFormulaProblem) => {
    const W = 200;
    const H = 150;
    const { figure } = p;
    const pad = 30;
    const maxDim = Math.max(figure.base, figure.height, figure.upperBase ?? 0);
    const sc = Math.min((W - pad * 2) / (maxDim * 1.2), (H - pad * 2) / maxDim);
    const bw = Math.max(60, figure.base * sc);
    const fh = Math.max(40, figure.height * sc);

    if (figure.shape === "triangle") {
      const x0 = (W - bw) / 2;
      const y0 = H - pad;
      const apex = { x: x0 + bw * 0.4, y: y0 - fh };
      const pts = `${x0},${y0} ${x0 + bw},${y0} ${apex.x},${apex.y}`;
      const hx = apex.x;
      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
          <polygon points={pts} fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
          <line x1={hx} y1={y0} x2={hx} y2={apex.y} stroke="#333" strokeWidth={1} strokeDasharray="4 3" />
          <rect x={hx - 5} y={y0 - 5} width={5} height={5} fill="none" stroke="#333" strokeWidth={0.8} />
          <text x={x0 + bw / 2} y={y0 + 16} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
            底辺 = {figure.base}cm
          </text>
          <text x={hx + 10} y={y0 - fh / 2 + 4} textAnchor="start" fontSize={10} fill="#1976d2" fontWeight="bold">
            高さ = {figure.height}cm
          </text>
        </svg>
      );
    }

    if (figure.shape === "parallelogram") {
      const slant = fh * 0.35;
      const x0 = (W - bw - slant) / 2;
      const y0 = H - pad;
      const pts = `${x0},${y0} ${x0 + bw},${y0} ${x0 + bw + slant},${y0 - fh} ${x0 + slant},${y0 - fh}`;
      const hx = x0 + slant;
      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
          <polygon points={pts} fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
          <line x1={hx} y1={y0} x2={hx} y2={y0 - fh} stroke="#333" strokeWidth={1} strokeDasharray="4 3" />
          <rect x={hx - 5} y={y0 - 5} width={5} height={5} fill="none" stroke="#333" strokeWidth={0.8} />
          <text x={x0 + bw / 2} y={y0 + 16} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
            底辺 = {figure.base}cm
          </text>
          <text x={hx + 10} y={y0 - fh / 2 + 4} textAnchor="start" fontSize={10} fill="#1976d2" fontWeight="bold">
            高さ = {figure.height}cm
          </text>
        </svg>
      );
    }

    // trapezoid
    const uw = Math.max(30, (figure.upperBase ?? 0) * sc);
    const x0 = (W - bw) / 2;
    const y0 = H - pad;
    const topLeft = x0 + (bw - uw) * 0.3;
    const pts = `${x0},${y0} ${x0 + bw},${y0} ${topLeft + uw},${y0 - fh} ${topLeft},${y0 - fh}`;
    const hx = topLeft;
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <polygon points={pts} fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
        <line x1={hx} y1={y0} x2={hx} y2={y0 - fh} stroke="#333" strokeWidth={1} strokeDasharray="4 3" />
        <rect x={hx - 5} y={y0 - 5} width={5} height={5} fill="none" stroke="#333" strokeWidth={0.8} />
        <text x={x0 + bw / 2} y={y0 + 16} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
          下底 = {figure.base}cm
        </text>
        <text x={topLeft + uw / 2} y={y0 - fh - 8} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
          上底 = {figure.upperBase}cm
        </text>
        <text x={hx - 8} y={y0 - fh / 2 + 4} textAnchor="end" fontSize={10} fill="#1976d2" fontWeight="bold">
          高さ = {figure.height}cm
        </text>
      </svg>
    );
  };

  /* ---- render circumference SVG ---- */

  const renderCircumferenceFigure = (p: CircumferenceProblem) => {
    const W = 160;
    const H = 160;
    const cx = W / 2;
    const cy = H / 2;
    const cr = 50;
    const { figure } = p;
    const isForward = figure.mode === "forward";

    const diaColor = isForward ? "#1976d2" : "#d32f2f";
    const circColor = isForward ? "#d32f2f" : "#1976d2";
    const diaLabel = isForward ? `直径 = ${figure.diameter}cm` : "直径 = ?";
    const diaDash = isForward ? "none" : "4 3";

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        {/* Circle */}
        <circle cx={cx} cy={cy} r={cr} fill="none" stroke={circColor} strokeWidth={2} />
        {/* Center dot */}
        <circle cx={cx} cy={cy} r={2.5} fill="#333" />
        {/* Diameter line */}
        <line x1={cx - cr} y1={cy} x2={cx + cr} y2={cy}
          stroke={diaColor} strokeWidth={1.5} strokeDasharray={diaDash} />
        {/* Diameter end marks */}
        <line x1={cx - cr} y1={cy - 4} x2={cx - cr} y2={cy + 4} stroke={diaColor} strokeWidth={1.5} />
        <line x1={cx + cr} y1={cy - 4} x2={cx + cr} y2={cy + 4} stroke={diaColor} strokeWidth={1.5} />
        {/* Diameter label */}
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize={10} fill={diaColor} fontWeight="bold">
          {diaLabel}
        </text>
        {/* Circumference indicator */}
        <text x={cx} y={cy - cr - 8} textAnchor="middle" fontSize={10} fill={circColor} fontWeight="bold">
          {isForward ? "円周 = ?" : `円周 = ${Number((figure.diameter * 3.14).toFixed(2))}cm`}
        </text>
      </svg>
    );
  };

  /* ---- render volume SVG (isometric 3D) ---- */

  const renderVolumeFigure = (p: VolumeProblem) => {
    const W = 200;
    const H = 170;
    const { figure } = p;
    const maxDim = Math.max(figure.width, figure.height, figure.depth);
    const sc = Math.min(80 / maxDim, 12);
    const fw = Math.max(30, figure.width * sc);
    const fh = Math.max(30, figure.height * sc);
    const fd = Math.max(20, figure.depth * sc * 0.6);
    const cos30 = Math.cos(Math.PI / 6);
    const sin30 = Math.sin(Math.PI / 6);
    const dx = fd * cos30;
    const dy = fd * sin30;

    // Front-bottom-left corner
    const ox = 30;
    const oy = H - 25;

    // 8 corners: front face + back face
    const fbl = { x: ox, y: oy };
    const fbr = { x: ox + fw, y: oy };
    const ftr = { x: ox + fw, y: oy - fh };
    const ftl = { x: ox, y: oy - fh };
    const bbl = { x: ox + dx, y: oy - dy };
    const bbr = { x: ox + fw + dx, y: oy - dy };
    const btr = { x: ox + fw + dx, y: oy - fh - dy };
    const btl = { x: ox + dx, y: oy - fh - dy };

    const isCube = figure.shape === "cube";

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        {/* Hidden edges (dashed) */}
        <line x1={fbl.x} y1={fbl.y} x2={bbl.x} y2={bbl.y} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
        <line x1={bbl.x} y1={bbl.y} x2={bbr.x} y2={bbr.y} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
        <line x1={bbl.x} y1={bbl.y} x2={btl.x} y2={btl.y} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
        {/* Front face */}
        <polygon points={`${fbl.x},${fbl.y} ${fbr.x},${fbr.y} ${ftr.x},${ftr.y} ${ftl.x},${ftl.y}`}
          fill="#fff" stroke="#333" strokeWidth={1.5} />
        {/* Top face */}
        <polygon points={`${ftl.x},${ftl.y} ${ftr.x},${ftr.y} ${btr.x},${btr.y} ${btl.x},${btl.y}`}
          fill="#e8e8e8" stroke="#333" strokeWidth={1.5} />
        {/* Right face */}
        <polygon points={`${fbr.x},${fbr.y} ${bbr.x},${bbr.y} ${btr.x},${btr.y} ${ftr.x},${ftr.y}`}
          fill="#d0d0d0" stroke="#333" strokeWidth={1.5} />
        {/* Labels */}
        {isCube ? (
          <text x={ox + fw / 2} y={oy + 16} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
            一辺 = {figure.width}cm
          </text>
        ) : (
          <>
            <text x={ox + fw / 2} y={oy + 16} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
              よこ = {figure.width}cm
            </text>
            <text x={ox - 8} y={oy - fh / 2 + 4} textAnchor="end" fontSize={10} fill="#1976d2" fontWeight="bold">
              高さ = {figure.height}cm
            </text>
            <text x={ox + fw + dx / 2 + 8} y={oy - dy / 2 + 4} textAnchor="start" fontSize={10} fill="#1976d2" fontWeight="bold">
              たて = {figure.depth}cm
            </text>
          </>
        )}
      </svg>
    );
  };

  const renderTextProblems = (items: TextProblem[]) => (
    <div className="dev-text-page">
      {items.map((p, i) => (
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

  /* ---- render problems ---- */

  const renderProblems = () => {
    switch (op) {
      case "percent":
        return renderTextProblems(pctProblems);
      case "speed":
        return renderTextProblems(spdProblems);
      case "area-formula":
        return (
          <div className="dev-text-page">
            {areaProblems.map((p, i) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1})</div>
                {renderAreaFormulaFigure(p)}
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
      case "frac-decimal":
        return renderTextProblems(fracProblems);
      case "average":
        return renderTextProblems(avgProblems);

      case "diff-frac":
        return (
          <div className="g1-page g1-cols-2">
            {diffFracProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr" style={{ alignItems: "center" }}>
                  <Frac num={p.aNum} den={p.aDen} />
                  <span className="g1-op">{p.op}</span>
                  <Frac num={p.bNum} den={p.bDen} />
                  <span className="g1-op">=</span>
                  <span className={showAnswers ? "" : "g1-hidden"}>
                    {p.ansWhole !== undefined && p.ansPartNum !== undefined ? (
                      <>
                        <span className="dev-frac-ans">{p.ansWhole}</span>
                        <Frac num={p.ansPartNum} den={p.ansDen} cls="dev-frac-ans" />
                      </>
                    ) : p.ansNum % p.ansDen === 0 ? (
                      <span className="dev-frac-ans">{p.ansNum / p.ansDen}</span>
                    ) : (
                      <Frac num={p.ansNum} den={p.ansDen} cls="dev-frac-ans" />
                    )}
                  </span>
                </span>
              </div>
            ))}
          </div>
        );

      case "volume":
        return (
          <div className="dev-text-page">
            {volProblems.map((p, i) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1})</div>
                {renderVolumeFigure(p)}
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

      case "circumference":
        return (
          <div className="dev-text-page">
            {circProblems.map((p, i) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1})</div>
                {renderCircumferenceFigure(p)}
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

      case "even-odd":
        return (
          <div className="dev-text-page">
            {eoProblems.map((p, i) => (
              <div key={i} className="dev-text-row">
                <span className="g1-num">({i + 1})</span>
                <span className="dev-text-q">{p.numbers.join("、")}</span>
                <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                  偶数: {p.evenAnswers.join("、")} ／ 奇数: {p.oddAnswers.join("、")}
                </span>
              </div>
            ))}
          </div>
        );

      case "frac-compare":
        return (
          <div className="g1-page g1-cols-2">
            {fcProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr" style={{ alignItems: "center" }}>
                  <Frac num={p.aNum} den={p.aDen} />
                  <Box answer={p.answer} show={showAnswers} />
                  <Frac num={p.bNum} den={p.bDen} />
                </span>
              </div>
            ))}
          </div>
        );

      case "unit-amount":
        return renderTextProblems(uaProblems);

      case "decimal-shift":
        return renderTextProblems(dsProblems);

      case "pattern-eq":
        return renderTextProblems(peProblems);

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

export default Grade5;

export const devGrade5: ProblemGroup = {
  id: "dev5",
  label: "5年（開発中）",
  operators: [
    { operator: "percent", label: "割合と百分率", grades: [5] },
    { operator: "speed", label: "速さ・時間・距離", grades: [5] },
    { operator: "area-formula", label: "面積の公式", grades: [5] },
    { operator: "frac-decimal", label: "分数と小数", grades: [5] },
    { operator: "average", label: "平均", grades: [5] },
    { operator: "diff-frac", label: "異分母分数の加減", grades: [5] },
    { operator: "volume", label: "体積", grades: [5] },
    { operator: "circumference", label: "円周", grades: [5] },
    { operator: "even-odd", label: "偶数と奇数", grades: [5] },
    { operator: "frac-compare", label: "分数の大小比較", grades: [5] },
    { operator: "unit-amount", label: "単位量あたり", grades: [5] },
    { operator: "decimal-shift", label: "小数点の移動", grades: [5] },
    { operator: "pattern-eq", label: "きまりの式", grades: [5] },
  ],
  Component: Grade5,
};

/* ================================================================
   URL state helpers
   ================================================================ */

const cleanParams = (url: URL) => {
  for (const k of ALL_PARAMS) url.searchParams.delete(k);
};

const ALL_PARAMS = ["q", "answers", "pfind", "sfind", "ashape", "fdir", "acnt", "dfop", "vshape", "cmode", "eorange"];

/* ================================================================
   Defaults
   ================================================================ */

const PCT_DEF = { pfind: "mixed" as const };
const SPD_DEF = { sfind: "mixed" as const };
const AREA_DEF = { ashape: "mixed" as const };
const FRAC_DEF = { fdir: "mixed" as const };
const AVG_DEF = { acnt: 5 };
const DFRAC_DEF = { dfop: "mixed" as const };
const VOL_DEF = { vshape: "mixed" as const };
const CIRC_DEF = { cmode: "mixed" as const };
const EO_DEF = { eorange: 100 };
