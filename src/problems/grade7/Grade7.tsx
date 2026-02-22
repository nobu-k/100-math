import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { randomSeed, seedToHex, hexToSeed } from "../random";
import type { ProblemGroup } from "../types";
import { Box } from "../shared/Box";
import {
  generatePosNegAddSub,
  generatePosNegMulDiv,
  generatePosNegMixed,
  generateAbsoluteValue,
  generatePrime,
  generateExprValue,
  generateLinearExpr,
  generateLinearEq,
  generateSector,
  generateSolid,
  generateProportion,
  generateDataAnalysis,
  generateCoordinate,
} from "./generators";
import type {
  PosNegMulDivMode,
  AbsoluteValueMode,
  PrimeMode,
  ExprValueVars,
  LinearExprMode,
  LinearEqMode,
  SectorMode,
  SolidMode,
  ProportionMode,
  DataAnalysisMode,
  CoordinateMode,
  CoordinateProblem,
  SectorProblem,
  SolidProblem,
  DataAnalysisProblem,
} from "./generators";

/* ================================================================
   Types
   ================================================================ */

type Grade7Op =
  | "pos-neg-add-sub"
  | "pos-neg-mul-div"
  | "pos-neg-mixed"
  | "absolute-value"
  | "prime"
  | "expr-value"
  | "linear-expr"
  | "linear-eq"
  | "sector"
  | "solid-volume"
  | "proportion"
  | "data-analysis"
  | "coordinate";

/* ================================================================
   URL state helpers
   ================================================================ */

const ALL_PARAMS = [
  "q", "answers", "terms", "mdmode", "absmode", "prmode", "evvars",
  "lemode", "eqmode", "secmode", "solmode", "propmode", "damode", "comode",
];

const cleanParams = (url: URL) => {
  for (const k of ALL_PARAMS) url.searchParams.delete(k);
};

/* ================================================================
   Defaults
   ================================================================ */

const ADDSUB_DEF = { terms: 2 as 2 | 3 };
const MULDIV_DEF = { mdmode: "mixed" as PosNegMulDivMode };
const ABS_DEF = { absmode: "find" as AbsoluteValueMode };
const PRIME_DEF = { prmode: "identify" as PrimeMode };
const EXPRVAL_DEF = { evvars: "one" as ExprValueVars };
const LINEXPR_DEF = { lemode: "mixed" as LinearExprMode };
const LINEQ_DEF = { eqmode: "mixed" as LinearEqMode };
const SECTOR_DEF = { secmode: "mixed" as SectorMode };
const SOLID_DEF = { solmode: "mixed" as SolidMode };
const PROP_DEF = { propmode: "mixed" as ProportionMode };
const DA_DEF = { damode: "mixed" as DataAnalysisMode };
const COORD_DEF = { comode: "mixed" as CoordinateMode };

/* ================================================================
   Main component
   ================================================================ */

