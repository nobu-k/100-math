import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { randomSeed, seedToHex, hexToSeed } from "../random";
import type { ProblemGroup } from "../types";
import {
  generateMixedCalc,
  generateRounding,
  generateFracConv,
  generateArea,
  generateAngle,
  generateAreaUnit,
  generateEstimate,
  generateDecimalPlace,
  generateDivCheck,
  generateLargeNum4,
  generateCalcTrick,
  generatePatternTable,
  generateLineGraph,
  generateCrossTable,
} from "./generators";
import type { TextProblem, AreaProblem, AngleProblem } from "./generators";
import { Box } from "../shared/Box";
import { Frac } from "../shared/Frac";

/* ================================================================
   Types
   ================================================================ */

type Grade4Op =
  | "mixed-calc"
  | "rounding"
  | "frac-conv"
  | "area"
  | "angle"
  | "area-unit"
  | "estimate"
  | "decimal-place"
  | "div-check"
  | "large-num4"
  | "calc-trick"
  | "pattern-table"
  | "line-graph"
  | "cross-table";

/* ================================================================
   Main component
   ================================================================ */

const Grade4 = ({ operator }: { operator: string }) => {
  const op = operator as Grade4Op;

  const getInitial = () => {
    const p = new URLSearchParams(window.location.search);
    const qHex = p.get("q");
    const seed = qHex ? hexToSeed(qHex) ?? randomSeed() : randomSeed();
    const showAnswers = p.get("answers") === "1";

    const paren = p.get("paren") !== "0";
    const rd = Math.max(1, Math.min(4,
      parseInt(p.get("rd") ?? String(ROUND_DEF.rd), 10) || ROUND_DEF.rd));

    const fdirRaw = p.get("fdir") ?? FRAC_DEF.fdir;
    const fdir: "to-mixed" | "to-improper" | "both" =
      (["to-mixed", "to-improper", "both"] as const).includes(fdirRaw as any)
        ? (fdirRaw as any) : FRAC_DEF.fdir;

    const shapeRaw = p.get("shape") ?? AREA_DEF.shape;
    const shape: "square" | "rect" | "mixed" =
      (["square", "rect", "mixed"] as const).includes(shapeRaw as any)
        ? (shapeRaw as any) : AREA_DEF.shape;

    const aunitRaw = p.get("aunit") ?? AUNIT_DEF.aunit;
    const aunit: "cm-m" | "m-ha" | "mixed" =
      (["cm-m", "m-ha", "mixed"] as const).includes(aunitRaw as any)
        ? (aunitRaw as any) : AUNIT_DEF.aunit;

    const erto = Math.max(10, Math.min(100,
      parseInt(p.get("erto") ?? String(ERTO_DEF.erto), 10) || ERTO_DEF.erto));

    const dpmodeRaw = p.get("dpmode") ?? DPMODE_DEF.dpmode;
    const dpmode: "count" | "multiply" | "mixed" =
      (["count", "multiply", "mixed"] as const).includes(dpmodeRaw as any)
        ? (dpmodeRaw as any) : DPMODE_DEF.dpmode;

    const ln4modeRaw = p.get("ln4mode") ?? LN4MODE_DEF.ln4mode;
    const ln4mode: "read" | "position" | "mixed" =
      (["read", "position", "mixed"] as const).includes(ln4modeRaw as any)
        ? (ln4modeRaw as any) : LN4MODE_DEF.ln4mode;

    return { seed, showAnswers, paren, rd, fdir, shape, aunit, erto, dpmode, ln4mode };
  };

  const [initial] = useState(getInitial);
  const [seed, setSeed] = useState(initial.seed);
  const [showAnswers, setShowAnswers] = useState(initial.showAnswers);
  const [showSettings, setShowSettings] = useState(false);

  const [paren, setParen] = useState(initial.paren);
  const [rd, setRd] = useState(initial.rd);
  const [fdir, setFdir] = useState(initial.fdir);
  const [shape, setShape] = useState(initial.shape);
  const [aunit, setAunit] = useState(initial.aunit);
  const [erto, setErto] = useState(initial.erto);
  const [dpmode, setDpmode] = useState(initial.dpmode);
  const [ln4mode, setLn4mode] = useState(initial.ln4mode);

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
      case "mixed-calc":
        if (!paren) m.paren = "0";
        break;
      case "rounding":
        if (rd !== ROUND_DEF.rd) m.rd = String(rd);
        break;
      case "frac-conv":
        if (fdir !== FRAC_DEF.fdir) m.fdir = fdir;
        break;
      case "area":
        if (shape !== AREA_DEF.shape) m.shape = shape;
        break;
      case "angle":
        break;
      case "area-unit":
        if (aunit !== AUNIT_DEF.aunit) m.aunit = aunit;
        break;
      case "estimate":
        if (erto !== ERTO_DEF.erto) m.erto = String(erto);
        break;
      case "decimal-place":
        if (dpmode !== DPMODE_DEF.dpmode) m.dpmode = dpmode;
        break;
      case "div-check":
        break;
      case "large-num4":
        if (ln4mode !== LN4MODE_DEF.ln4mode) m.ln4mode = ln4mode;
        break;
      case "calc-trick":
        break;
      case "pattern-table":
        break;
      case "line-graph":
        break;
      case "cross-table":
        break;
    }
    return m;
  }, [op, paren, rd, fdir, shape, aunit, erto, dpmode, ln4mode]);

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

  const onParenChange = useCallback((v: boolean) => {
    setParen(v);
    const p: Record<string, string> = {};
    if (!v) p.paren = "0";
    regen(p);
  }, [regen]);

  const onRdChange = useCallback((v: number) => {
    setRd(v);
    const p: Record<string, string> = {};
    if (v !== ROUND_DEF.rd) p.rd = String(v);
    regen(p);
  }, [regen]);

  const onFdirChange = useCallback((v: "to-mixed" | "to-improper" | "both") => {
    setFdir(v);
    const p: Record<string, string> = {};
    if (v !== FRAC_DEF.fdir) p.fdir = v;
    regen(p);
  }, [regen]);

  const onShapeChange = useCallback((v: "square" | "rect" | "mixed") => {
    setShape(v);
    const p: Record<string, string> = {};
    if (v !== AREA_DEF.shape) p.shape = v;
    regen(p);
  }, [regen]);

  const onAunitChange = useCallback((v: "cm-m" | "m-ha" | "mixed") => {
    setAunit(v);
    const p: Record<string, string> = {};
    if (v !== AUNIT_DEF.aunit) p.aunit = v;
    regen(p);
  }, [regen]);

  const onErtoChange = useCallback((v: number) => {
    setErto(v);
    const p: Record<string, string> = {};
    if (v !== ERTO_DEF.erto) p.erto = String(v);
    regen(p);
  }, [regen]);

  const onDpmodeChange = useCallback((v: "count" | "multiply" | "mixed") => {
    setDpmode(v);
    const p: Record<string, string> = {};
    if (v !== DPMODE_DEF.dpmode) p.dpmode = v;
    regen(p);
  }, [regen]);

  const onLn4modeChange = useCallback((v: "read" | "position" | "mixed") => {
    setLn4mode(v);
    const p: Record<string, string> = {};
    if (v !== LN4MODE_DEF.ln4mode) p.ln4mode = v;
    regen(p);
  }, [regen]);

  /* ---- generate problems ---- */

  const mixedProblems = useMemo(
    () => op === "mixed-calc" ? generateMixedCalc(seed, paren) : [],
    [op, seed, paren],
  );
  const roundProblems = useMemo(
    () => op === "rounding" ? generateRounding(seed, rd) : [],
    [op, seed, rd],
  );
  const fracProblems = useMemo(
    () => op === "frac-conv" ? generateFracConv(seed, fdir) : [],
    [op, seed, fdir],
  );
  const areaProblems = useMemo(
    () => op === "area" ? generateArea(seed, shape) : [],
    [op, seed, shape],
  );
  const angleProblems = useMemo(
    () => op === "angle" ? generateAngle(seed) : [],
    [op, seed],
  );
  const areaUnitProblems = useMemo(
    () => op === "area-unit" ? generateAreaUnit(seed, aunit) : [],
    [op, seed, aunit],
  );
  const estimateProblems = useMemo(
    () => op === "estimate" ? generateEstimate(seed, erto) : [],
    [op, seed, erto],
  );
  const decimalPlaceProblems = useMemo(
    () => op === "decimal-place" ? generateDecimalPlace(seed, dpmode) : [],
    [op, seed, dpmode],
  );
  const divCheckProblems = useMemo(
    () => op === "div-check" ? generateDivCheck(seed) : [],
    [op, seed],
  );
  const largeNum4Problems = useMemo(
    () => op === "large-num4" ? generateLargeNum4(seed, ln4mode) : [],
    [op, seed, ln4mode],
  );
  const calcTrickProblems = useMemo(
    () => op === "calc-trick" ? generateCalcTrick(seed) : [],
    [op, seed],
  );
  const patternTableProblems = useMemo(
    () => op === "pattern-table" ? generatePatternTable(seed) : [],
    [op, seed],
  );
  const lineGraphProblems = useMemo(
    () => op === "line-graph" ? generateLineGraph(seed) : [],
    [op, seed],
  );
  const crossTableProblems = useMemo(
    () => op === "cross-table" ? generateCrossTable(seed) : [],
    [op, seed],
  );

  /* ---- settings panel ---- */

  const renderSettings = () => {
    switch (op) {
      case "mixed-calc":
        return (
          <div className="no-print settings-panel">
            <label>
              ( ) を含む{" "}
              <select className="operator-select" value={paren ? "1" : "0"}
                onChange={(e) => onParenChange(e.target.value === "1")}>
                <option value="1">あり</option>
                <option value="0">なし</option>
              </select>
            </label>
          </div>
        );
      case "rounding":
        return (
          <div className="no-print settings-panel">
            <label>
              数の桁数{" "}
              <select className="operator-select" value={rd}
                onChange={(e) => onRdChange(Number(e.target.value))}>
                <option value={2}>3〜4桁</option>
                <option value={3}>3〜5桁</option>
                <option value={4}>3〜6桁</option>
              </select>
            </label>
          </div>
        );
      case "frac-conv":
        return (
          <div className="no-print settings-panel">
            <label>
              変換方向{" "}
              <select className="operator-select" value={fdir}
                onChange={(e) => onFdirChange(e.target.value as any)}>
                <option value="both">両方</option>
                <option value="to-mixed">仮分数→帯分数</option>
                <option value="to-improper">帯分数→仮分数</option>
              </select>
            </label>
          </div>
        );
      case "area":
        return (
          <div className="no-print settings-panel">
            <label>
              図形{" "}
              <select className="operator-select" value={shape}
                onChange={(e) => onShapeChange(e.target.value as any)}>
                <option value="mixed">正方形・長方形</option>
                <option value="square">正方形のみ</option>
                <option value="rect">長方形のみ</option>
              </select>
            </label>
          </div>
        );
      case "angle":
        return null;
      case "area-unit":
        return (
          <div className="no-print settings-panel">
            <label>
              単位{" "}
              <select className="operator-select" value={aunit}
                onChange={(e) => onAunitChange(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="cm-m">cm²・m²</option>
                <option value="m-ha">m²・ha・km²</option>
              </select>
            </label>
          </div>
        );
      case "estimate":
        return (
          <div className="no-print settings-panel">
            <label>
              概数の位{" "}
              <select className="operator-select" value={erto}
                onChange={(e) => onErtoChange(Number(e.target.value))}>
                <option value={10}>十の位</option>
                <option value={100}>百の位</option>
              </select>
            </label>
          </div>
        );
      case "decimal-place":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={dpmode}
                onChange={(e) => onDpmodeChange(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="count">0.1が何個</option>
                <option value="multiply">10倍・1/10</option>
              </select>
            </label>
          </div>
        );
      case "div-check":
        return null;
      case "large-num4":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={ln4mode}
                onChange={(e) => onLn4modeChange(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="read">読み書き</option>
                <option value="position">位取り</option>
              </select>
            </label>
          </div>
        );
      case "calc-trick":
        return null;
      case "pattern-table":
        return null;
      case "line-graph":
        return null;
      case "cross-table":
        return null;
      default:
        return null;
    }
  };

  /* ---- render area SVG ---- */

  const renderAreaFigure = (p: AreaProblem) => {
    const W = 200;
    const H = 150;
    const pad = 30;
    const { figure } = p;

    const maxDim = Math.max(figure.width, figure.height);
    const scale = Math.min((W - pad * 2) / maxDim, (H - pad * 2) / maxDim);
    const rw = Math.max(40, figure.width * scale);
    const rh = Math.max(40, figure.height * scale);
    const rx = (W - rw) / 2;
    const ry = (H - rh) / 2;

    const widthLabel = figure.unknown === "width" ? "?" : `${figure.width}cm`;
    const heightLabel = figure.unknown === "height" ? "?" : `${figure.height}cm`;
    const widthColor = figure.unknown === "width" ? "#d32f2f" : "#1976d2";
    const heightColor = figure.unknown === "height" ? "#d32f2f" : "#1976d2";

    const sideLabel = figure.shape === "square"
      ? (figure.unknown === "area" ? `一辺 ${figure.width}cm` : "一辺 = ?")
      : null;

    return (
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", margin: "8px 0" }}
      >
        {/* Rectangle */}
        <rect x={rx} y={ry} width={rw} height={rh} fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
        {/* Right angle mark */}
        <polyline
          points={`${rx + 10},${ry + rh} ${rx + 10},${ry + rh - 10} ${rx},${ry + rh - 10}`}
          fill="none" stroke="#333" strokeWidth={1}
        />
        {figure.shape === "square" ? (
          <>
            {/* Single label for square */}
            <text x={rx + rw / 2} y={ry + rh + 18} textAnchor="middle" fontSize={11}
              fill={figure.unknown === "area" ? "#1976d2" : "#d32f2f"} fontWeight="bold">
              {sideLabel}
            </text>
            {/* Equal marks on sides */}
            <line x1={rx + rw / 2 - 4} y1={ry + rh + 3} x2={rx + rw / 2 + 4} y2={ry + rh + 3}
              stroke="#333" strokeWidth={1} />
            <line x1={rx + rw + 3} y1={ry + rh / 2 - 4} x2={rx + rw + 3} y2={ry + rh / 2 + 4}
              stroke="#333" strokeWidth={1} />
          </>
        ) : (
          <>
            {/* Width label (bottom) */}
            <text x={rx + rw / 2} y={ry + rh + 18} textAnchor="middle" fontSize={11}
              fill={widthColor} fontWeight="bold">
              よこ = {widthLabel}
            </text>
            {/* Height label (right) */}
            <text x={rx + rw + 8} y={ry + rh / 2 + 4} textAnchor="start" fontSize={11}
              fill={heightColor} fontWeight="bold">
              たて = {heightLabel}
            </text>
          </>
        )}
      </svg>
    );
  };

  /* ---- render angle SVG ---- */

  const renderAngleFigure = (p: AngleProblem) => {
    const W = 160;
    const H = 120;
    const vx = 20;
    const vy = H - 15;
    const rayLen = 120;
    const arcR = 30;
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const rayEnd = (deg: number) => ({
      x: vx + rayLen * Math.cos(toRad(deg)),
      y: vy - rayLen * Math.sin(toRad(deg)),
    });

    const arcPath = (startDeg: number, endDeg: number, r: number) => {
      const s = { x: vx + r * Math.cos(toRad(startDeg)), y: vy - r * Math.sin(toRad(startDeg)) };
      const e = { x: vx + r * Math.cos(toRad(endDeg)), y: vy - r * Math.sin(toRad(endDeg)) };
      const large = endDeg - startDeg > 180 ? 1 : 0;
      return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
    };

    const labelPos = (startDeg: number, endDeg: number, r: number) => {
      const mid = (startDeg + endDeg) / 2;
      return { x: vx + r * Math.cos(toRad(mid)), y: vy - r * Math.sin(toRad(mid)) };
    };

    const { figure } = p;

    if (figure.type === "supplement") {
      const angle = figure.angles[0];
      const r1 = rayEnd(0);
      const r2 = rayEnd(180);
      const r3 = rayEnd(angle);
      const lbl = labelPos(0, angle, arcR + 12);
      const lbl2 = labelPos(angle, 180, arcR + 12);
      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
          <line x1={vx} y1={vy} x2={r2.x} y2={r2.y} stroke="#333" strokeWidth={1.5} />
          <line x1={vx} y1={vy} x2={r1.x} y2={r1.y} stroke="#333" strokeWidth={1.5} />
          <line x1={vx} y1={vy} x2={r3.x} y2={r3.y} stroke="#333" strokeWidth={1.5} />
          <circle cx={vx} cy={vy} r={2.5} fill="#333" />
          <path d={arcPath(0, angle, arcR)} fill="none" stroke="#1976d2" strokeWidth={1.5} />
          <text x={lbl.x} y={lbl.y} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">{angle}°</text>
          <path d={arcPath(angle, 180, arcR)} fill="none" stroke="#d32f2f" strokeWidth={1.5} strokeDasharray="3 2" />
          <text x={lbl2.x} y={lbl2.y} textAnchor="middle" fontSize={10} fill="#d32f2f" fontWeight="bold">?</text>
        </svg>
      );
    }

    if (figure.type === "addition") {
      const [a1, a2] = figure.angles;
      const r1 = rayEnd(0);
      const r2 = rayEnd(a1);
      const r3 = rayEnd(a1 + a2);
      const lbl1 = labelPos(0, a1, arcR + 12);
      const lbl2 = labelPos(a1, a1 + a2, arcR + 12);
      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
          <line x1={vx} y1={vy} x2={r1.x} y2={r1.y} stroke="#333" strokeWidth={1.5} />
          <line x1={vx} y1={vy} x2={r2.x} y2={r2.y} stroke="#999" strokeWidth={1} strokeDasharray="4 3" />
          <line x1={vx} y1={vy} x2={r3.x} y2={r3.y} stroke="#333" strokeWidth={1.5} />
          <circle cx={vx} cy={vy} r={2.5} fill="#333" />
          <path d={arcPath(0, a1, arcR)} fill="none" stroke="#1976d2" strokeWidth={1.5} />
          <text x={lbl1.x} y={lbl1.y} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">{a1}°</text>
          <path d={arcPath(a1, a1 + a2, arcR + 8)} fill="none" stroke="#1976d2" strokeWidth={1.5} />
          <text x={lbl2.x} y={lbl2.y - 6} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">{a2}°</text>
        </svg>
      );
    }

    // full-rotation
    const angle = figure.angles[0];
    const r1 = rayEnd(0);
    const r2 = rayEnd(angle);
    const lbl = labelPos(0, angle, arcR + 12);
    const lbl2 = labelPos(angle, 360, arcR + 18);
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <line x1={vx} y1={vy} x2={r1.x} y2={r1.y} stroke="#333" strokeWidth={1.5} />
        <line x1={vx} y1={vy} x2={r2.x} y2={r2.y} stroke="#333" strokeWidth={1.5} />
        <circle cx={vx} cy={vy} r={2.5} fill="#333" />
        <path d={arcPath(0, angle, arcR)} fill="none" stroke="#1976d2" strokeWidth={1.5} />
        <text x={lbl.x} y={lbl.y} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">{angle}°</text>
        <path d={arcPath(angle, 359.9, arcR + 8)} fill="none" stroke="#d32f2f" strokeWidth={1.5} strokeDasharray="3 2" />
        <text x={lbl2.x} y={lbl2.y} textAnchor="middle" fontSize={10} fill="#d32f2f" fontWeight="bold">?</text>
      </svg>
    );
  };

  /* ---- render problems ---- */

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

  const renderProblems = () => {
    switch (op) {
      case "mixed-calc":
        return (
          <div className="g1-page g1-cols-2">
            {mixedProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  <span className="dev-text-q">{p.display}</span>
                  <span className="g1-op">=</span>
                  <Box answer={p.answer} show={showAnswers} />
                </span>
              </div>
            ))}
          </div>
        );

      case "rounding":
        return renderTextProblems(roundProblems);

      case "frac-conv":
        return (
          <div className="dev-text-page">
            {fracProblems.map((p, i) => (
              <div key={i} className="dev-text-row dev-frac-row">
                <span className="g1-num">({i + 1})</span>
                {p.direction === "to-mixed" ? (
                  <>
                    <Frac num={p.fromNum!} den={p.fromDen!} />
                    <span className="dev-text-arrow">&rarr;</span>
                    <span className={showAnswers ? "" : "g1-hidden"}>
                      <span className="dev-frac-ans">{p.toWhole}</span>
                      <Frac num={p.toNum!} den={p.toDen!} cls="dev-frac-ans" />
                    </span>
                  </>
                ) : (
                  <>
                    <span>{p.fromWhole}</span>
                    <Frac num={p.fromNum!} den={p.fromDen!} />
                    <span className="dev-text-arrow">&rarr;</span>
                    <span className={showAnswers ? "" : "g1-hidden"}>
                      <Frac num={p.toNum!} den={p.toDen!} cls="dev-frac-ans" />
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        );

      case "area":
        return (
          <div className="dev-fig-page">
            {areaProblems.map((p, i) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1})</div>
                {renderAreaFigure(p)}
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

      case "angle":
        return (
          <div className="dev-fig-page">
            {angleProblems.map((p, i) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1})</div>
                {renderAngleFigure(p)}
                <div style={{ marginTop: 8 }}>
                  <div className="dev-text-row">
                    <span className="dev-text-q">{p.display} =</span>
                    <Box answer={`${p.answer}°`} show={showAnswers} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "area-unit":
        return renderTextProblems(areaUnitProblems);

      case "estimate":
        return renderTextProblems(estimateProblems);

      case "decimal-place":
        return renderTextProblems(decimalPlaceProblems);

      case "div-check":
        return renderTextProblems(divCheckProblems);

      case "large-num4":
        return renderTextProblems(largeNum4Problems);

      case "calc-trick":
        return renderTextProblems(calcTrickProblems);

      case "pattern-table":
        return (
          <div className="dev-text-page">
            {patternTableProblems.map((p, idx) => {
              let ansIdx = 0;
              return (
                <div key={idx} className="dev-prop-block">
                  <div className="dev-prop-label">
                    ({idx + 1}) {p.label}
                  </div>
                  <table className="dev-prop-table">
                    <thead>
                      <tr>
                        <th>x</th>
                        {p.xValues.map((x, j) => <th key={j}>{x}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>y</td>
                        {p.yValues.map((y, j) => {
                          if (y !== null) {
                            return <td key={j}>{y}</td>;
                          }
                          const ans = p.answers[ansIdx++];
                          return (
                            <td key={j} className="dev-prop-blank">
                              <span className={showAnswers ? "dev-frac-ans" : "g1-hidden"}>
                                {ans}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        );

      case "line-graph":
        return (
          <div className="dev-text-page">
            {lineGraphProblems.map((p, idx) => {
              const maxVal = Math.max(...p.values);
              const minVal = Math.min(...p.values);
              const range = maxVal - minVal || 1;
              const padding = 40;
              const graphWidth = 300;
              const graphHeight = 200;
              const stepX = graphWidth / (p.labels.length - 1);

              return (
                <div key={idx} className="dev-prop-block">
                  <div className="dev-prop-label">
                    ({idx + 1}) {p.title}
                  </div>
                  <svg
                    width={graphWidth + padding * 2}
                    height={graphHeight + padding * 2}
                    style={{ display: "block", margin: "8px 0" }}
                  >
                    {/* Y-axis */}
                    <line
                      x1={padding} y1={padding}
                      x2={padding} y2={padding + graphHeight}
                      stroke="#333" strokeWidth={1}
                    />
                    {/* X-axis */}
                    <line
                      x1={padding} y1={padding + graphHeight}
                      x2={padding + graphWidth} y2={padding + graphHeight}
                      stroke="#333" strokeWidth={1}
                    />
                    {/* Y-axis labels */}
                    {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
                      const val = Math.round(minVal + range * frac);
                      const y = padding + graphHeight - graphHeight * frac;
                      return (
                        <g key={i}>
                          <line
                            x1={padding - 4} y1={y}
                            x2={padding} y2={y}
                            stroke="#333" strokeWidth={1}
                          />
                          <text
                            x={padding - 8} y={y + 4}
                            textAnchor="end" fontSize={10} fill="#333"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}
                    {/* X-axis labels */}
                    {p.labels.map((label, i) => {
                      const x = padding + i * stepX;
                      return (
                        <text
                          key={i}
                          x={x} y={padding + graphHeight + 16}
                          textAnchor="middle" fontSize={9} fill="#333"
                        >
                          {label}
                        </text>
                      );
                    })}
                    {/* Line */}
                    <polyline
                      points={p.values.map((v, i) => {
                        const x = padding + i * stepX;
                        const y = padding + graphHeight - ((v - minVal) / range) * graphHeight;
                        return `${x},${y}`;
                      }).join(" ")}
                      fill="none" stroke="#2196F3" strokeWidth={2}
                    />
                    {/* Dots */}
                    {p.values.map((v, i) => {
                      const x = padding + i * stepX;
                      const y = padding + graphHeight - ((v - minVal) / range) * graphHeight;
                      return (
                        <circle
                          key={i} cx={x} cy={y} r={3}
                          fill="#2196F3"
                        />
                      );
                    })}
                    {/* Unit label */}
                    <text
                      x={padding - 8} y={padding - 8}
                      textAnchor="end" fontSize={10} fill="#666"
                    >
                      ({p.unit})
                    </text>
                  </svg>
                  {p.questions.map((q, qi) => (
                    <div key={qi} className="dev-text-row">
                      <span className="dev-text-q">{q.question}</span>
                      <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                        {q.answer}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );

      case "cross-table":
        return (
          <div className="dev-text-page">
            {crossTableProblems.map((p, idx) => {
              let ansIdx = 0;
              return (
                <div key={idx} className="dev-prop-block">
                  <div className="dev-prop-label">
                    ({idx + 1}) {p.title}
                  </div>
                  <table className="dev-prop-table">
                    <thead>
                      <tr>
                        <th></th>
                        {p.colLabels.map((col, j) => <th key={j}>{col}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {p.rowLabels.map((row, r) => (
                        <tr key={r}>
                          <td><strong>{row}</strong></td>
                          {p.cells[r].map((cell, c) => {
                            if (cell !== null) {
                              return <td key={c}>{cell}</td>;
                            }
                            const ans = p.answers[ansIdx++];
                            return (
                              <td key={c} className="dev-prop-blank">
                                <span className={showAnswers ? "dev-frac-ans" : "g1-hidden"}>
                                  {ans}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
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

export default Grade4;

export const devGrade4: ProblemGroup = {
  id: "dev4",
  label: "4年（開発中）",
  operators: [
    { operator: "mixed-calc", label: "四則混合", grades: [4] },
    { operator: "rounding", label: "四捨五入", grades: [4] },
    { operator: "frac-conv", label: "分数の変換", grades: [4] },
    { operator: "area", label: "面積", grades: [4] },
    { operator: "angle", label: "角度", grades: [4] },
    { operator: "area-unit", label: "面積の単位換算", grades: [4] },
    { operator: "estimate", label: "見積もり", grades: [4] },
    { operator: "decimal-place", label: "小数の位取り", grades: [4] },
    { operator: "div-check", label: "わり算の検算", grades: [4] },
    { operator: "large-num4", label: "大きな数（億・兆）", grades: [4] },
    { operator: "calc-trick", label: "計算のくふう", grades: [4] },
    { operator: "pattern-table", label: "変わり方と表", grades: [4] },
    { operator: "line-graph", label: "折れ線グラフ", grades: [4] },
    { operator: "cross-table", label: "二次元の表", grades: [4] },
  ],
  Component: Grade4,
};

/* ================================================================
   URL state helpers
   ================================================================ */

const ALL_PARAMS = ["q", "answers", "paren", "rd", "fdir", "shape", "atype", "aunit", "erto", "dpmode", "ln4mode"];

const cleanParams = (url: URL) => {
  for (const k of ALL_PARAMS) url.searchParams.delete(k);
};

/* ================================================================
   Defaults
   ================================================================ */

const ROUND_DEF = { rd: 3 };
const FRAC_DEF = { fdir: "both" as const };
const AREA_DEF = { shape: "mixed" as const };
const AUNIT_DEF = { aunit: "mixed" as const };
const ERTO_DEF = { erto: 10 };
const DPMODE_DEF = { dpmode: "mixed" as const };
const LN4MODE_DEF = { ln4mode: "mixed" as const };