const Grade7 = ({ operator }: { operator: string }) => {
  const op = operator as Grade7Op;

  const getInitial = () => {
    const p = new URLSearchParams(window.location.search);
    const qHex = p.get("q");
    const seed = qHex ? hexToSeed(qHex) ?? randomSeed() : randomSeed();
    const showAnswers = p.get("answers") === "1";

    const termsRaw = p.get("terms");
    const terms: 2 | 3 = termsRaw === "3" ? 3 : ADDSUB_DEF.terms;

    const mdmodeRaw = p.get("mdmode") ?? MULDIV_DEF.mdmode;
    const mdmode = (["mul", "div", "mixed", "power"] as const).includes(mdmodeRaw as any)
      ? (mdmodeRaw as PosNegMulDivMode) : MULDIV_DEF.mdmode;

    const absmodeRaw = p.get("absmode") ?? ABS_DEF.absmode;
    const absmode = (["find", "list", "equation"] as const).includes(absmodeRaw as any)
      ? (absmodeRaw as AbsoluteValueMode) : ABS_DEF.absmode;

    const prmodeRaw = p.get("prmode") ?? PRIME_DEF.prmode;
    const prmode = (["identify", "factorize"] as const).includes(prmodeRaw as any)
      ? (prmodeRaw as PrimeMode) : PRIME_DEF.prmode;

    const evvarsRaw = p.get("evvars") ?? EXPRVAL_DEF.evvars;
    const evvars = (["one", "two"] as const).includes(evvarsRaw as any)
      ? (evvarsRaw as ExprValueVars) : EXPRVAL_DEF.evvars;

    const lemodeRaw = p.get("lemode") ?? LINEXPR_DEF.lemode;
    const lemode = (["add-sub", "mul-div", "mixed"] as const).includes(lemodeRaw as any)
      ? (lemodeRaw as LinearExprMode) : LINEXPR_DEF.lemode;

    const eqmodeRaw = p.get("eqmode") ?? LINEQ_DEF.eqmode;
    const eqmode = (["basic", "advanced", "mixed"] as const).includes(eqmodeRaw as any)
      ? (eqmodeRaw as LinearEqMode) : LINEQ_DEF.eqmode;

    const secmodeRaw = p.get("secmode") ?? SECTOR_DEF.secmode;
    const secmode = (["arc", "area", "mixed"] as const).includes(secmodeRaw as any)
      ? (secmodeRaw as SectorMode) : SECTOR_DEF.secmode;

    const solmodeRaw = p.get("solmode") ?? SOLID_DEF.solmode;
    const solmode = (["cylinder", "cone", "sphere", "prism", "mixed"] as const).includes(solmodeRaw as any)
      ? (solmodeRaw as SolidMode) : SOLID_DEF.solmode;

    const propmodeRaw = p.get("propmode") ?? PROP_DEF.propmode;
    const propmode = (["direct", "inverse", "mixed"] as const).includes(propmodeRaw as any)
      ? (propmodeRaw as ProportionMode) : PROP_DEF.propmode;

    const damodeRaw = p.get("damode") ?? DA_DEF.damode;
    const damode = (["representative", "frequency", "mixed"] as const).includes(damodeRaw as any)
      ? (damodeRaw as DataAnalysisMode) : DA_DEF.damode;

    const comodeRaw = p.get("comode") ?? COORD_DEF.comode;
    const comode = (["quadrant", "on-graph", "mixed"] as const).includes(comodeRaw as any)
      ? (comodeRaw as CoordinateMode) : COORD_DEF.comode;

    return { seed, showAnswers, terms, mdmode, absmode, prmode, evvars, lemode, eqmode, secmode, solmode, propmode, damode, comode };
  };

  const [initial] = useState(getInitial);
  const [seed, setSeed] = useState(initial.seed);
  const [showAnswers, setShowAnswers] = useState(initial.showAnswers);
  const [showSettings, setShowSettings] = useState(false);

  const [terms, setTerms] = useState(initial.terms);
  const [mdmode, setMdmode] = useState(initial.mdmode);
  const [absmode, setAbsmode] = useState(initial.absmode);
  const [prmode, setPrmode] = useState(initial.prmode);
  const [evvars, setEvvars] = useState(initial.evvars);
  const [lemode, setLemode] = useState(initial.lemode);
  const [eqmode, setEqmode] = useState(initial.eqmode);
  const [secmode, setSecmode] = useState(initial.secmode);
  const [solmode, setSolmode] = useState(initial.solmode);
  const [propmode, setPropmode] = useState(initial.propmode);
  const [damode, setDamode] = useState(initial.damode);
  const [comode, setComode] = useState(initial.comode);

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
      case "pos-neg-add-sub":
        if (terms !== ADDSUB_DEF.terms) m.terms = String(terms);
        break;
      case "pos-neg-mul-div":
        if (mdmode !== MULDIV_DEF.mdmode) m.mdmode = mdmode;
        break;
      case "absolute-value":
        if (absmode !== ABS_DEF.absmode) m.absmode = absmode;
        break;
      case "prime":
        if (prmode !== PRIME_DEF.prmode) m.prmode = prmode;
        break;
      case "expr-value":
        if (evvars !== EXPRVAL_DEF.evvars) m.evvars = evvars;
        break;
      case "linear-expr":
        if (lemode !== LINEXPR_DEF.lemode) m.lemode = lemode;
        break;
      case "linear-eq":
        if (eqmode !== LINEQ_DEF.eqmode) m.eqmode = eqmode;
        break;
      case "sector":
        if (secmode !== SECTOR_DEF.secmode) m.secmode = secmode;
        break;
      case "solid-volume":
        if (solmode !== SOLID_DEF.solmode) m.solmode = solmode;
        break;
      case "proportion":
        if (propmode !== PROP_DEF.propmode) m.propmode = propmode;
        break;
      case "data-analysis":
        if (damode !== DA_DEF.damode) m.damode = damode;
        break;
      case "coordinate":
        if (comode !== COORD_DEF.comode) m.comode = comode;
        break;
      case "pos-neg-mixed":
        break;
    }
    return m;
  }, [op, terms, mdmode, absmode, prmode, evvars, lemode, eqmode, secmode, solmode, propmode, damode, comode]);

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

  const addSubProblems = useMemo(
    () => op === "pos-neg-add-sub" ? generatePosNegAddSub(seed, terms) : [],
    [op, seed, terms],
  );
  const mulDivProblems = useMemo(
    () => op === "pos-neg-mul-div" ? generatePosNegMulDiv(seed, mdmode) : [],
    [op, seed, mdmode],
  );
  const mixedProblems = useMemo(
    () => op === "pos-neg-mixed" ? generatePosNegMixed(seed) : [],
    [op, seed],
  );
  const absProblems = useMemo(
    () => op === "absolute-value" ? generateAbsoluteValue(seed, absmode) : [],
    [op, seed, absmode],
  );
  const primeProblems = useMemo(
    () => op === "prime" ? generatePrime(seed, prmode) : [],
    [op, seed, prmode],
  );
  const exprValProblems = useMemo(
    () => op === "expr-value" ? generateExprValue(seed, evvars) : [],
    [op, seed, evvars],
  );
  const linExprProblems = useMemo(
    () => op === "linear-expr" ? generateLinearExpr(seed, lemode) : [],
    [op, seed, lemode],
  );
  const linEqProblems = useMemo(
    () => op === "linear-eq" ? generateLinearEq(seed, eqmode) : [],
    [op, seed, eqmode],
  );
  const sectorProblems = useMemo(
    () => op === "sector" ? generateSector(seed, secmode) : [],
    [op, seed, secmode],
  );
  const solidProblems = useMemo(
    () => op === "solid-volume" ? generateSolid(seed, solmode) : [],
    [op, seed, solmode],
  );
  const propProblems = useMemo(
    () => op === "proportion" ? generateProportion(seed, propmode) : [],
    [op, seed, propmode],
  );
  const dataProblems = useMemo(
    () => op === "data-analysis" ? generateDataAnalysis(seed, damode) : [],
    [op, seed, damode],
  );
  const coordProblems = useMemo(
    () => op === "coordinate" ? generateCoordinate(seed, comode) : [],
    [op, seed, comode],
  );

  /* ---- settings panel ---- */

  const renderSettings = () => {
    switch (op) {
      case "pos-neg-add-sub":
        return (
          <div className="no-print settings-panel">
            <label>
              項の数{" "}
              <select className="operator-select" value={terms}
                onChange={(e) => onSettingChange(setTerms, "terms", ADDSUB_DEF.terms)(Number(e.target.value) as 2 | 3)}>
                <option value={2}>2項</option>
                <option value={3}>3項</option>
              </select>
            </label>
          </div>
        );
      case "pos-neg-mul-div":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={mdmode}
                onChange={(e) => onSettingChange(setMdmode, "mdmode", MULDIV_DEF.mdmode)(e.target.value as PosNegMulDivMode)}>
                <option value="mixed">すべて</option>
                <option value="mul">乗法のみ</option>
                <option value="div">除法のみ</option>
                <option value="power">累乗のみ</option>
              </select>
            </label>
          </div>
        );
      case "absolute-value":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={absmode}
                onChange={(e) => onSettingChange(setAbsmode, "absmode", ABS_DEF.absmode)(e.target.value as AbsoluteValueMode)}>
                <option value="find">絶対値を求める</option>
                <option value="list">整数を列挙</option>
                <option value="equation">|x| = a</option>
              </select>
            </label>
          </div>
        );
      case "prime":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={prmode}
                onChange={(e) => onSettingChange(setPrmode, "prmode", PRIME_DEF.prmode)(e.target.value as PrimeMode)}>
                <option value="identify">素数の判定</option>
                <option value="factorize">素因数分解</option>
              </select>
            </label>
          </div>
        );
      case "expr-value":
        return (
          <div className="no-print settings-panel">
            <label>
              変数の数{" "}
              <select className="operator-select" value={evvars}
                onChange={(e) => onSettingChange(setEvvars, "evvars", EXPRVAL_DEF.evvars)(e.target.value as ExprValueVars)}>
                <option value="one">1つ</option>
                <option value="two">2つ</option>
              </select>
            </label>
          </div>
        );
      case "linear-expr":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={lemode}
                onChange={(e) => onSettingChange(setLemode, "lemode", LINEXPR_DEF.lemode)(e.target.value as LinearExprMode)}>
                <option value="mixed">すべて</option>
                <option value="add-sub">加減のみ</option>
                <option value="mul-div">乗除のみ</option>
              </select>
            </label>
          </div>
        );
      case "linear-eq":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={eqmode}
                onChange={(e) => onSettingChange(setEqmode, "eqmode", LINEQ_DEF.eqmode)(e.target.value as LinearEqMode)}>
                <option value="mixed">すべて</option>
                <option value="basic">基本</option>
                <option value="advanced">移項・括弧</option>
              </select>
            </label>
          </div>
        );
      case "sector":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={secmode}
                onChange={(e) => onSettingChange(setSecmode, "secmode", SECTOR_DEF.secmode)(e.target.value as SectorMode)}>
                <option value="mixed">すべて</option>
                <option value="arc">弧の長さ</option>
                <option value="area">面積</option>
              </select>
            </label>
          </div>
        );
      case "solid-volume":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={solmode}
                onChange={(e) => onSettingChange(setSolmode, "solmode", SOLID_DEF.solmode)(e.target.value as SolidMode)}>
                <option value="mixed">すべて</option>
                <option value="cylinder">円柱</option>
                <option value="cone">円錐</option>
                <option value="sphere">球</option>
                <option value="prism">角柱</option>
              </select>
            </label>
          </div>
        );
      case "proportion":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={propmode}
                onChange={(e) => onSettingChange(setPropmode, "propmode", PROP_DEF.propmode)(e.target.value as ProportionMode)}>
                <option value="mixed">比例・反比例</option>
                <option value="direct">比例のみ</option>
                <option value="inverse">反比例のみ</option>
              </select>
            </label>
          </div>
        );
      case "data-analysis":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={damode}
                onChange={(e) => onSettingChange(setDamode, "damode", DA_DEF.damode)(e.target.value as DataAnalysisMode)}>
                <option value="mixed">すべて</option>
                <option value="representative">代表値</option>
                <option value="frequency">度数分布表</option>
              </select>
            </label>
          </div>
        );
      case "coordinate":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={comode}
                onChange={(e) => onSettingChange(setComode, "comode", COORD_DEF.comode)(e.target.value as CoordinateMode)}>
                <option value="mixed">すべて</option>
                <option value="quadrant">象限の判定</option>
                <option value="on-graph">グラフ上の点</option>
              </select>
            </label>
          </div>
        );
      case "pos-neg-mixed":
        return null;
      default:
        return null;
    }
  };

  /* ---- render helpers ---- */

  const renderTextProblems = (
    items: { expr?: string; question?: string; equation?: string; answerDisplay?: string; answer?: number | string }[],
    getQ: (p: any) => string,
    getA: (p: any) => string | number,
  ) => (
    <div className="dev-text-page">
      {items.map((p, i) => (
        <div key={i} className="dev-text-row">
          <span className="g1-num">({i + 1})</span>
          <span className="dev-text-q">{getQ(p)}</span>
          <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
            {getA(p)}
          </span>
        </div>
      ))}
    </div>
  );

  /* ---- render sector SVG ---- */

  const renderSectorFigure = (p: SectorProblem) => {
    const W = 160;
    const H = 160;
    const cx = 30;
    const cy = H - 20;
    const r = 100;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const angle = p.angle;

    const ex = cx + r * Math.cos(toRad(angle));
    const ey = cy - r * Math.sin(toRad(angle));
    const largeArc = angle > 180 ? 1 : 0;

    const arcPath = `M ${cx + r} ${cy} A ${r} ${r} 0 ${largeArc} 0 ${ex} ${ey}`;
    const sectorPath = `M ${cx} ${cy} L ${cx + r} ${cy} A ${r} ${r} 0 ${largeArc} 0 ${ex} ${ey} Z`;

    const arcR = 20;
    const arcLabelAngle = angle / 2;
    const arcLx = cx + (arcR + 12) * Math.cos(toRad(arcLabelAngle));
    const arcLy = cy - (arcR + 12) * Math.sin(toRad(arcLabelAngle));

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        {/* Filled sector for area type */}
        {p.type === "area" && (
          <path d={sectorPath} fill="#e3f2fd" stroke="none" />
        )}
        {/* Two radii */}
        <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke="#333" strokeWidth={1.5} />
        <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="#333" strokeWidth={1.5} />
        {/* Arc */}
        <path d={arcPath} fill="none"
          stroke={p.type === "arc" ? "#d32f2f" : "#333"}
          strokeWidth={p.type === "arc" ? 2.5 : 1.5} />
        {/* Center dot */}
        <circle cx={cx} cy={cy} r={2.5} fill="#333" />
        {/* Angle arc */}
        <path
          d={`M ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 ${largeArc} 0 ${cx + arcR * Math.cos(toRad(angle))} ${cy - arcR * Math.sin(toRad(angle))}`}
          fill="none" stroke="#666" strokeWidth={0.8} />
        <text x={arcLx} y={arcLy + 3} textAnchor="middle" fontSize={9} fill="#333">{angle}°</text>
        {/* Radius label */}
        <text x={cx + r / 2} y={cy + 14} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
          r = {p.radius}cm
        </text>
      </svg>
    );
  };

  /* ---- render solid volume SVG ---- */

  const renderSolidFigure = (p: SolidProblem) => {
    const W = 180;
    const H = 180;

    if (p.solidType === "cylinder") {
      const cx = W / 2;
      const rx = 35;
      const ry = 10;
      const ch = 70;
      const topY = 35;
      const botY = topY + ch;
      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
          <ellipse cx={cx} cy={botY} rx={rx} ry={ry} fill="none" stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
          <line x1={cx - rx} y1={topY} x2={cx - rx} y2={botY} stroke="#333" strokeWidth={1.5} />
          <line x1={cx + rx} y1={topY} x2={cx + rx} y2={botY} stroke="#333" strokeWidth={1.5} />
          <path d={`M ${cx - rx} ${botY} A ${rx} ${ry} 0 0 0 ${cx + rx} ${botY}`} fill="none" stroke="#333" strokeWidth={1.5} />
          <ellipse cx={cx} cy={topY} rx={rx} ry={ry} fill="#e8e8e8" stroke="#333" strokeWidth={1.5} />
          <line x1={cx} y1={topY} x2={cx + rx} y2={topY} stroke="#1976d2" strokeWidth={1.5} />
          <circle cx={cx} cy={topY} r={2} fill="#333" />
          <text x={cx + rx / 2} y={topY - 6} textAnchor="middle" fontSize={9} fill="#1976d2" fontWeight="bold">r={p.radius}</text>
          <text x={cx + rx + 8} y={topY + ch / 2 + 4} fontSize={9} fill="#1976d2" fontWeight="bold">h={p.height}</text>
        </svg>
      );
    }

    if (p.solidType === "cone") {
      const cx = W / 2;
      const rx = 35;
      const ry = 10;
      const ch = 80;
      const botY = H - 25;
      const topY = botY - ch;
      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
          <ellipse cx={cx} cy={botY} rx={rx} ry={ry} fill="none" stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
          <path d={`M ${cx - rx} ${botY} A ${rx} ${ry} 0 0 0 ${cx + rx} ${botY}`} fill="none" stroke="#333" strokeWidth={1.5} />
          <line x1={cx - rx} y1={botY} x2={cx} y2={topY} stroke="#333" strokeWidth={1.5} />
          <line x1={cx + rx} y1={botY} x2={cx} y2={topY} stroke="#333" strokeWidth={1.5} />
          <circle cx={cx} cy={topY} r={2} fill="#333" />
          <line x1={cx} y1={topY} x2={cx} y2={botY} stroke="#333" strokeWidth={1} strokeDasharray="4 3" />
          <line x1={cx} y1={botY} x2={cx + rx} y2={botY} stroke="#1976d2" strokeWidth={1.5} />
          <text x={cx + rx / 2} y={botY + 14} textAnchor="middle" fontSize={9} fill="#1976d2" fontWeight="bold">r={p.radius}</text>
          <text x={cx + 10} y={topY + ch / 2} fontSize={9} fill="#1976d2" fontWeight="bold">h={p.height}</text>
          {p.slantHeight != null && (
            <text x={cx + rx / 2 + 12} y={topY + ch / 2 - 6} fontSize={9} fill="#1976d2" fontWeight="bold">l={p.slantHeight}</text>
          )}
        </svg>
      );
    }

    if (p.solidType === "sphere") {
      const cx = W / 2;
      const cy = H / 2;
      const cr = 50;
      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
          <circle cx={cx} cy={cy} r={cr} fill="none" stroke="#333" strokeWidth={1.5} />
          <ellipse cx={cx} cy={cy} rx={cr} ry={cr * 0.3} fill="none" stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
          <line x1={cx} y1={cy} x2={cx + cr} y2={cy} stroke="#1976d2" strokeWidth={1.5} />
          <circle cx={cx} cy={cy} r={2} fill="#333" />
          <text x={cx + cr / 2} y={cy + 16} textAnchor="middle" fontSize={9} fill="#1976d2" fontWeight="bold">r={p.radius}</text>
        </svg>
      );
    }

    // Prism
    const bw = 50;
    const bh = 60;
    const bd = 35;
    const cos30 = Math.cos(Math.PI / 6);
    const sin30 = Math.sin(Math.PI / 6);
    const dx = bd * cos30;
    const dy = bd * sin30;
    const ox = 25;
    const oy = H - 25;

    if (p.baseSides === 3) {
      const fbl = { x: ox, y: oy };
      const fbr = { x: ox + bw, y: oy };
      const fap = { x: ox + bw * 0.3, y: oy - bh };
      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
          <line x1={fbl.x} y1={fbl.y} x2={fbl.x + dx} y2={fbl.y - dy} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
          <line x1={fbl.x + dx} y1={fbl.y - dy} x2={fbr.x + dx} y2={fbr.y - dy} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
          <line x1={fbl.x + dx} y1={fbl.y - dy} x2={fap.x + dx} y2={fap.y - dy} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
          <polygon points={`${fbl.x},${fbl.y} ${fbr.x},${fbr.y} ${fap.x},${fap.y}`} fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
          <polygon points={`${fap.x},${fap.y} ${fap.x + dx},${fap.y - dy} ${fbr.x + dx},${fbr.y - dy} ${fbr.x},${fbr.y}`} fill="#d0d0d0" stroke="#333" strokeWidth={1.5} />
          <line x1={fap.x} y1={fap.y} x2={fap.x + dx} y2={fap.y - dy} stroke="#333" strokeWidth={1.5} />
          <text x={ox + bw / 2} y={oy + 14} textAnchor="middle" fontSize={9} fill="#1976d2" fontWeight="bold">a={p.baseEdge}</text>
          <text x={ox + bw + dx + 6} y={oy - dy / 2} fontSize={9} fill="#1976d2" fontWeight="bold">h={p.height}</text>
        </svg>
      );
    }

    // Square prism
    const fbl = { x: ox, y: oy };
    const fbr = { x: ox + bw, y: oy };
    const ftr = { x: ox + bw, y: oy - bh };
    const ftl = { x: ox, y: oy - bh };
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <line x1={fbl.x} y1={fbl.y} x2={fbl.x + dx} y2={fbl.y - dy} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
        <line x1={fbl.x + dx} y1={fbl.y - dy} x2={fbr.x + dx} y2={fbr.y - dy} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
        <line x1={fbl.x + dx} y1={fbl.y - dy} x2={ftl.x + dx} y2={ftl.y - dy} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
        <rect x={fbl.x} y={ftl.y} width={bw} height={bh} fill="#fff" stroke="#333" strokeWidth={1.5} />
        <polygon points={`${ftl.x},${ftl.y} ${ftl.x + dx},${ftl.y - dy} ${ftr.x + dx},${ftr.y - dy} ${ftr.x},${ftr.y}`} fill="#e8e8e8" stroke="#333" strokeWidth={1.5} />
        <polygon points={`${fbr.x},${fbr.y} ${fbr.x + dx},${fbr.y - dy} ${ftr.x + dx},${ftr.y - dy} ${ftr.x},${ftr.y}`} fill="#d0d0d0" stroke="#333" strokeWidth={1.5} />
        <text x={ox + bw / 2} y={oy + 14} textAnchor="middle" fontSize={9} fill="#1976d2" fontWeight="bold">a={p.baseEdge}</text>
        <text x={ox + bw + dx + 6} y={oy - dy / 2} fontSize={9} fill="#1976d2" fontWeight="bold">h={p.height}</text>
      </svg>
    );
  };

  /* ---- render coordinate SVG ---- */

  const renderCoordinateFigure = (p: CoordinateProblem) => {
    const W = 200;
    const H = 200;
    const cx = W / 2;
    const cy = H / 2;
    const axisLen = 80;
    const scale = 8;

    const toSvgX = (v: number) => cx + v * scale;
    const toSvgY = (v: number) => cy - v * scale;

    const gridLines: React.ReactNode[] = [];
    for (let v = -8; v <= 8; v += 2) {
      if (v === 0) continue;
      gridLines.push(
        <line key={`gx${v}`} x1={toSvgX(v)} y1={cy - axisLen} x2={toSvgX(v)} y2={cy + axisLen}
          stroke="#eee" strokeWidth={0.5} />,
        <line key={`gy${v}`} x1={cx - axisLen} y1={toSvgY(v)} x2={cx + axisLen} y2={toSvgY(v)}
          stroke="#eee" strokeWidth={0.5} />,
      );
    }

    const px = toSvgX(p.x);
    const py = toSvgY(p.y);

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        {/* Grid */}
        {gridLines}
        {/* Axes */}
        <line x1={cx - axisLen} y1={cy} x2={cx + axisLen} y2={cy} stroke="#333" strokeWidth={1} />
        <line x1={cx} y1={cy + axisLen} x2={cx} y2={cy - axisLen} stroke="#333" strokeWidth={1} />
        {/* Arrows */}
        <polygon points={`${cx + axisLen},${cy} ${cx + axisLen - 5},${cy - 3} ${cx + axisLen - 5},${cy + 3}`} fill="#333" />
        <polygon points={`${cx},${cy - axisLen} ${cx - 3},${cy - axisLen + 5} ${cx + 3},${cy - axisLen + 5}`} fill="#333" />
        {/* Axis labels */}
        <text x={cx + axisLen + 4} y={cy + 4} fontSize={10} fill="#333">x</text>
        <text x={cx + 4} y={cy - axisLen - 2} fontSize={10} fill="#333">y</text>
        <text x={cx - 10} y={cy + 12} fontSize={9} fill="#333">O</text>
        {/* Quadrant labels */}
        <text x={cx + 35} y={cy - 35} textAnchor="middle" fontSize={10} fill="#ddd">I</text>
        <text x={cx - 35} y={cy - 35} textAnchor="middle" fontSize={10} fill="#ddd">II</text>
        <text x={cx - 35} y={cy + 42} textAnchor="middle" fontSize={10} fill="#ddd">III</text>
        <text x={cx + 35} y={cy + 42} textAnchor="middle" fontSize={10} fill="#ddd">IV</text>
        {/* Graph line for on-graph type */}
        {p.type === "on-graph" && p.formulaA != null && (
          <>
            <line
              x1={toSvgX(-8)} y1={toSvgY(-8 * p.formulaA)}
              x2={toSvgX(8)} y2={toSvgY(8 * p.formulaA)}
              stroke="#1976d2" strokeWidth={1} opacity={0.6}
              clipPath="url(#coordClip)"
            />
            <defs>
              <clipPath id="coordClip">
                <rect x={cx - axisLen} y={cy - axisLen} width={axisLen * 2} height={axisLen * 2} />
              </clipPath>
            </defs>
          </>
        )}
        {/* Point */}
        <circle cx={px} cy={py} r={4} fill="#d32f2f" />
        <text x={px + 6} y={py - 6} fontSize={10} fill="#d32f2f" fontWeight="bold">
          ({p.x}, {p.y})
        </text>
      </svg>
    );
  };

  /* ---- render problems ---- */

  const renderProblems = () => {
    switch (op) {
      case "pos-neg-add-sub":
        return (
          <div className="g1-page g1-cols-2">
            {addSubProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  {p.terms.map((t, j) => (
                    <span key={j}>
                      {j > 0 && <span className="g1-op">{t >= 0 ? "+" : "−"}</span>}
                      <span className="g1-val">
                        {j === 0 ? `(${t >= 0 ? "+" : ""}${t})` : `(${t >= 0 ? "+" : ""}${Math.abs(t)})`}
                      </span>
                    </span>
                  ))}
                  <span className="g1-op">=</span>
                  <Box answer={p.answer} show={showAnswers} />
                </span>
              </div>
            ))}
          </div>
        );

      case "pos-neg-mul-div":
        return (
          <div className="g1-page g1-cols-2">
            {mulDivProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  <span className="g1-val">{p.expr}</span>
                  <span className="g1-op">=</span>
                  <Box answer={p.answer} show={showAnswers} />
                </span>
              </div>
            ))}
          </div>
        );

      case "pos-neg-mixed":
        return (
          <div className="g1-page g1-cols-2">
            {mixedProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  <span className="g1-val">{p.expr}</span>
                  <span className="g1-op">=</span>
                  <Box answer={p.answer} show={showAnswers} />
                </span>
              </div>
            ))}
          </div>
        );

      case "absolute-value":
        return (
          <div className="dev-text-page">
            {absProblems.map((p, i) => {
              if (p.mode === "find") {
                return (
                  <div key={i} className="g1-problem">
                    <span className="g1-num">({i + 1})</span>
                    <span className="g1-expr">
                      <span className="g1-val">|{p.number}|</span>
                      <span className="g1-op">=</span>
                      <Box answer={p.answer!} show={showAnswers} />
                    </span>
                  </div>
                );
              }
              if (p.mode === "list") {
                return (
                  <div key={i} className="dev-text-row">
                    <span className="g1-num">({i + 1})</span>
                    <span className="dev-text-q">
                      絶対値が {p.threshold} 以下の整数をすべて書きなさい
                    </span>
                    <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                      {p.listAnswer!.join(", ")}
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} className="dev-text-row">
                  <span className="g1-num">({i + 1})</span>
                  <span className="dev-text-q">|x| = {p.eqValue} のとき x = ?</span>
                  <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                    x = ±{p.eqValue}
                  </span>
                </div>
              );
            })}
          </div>
        );

      case "prime":
        return (
          <div className="dev-text-page">
            {primeProblems.map((p, i) => {
              if (p.mode === "identify") {
                return (
                  <div key={i} className="dev-prop-block">
                    <div className="dev-prop-label">
                      ({i + 1}) 次の数のうち素数をすべて選びなさい
                    </div>
                    <div className="dev-text-q" style={{ fontSize: "1.1em" }}>
                      {p.numbers!.join(", ")}
                    </div>
                    <div className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                      {p.primes!.join(", ")}
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className="dev-text-row">
                  <span className="g1-num">({i + 1})</span>
                  <span className="dev-text-q">{p.target} を素因数分解しなさい</span>
                  <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                    {p.factorExpr}
                  </span>
                </div>
              );
            })}
          </div>
        );

      case "expr-value":
        return renderTextProblems(
          exprValProblems,
          (p) => `${p.varDisplay} のとき ${p.expr} の値は？`,
          (p) => p.answer,
        );

      case "linear-expr":
        return (
          <div className="g1-page g1-cols-2">
            {linExprProblems.map((p, i) => (
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

      case "linear-eq":
        return (
          <div className="g1-page g1-cols-2">
            {linEqProblems.map((p, i) => (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <span className="g1-expr">
                  <span className="g1-val">{p.equation}</span>
                </span>
                <span className="g1-expr" style={{ marginLeft: "1em" }}>
                  <span className="g1-op">x =</span>
                  <Box answer={p.answer} show={showAnswers} />
                </span>
              </div>
            ))}
          </div>
        );

      case "sector":
        return (
          <div className="dev-text-page">
            {sectorProblems.map((p, i) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1})</div>
                {renderSectorFigure(p)}
                <div style={{ marginTop: 8 }}>
                  <div className="dev-text-row">
                    <span className="dev-text-q">
                      半径 {p.radius}cm、中心角 {p.angle}° のおうぎ形の
                      {p.type === "arc" ? "弧の長さ" : "面積"}は？
                    </span>
                    <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                      {p.answerCoefficient === 1 ? "" : p.answerCoefficient}π {p.unit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "solid-volume":
        return (
          <div className="dev-text-page">
            {solidProblems.map((p, i) => {
              let question = "";
              if (p.solidType === "cylinder") {
                question = `底面の半径 ${p.radius}cm、高さ ${p.height}cm の円柱の${p.calcType === "volume" ? "体積" : "表面積"}は？`;
              } else if (p.solidType === "cone") {
                if (p.calcType === "volume") {
                  question = `底面の半径 ${p.radius}cm、高さ ${p.height}cm の円錐の体積は？`;
                } else {
                  question = `底面の半径 ${p.radius}cm、母線の長さ ${p.slantHeight}cm の円錐の表面積は？`;
                }
              } else if (p.solidType === "sphere") {
                question = `半径 ${p.radius}cm の球の${p.calcType === "volume" ? "体積" : "表面積"}は？`;
              } else {
                question = `底面の一辺 ${p.baseEdge}cm の${p.baseSides === 4 ? "正四" : "三"}角柱（高さ ${p.height}cm）の体積は？`;
              }
              return (
                <div key={i} className="dev-prop-block">
                  <div className="dev-prop-label">({i + 1})</div>
                  {renderSolidFigure(p)}
                  <div style={{ marginTop: 8 }}>
                    <div className="dev-text-row">
                      <span className="dev-text-q">{question}</span>
                      <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                        {p.answerDisplay}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case "proportion":
        return renderTextProblems(
          propProblems,
          (p) => p.question,
          (p) => p.answerDisplay,
        );

      case "data-analysis":
        return (
          <div className="dev-text-page">
            {dataProblems.map((p: DataAnalysisProblem, i: number) => {
              if (p.mode === "representative") {
                return (
                  <div key={i} className="dev-prop-block">
                    <div className="dev-prop-label">
                      ({i + 1}) データ: {p.data.join(", ")}
                    </div>
                    <div className="dev-text-row">
                      <span className="dev-text-q">平均値:</span>
                      <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.mean}</span>
                    </div>
                    <div className="dev-text-row">
                      <span className="dev-text-q">中央値:</span>
                      <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.median}</span>
                    </div>
                    <div className="dev-text-row">
                      <span className="dev-text-q">最頻値:</span>
                      <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.modeValue}</span>
                    </div>
                    <div className="dev-text-row">
                      <span className="dev-text-q">範囲:</span>
                      <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.range}</span>
                    </div>
                  </div>
                );
              }
              // frequency table
              return (
                <div key={i} className="dev-prop-block">
                  <div className="dev-prop-label">
                    ({i + 1}) 度数分布表を完成させなさい（合計 {p.total} 人）
                  </div>
                  <table className="dev-prop-table">
                    <thead>
                      <tr>
                        <th>階級</th>
                        <th>度数</th>
                        <th>相対度数</th>
                        <th>累積度数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.classes.map((cls, j) => {
                        const hidden = p.hiddenIndices.includes(j);
                        return (
                          <tr key={j}>
                            <td>{cls[0]}以上{cls[1]}未満</td>
                            <td className={hidden ? "dev-prop-blank" : ""}>
                              {hidden ? (
                                <span className={showAnswers ? "dev-frac-ans" : "g1-hidden"}>
                                  {p.frequencies[j]}
                                </span>
                              ) : (
                                p.frequencies[j]
                              )}
                            </td>
                            <td>{p.relativeFrequencies[j].toFixed(2)}</td>
                            <td>{p.cumulativeFrequencies[j]}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        );

      case "coordinate":
        return (
          <div className="dev-text-page">
            {coordProblems.map((p, i) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1})</div>
                {renderCoordinateFigure(p)}
                <div style={{ marginTop: 8 }}>
                  <div className="dev-text-row">
                    <span className="dev-text-q">
                      {p.type === "quadrant"
                        ? `点 (${p.x}, ${p.y}) は第何象限？`
                        : `${p.formula} のグラフは点 (${p.x}, ${p.y}) を通るか？`}
                    </span>
                    <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                      {p.answerDisplay}
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

export default Grade7;

export const devGrade7: ProblemGroup = {
  id: "dev7",
  label: "中1（開発中）",
  operators: [
    { operator: "pos-neg-add-sub", label: "正負の加減", grades: [7] },
    { operator: "pos-neg-mul-div", label: "正負の乗除", grades: [7] },
    { operator: "pos-neg-mixed", label: "正負の四則混合", grades: [7] },
    { operator: "absolute-value", label: "絶対値", grades: [7] },
    { operator: "prime", label: "素数・素因数分解", grades: [7] },
    { operator: "expr-value", label: "式の値", grades: [7] },
    { operator: "linear-expr", label: "一次式の計算", grades: [7] },
    { operator: "linear-eq", label: "一次方程式", grades: [7] },
    { operator: "sector", label: "おうぎ形", grades: [7] },
    { operator: "solid-volume", label: "立体の体積・表面積", grades: [7] },
    { operator: "proportion", label: "比例・反比例", grades: [7] },
    { operator: "data-analysis", label: "データの分析", grades: [7] },
    { operator: "coordinate", label: "座標", grades: [7] },
  ],
  Component: Grade7,
};
