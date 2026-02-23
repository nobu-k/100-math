import { useState, useCallback, useMemo } from "react";
import type { ProblemGroup } from "./types";
import type { TextProblem } from "./shared/types";
import type { AreaProblem } from "./geometry/area";
import type { AngleProblem } from "./geometry/angle";
import type { AreaFormulaProblem } from "./geometry/area-formula";
import type { VolumeProblem } from "./geometry/volume";
import type { CircumferenceProblem } from "./geometry/circumference";
import type { CircleRDProblem } from "./geometry/circle-rd";
import type { CircleAreaProblem } from "./geometry/circle-area";
import type { PrismVolumeProblem } from "./geometry/prism-volume";
import type { SectorProblem, SectorMode } from "./geometry/sector";
import type { SolidProblem, SolidMode } from "./geometry/solid-volume";
import type { PolygonAngleMode } from "./geometry/polygon-angle";
import type { TriAngleMode } from "./geometry/triangle-angle";
import type { ParallelAngleMode } from "./geometry/parallel-angle";
import type { ParallelogramMode } from "./geometry/parallelogram";
import type { SimilarityMode } from "./geometry/similarity";
import type { CircleAngleMode } from "./geometry/circle-angle";
import type { PythagoreanMode } from "./geometry/pythagorean";
import { M, texBox } from "./shared/M";
import { unicodeToLatex } from "./shared/katex-utils";
import useProblemPage from "./shared/useProblemPage";
import ProblemPageLayout from "./shared/ProblemPageLayout";
import { generateCircleRD } from "./geometry/circle-rd";
import { generateArea } from "./geometry/area";
import { generateAngle } from "./geometry/angle";
import { generateAreaUnit } from "./geometry/area-unit";
import { generateAreaFormula } from "./geometry/area-formula";
import { generateVolume } from "./geometry/volume";
import { generateCircumference } from "./geometry/circumference";
import { generateCircleArea } from "./geometry/circle-area";
import { generatePrismVolume } from "./geometry/prism-volume";
import { generateScale } from "./geometry/scale";
import { generateSector } from "./geometry/sector";
import { generateSolid } from "./geometry/solid-volume";
import { generatePolygonAngle } from "./geometry/polygon-angle";
import { generateTriAngle } from "./geometry/triangle-angle";
import { generateParallelAngle } from "./geometry/parallel-angle";
import { generateParallelogram } from "./geometry/parallelogram";
import { generateSimilarity } from "./geometry/similarity";
import { generateCircleAngle } from "./geometry/circle-angle";
import { generatePythagorean } from "./geometry/pythagorean";
import CircleRDFig from "./geometry/figures/circle-rd-fig";
import AreaFig from "./geometry/figures/area-fig";
import AngleFig from "./geometry/figures/angle-fig";
import AreaFormulaFig from "./geometry/figures/area-formula-fig";
import VolumeFig from "./geometry/figures/volume-fig";
import CircumferenceFig from "./geometry/figures/circumference-fig";
import CircleAreaFig from "./geometry/figures/circle-area-fig";
import PrismVolumeFig from "./geometry/figures/prism-volume-fig";
import SectorFig from "./geometry/figures/sector-fig";
import SolidVolumeFig from "./geometry/figures/solid-volume-fig";
import PolygonAngleFig from "./geometry/figures/polygon-angle-fig";
import TriangleAngleFig from "./geometry/figures/triangle-angle-fig";
import ParallelAngleFig from "./geometry/figures/parallel-angle-fig";
import ParallelogramFig from "./geometry/figures/parallelogram-fig";
import SimilarityFig from "./geometry/figures/similarity-fig";
import CircleAngleFig from "./geometry/figures/circle-angle-fig";
import PythagoreanFig from "./geometry/figures/pythagorean-fig";

/* ================================================================
   Types
   ================================================================ */

type GeometryOp =
  | "circle-rd"
  | "area"
  | "angle"
  | "area-unit"
  | "area-formula"
  | "volume"
  | "circumference"
  | "circle-area"
  | "prism-volume"
  | "scale"
  | "sector"
  | "solid-volume"
  | "polygon-angle"
  | "triangle-angle"
  | "parallel-angle"
  | "parallelogram"
  | "similarity"
  | "circle-angle"
  | "pythagorean";

/* ================================================================
   Defaults
   ================================================================ */

const AREA_DEF = { shape: "mixed" as const };
const AUNIT_DEF = { aunit: "mixed" as const };
const ASHAPE_DEF = { ashape: "mixed" as const };
const VSHAPE_DEF = { vshape: "mixed" as const };
const CMODE_DEF = { cmode: "mixed" as const };
const CTYPE_DEF = { ctype: "mixed" as const };
const PVSHAPE_DEF = { pvshape: "mixed" as const };
const SECMODE_DEF = { secmode: "mixed" as SectorMode };
const SOLMODE_DEF = { solmode: "mixed" as SolidMode };
const PAMODE_DEF = { pamode: "mixed" as PolygonAngleMode };
const TAMODE_DEF = { tamode: "mixed" as TriAngleMode };
const PLMODE_DEF = { plmode: "mixed" as ParallelAngleMode };
const PGMODE_DEF = { pgmode: "mixed" as ParallelogramMode };
const SMMODE_DEF = { smmode: "mixed" as SimilarityMode };
const CAMODE_DEF = { camode: "mixed" as CircleAngleMode };
const PTMODE_DEF = { ptmode: "mixed" as PythagoreanMode };

/* ================================================================
   URL param keys for this category
   ================================================================ */

const PARAM_KEYS = [
  "shape", "aunit", "ashape", "vshape", "cmode", "ctype", "pvshape",
  "secmode", "solmode", "pamode", "tamode", "plmode", "pgmode",
  "smmode", "camode", "ptmode",
];

/* ================================================================
   Main component
   ================================================================ */

const Geometry = ({ operator }: { operator: string }) => {
  const op = operator as GeometryOp;

  /* ---- parse initial URL settings ---- */

  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);

    const shapeRaw = p.get("shape") ?? AREA_DEF.shape;
    const shape: "square" | "rect" | "mixed" =
      (["square", "rect", "mixed"] as const).includes(shapeRaw as any)
        ? (shapeRaw as any) : AREA_DEF.shape;

    const aunitRaw = p.get("aunit") ?? AUNIT_DEF.aunit;
    const aunit: "cm-m" | "m-ha" | "mixed" =
      (["cm-m", "m-ha", "mixed"] as const).includes(aunitRaw as any)
        ? (aunitRaw as any) : AUNIT_DEF.aunit;

    const ashapeRaw = p.get("ashape") ?? ASHAPE_DEF.ashape;
    const ashape: "triangle" | "parallelogram" | "trapezoid" | "mixed" =
      (["triangle", "parallelogram", "trapezoid", "mixed"] as const).includes(ashapeRaw as any)
        ? (ashapeRaw as any) : ASHAPE_DEF.ashape;

    const vshapeRaw = p.get("vshape") ?? VSHAPE_DEF.vshape;
    const vshape: "cube" | "rect" | "mixed" =
      (["cube", "rect", "mixed"] as const).includes(vshapeRaw as any)
        ? (vshapeRaw as any) : VSHAPE_DEF.vshape;

    const cmodeRaw = p.get("cmode") ?? CMODE_DEF.cmode;
    const cmode: "forward" | "reverse" | "mixed" =
      (["forward", "reverse", "mixed"] as const).includes(cmodeRaw as any)
        ? (cmodeRaw as any) : CMODE_DEF.cmode;

    const ctypeRaw = p.get("ctype") ?? CTYPE_DEF.ctype;
    const ctype: "basic" | "half" | "mixed" =
      (["basic", "half", "mixed"] as const).includes(ctypeRaw as any)
        ? (ctypeRaw as any) : CTYPE_DEF.ctype;

    const pvshapeRaw = p.get("pvshape") ?? PVSHAPE_DEF.pvshape;
    const pvshape: "prism" | "cylinder" | "mixed" =
      (["prism", "cylinder", "mixed"] as const).includes(pvshapeRaw as any)
        ? (pvshapeRaw as any) : PVSHAPE_DEF.pvshape;

    const secmodeRaw = p.get("secmode") ?? SECMODE_DEF.secmode;
    const secmode = (["arc", "area", "mixed"] as const).includes(secmodeRaw as any)
      ? (secmodeRaw as SectorMode) : SECMODE_DEF.secmode;

    const solmodeRaw = p.get("solmode") ?? SOLMODE_DEF.solmode;
    const solmode = (["cylinder", "cone", "sphere", "prism", "mixed"] as const).includes(solmodeRaw as any)
      ? (solmodeRaw as SolidMode) : SOLMODE_DEF.solmode;

    const pamodeRaw = p.get("pamode") ?? PAMODE_DEF.pamode;
    const pamode = (["interior-sum", "regular", "exterior", "find-n", "mixed"] as const).includes(pamodeRaw as any)
      ? (pamodeRaw as PolygonAngleMode) : PAMODE_DEF.pamode;

    const tamodeRaw = p.get("tamode") ?? TAMODE_DEF.tamode;
    const tamode = (["interior", "exterior", "mixed"] as const).includes(tamodeRaw as any)
      ? (tamodeRaw as TriAngleMode) : TAMODE_DEF.tamode;

    const plmodeRaw = p.get("plmode") ?? PLMODE_DEF.plmode;
    const plmode = (["vertical", "corresponding", "alternate", "mixed"] as const).includes(plmodeRaw as any)
      ? (plmodeRaw as ParallelAngleMode) : PLMODE_DEF.plmode;

    const pgmodeRaw = p.get("pgmode") ?? PGMODE_DEF.pgmode;
    const pgmode = (["sides", "angles", "diagonals", "mixed"] as const).includes(pgmodeRaw as any)
      ? (pgmodeRaw as ParallelogramMode) : PGMODE_DEF.pgmode;

    const smmodeRaw = p.get("smmode") ?? SMMODE_DEF.smmode;
    const smmode = (["ratio", "parallel-line", "midpoint", "mixed"] as const).includes(smmodeRaw as any)
      ? (smmodeRaw as SimilarityMode) : SMMODE_DEF.smmode;

    const camodeRaw = p.get("camode") ?? CAMODE_DEF.camode;
    const camode = (["basic", "inscribed", "mixed"] as const).includes(camodeRaw as any)
      ? (camodeRaw as CircleAngleMode) : CAMODE_DEF.camode;

    const ptmodeRaw = p.get("ptmode") ?? PTMODE_DEF.ptmode;
    const ptmode = (["basic", "special", "applied", "mixed"] as const).includes(ptmodeRaw as any)
      ? (ptmodeRaw as PythagoreanMode) : PTMODE_DEF.ptmode;

    return { shape, aunit, ashape, vshape, cmode, ctype, pvshape, secmode, solmode, pamode, tamode, plmode, pgmode, smmode, camode, ptmode };
  });

  /* ---- per-operator settings state ---- */

  const [shape, setShape] = useState(initial.shape);
  const [aunit, setAunit] = useState(initial.aunit);
  const [ashape, setAshape] = useState(initial.ashape);
  const [vshape, setVshape] = useState(initial.vshape);
  const [cmode, setCmode] = useState(initial.cmode);
  const [ctype, setCtype] = useState(initial.ctype);
  const [pvshape, setPvshape] = useState(initial.pvshape);
  const [secmode, setSecmode] = useState(initial.secmode);
  const [solmode, setSolmode] = useState(initial.solmode);
  const [pamode, setPamode] = useState(initial.pamode);
  const [tamode, setTamode] = useState(initial.tamode);
  const [plmode, setPlmode] = useState(initial.plmode);
  const [pgmode, setPgmode] = useState(initial.pgmode);
  const [smmode, setSmmode] = useState(initial.smmode);
  const [camode, setCamode] = useState(initial.camode);
  const [ptmode, setPtmode] = useState(initial.ptmode);

  /* ---- getSettingsParams ---- */

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    switch (op) {
      case "circle-rd":
        break;
      case "area":
        if (shape !== AREA_DEF.shape) m.shape = shape;
        break;
      case "angle":
        break;
      case "area-unit":
        if (aunit !== AUNIT_DEF.aunit) m.aunit = aunit;
        break;
      case "area-formula":
        if (ashape !== ASHAPE_DEF.ashape) m.ashape = ashape;
        break;
      case "volume":
        if (vshape !== VSHAPE_DEF.vshape) m.vshape = vshape;
        break;
      case "circumference":
        if (cmode !== CMODE_DEF.cmode) m.cmode = cmode;
        break;
      case "circle-area":
        if (ctype !== CTYPE_DEF.ctype) m.ctype = ctype;
        break;
      case "prism-volume":
        if (pvshape !== PVSHAPE_DEF.pvshape) m.pvshape = pvshape;
        break;
      case "scale":
        break;
      case "sector":
        if (secmode !== SECMODE_DEF.secmode) m.secmode = secmode;
        break;
      case "solid-volume":
        if (solmode !== SOLMODE_DEF.solmode) m.solmode = solmode;
        break;
      case "polygon-angle":
        if (pamode !== PAMODE_DEF.pamode) m.pamode = pamode;
        break;
      case "triangle-angle":
        if (tamode !== TAMODE_DEF.tamode) m.tamode = tamode;
        break;
      case "parallel-angle":
        if (plmode !== PLMODE_DEF.plmode) m.plmode = plmode;
        break;
      case "parallelogram":
        if (pgmode !== PGMODE_DEF.pgmode) m.pgmode = pgmode;
        break;
      case "similarity":
        if (smmode !== SMMODE_DEF.smmode) m.smmode = smmode;
        break;
      case "circle-angle":
        if (camode !== CAMODE_DEF.camode) m.camode = camode;
        break;
      case "pythagorean":
        if (ptmode !== PTMODE_DEF.ptmode) m.ptmode = ptmode;
        break;
    }
    return m;
  }, [op, shape, aunit, ashape, vshape, cmode, ctype, pvshape, secmode, solmode, pamode, tamode, plmode, pgmode, smmode, camode, ptmode]);

  /* ---- shared hook ---- */

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

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

  const circleRDProblems = useMemo(
    () => op === "circle-rd" ? generateCircleRD(seed) : [],
    [op, seed],
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
  const areaFormulaProblems = useMemo(
    () => op === "area-formula" ? generateAreaFormula(seed, ashape) : [],
    [op, seed, ashape],
  );
  const volumeProblems = useMemo(
    () => op === "volume" ? generateVolume(seed, vshape) : [],
    [op, seed, vshape],
  );
  const circumferenceProblems = useMemo(
    () => op === "circumference" ? generateCircumference(seed, cmode) : [],
    [op, seed, cmode],
  );
  const circleAreaProblems = useMemo(
    () => op === "circle-area" ? generateCircleArea(seed, ctype) : [],
    [op, seed, ctype],
  );
  const prismVolumeProblems = useMemo(
    () => op === "prism-volume" ? generatePrismVolume(seed, pvshape) : [],
    [op, seed, pvshape],
  );
  const scaleProblems = useMemo(
    () => op === "scale" ? generateScale(seed) : [],
    [op, seed],
  );
  const sectorProblems = useMemo(
    () => op === "sector" ? generateSector(seed, secmode) : [],
    [op, seed, secmode],
  );
  const solidProblems = useMemo(
    () => op === "solid-volume" ? generateSolid(seed, solmode) : [],
    [op, seed, solmode],
  );
  const polygonAngleProblems = useMemo(
    () => op === "polygon-angle" ? generatePolygonAngle(seed, pamode) : [],
    [op, seed, pamode],
  );
  const triangleAngleProblems = useMemo(
    () => op === "triangle-angle" ? generateTriAngle(seed, tamode) : [],
    [op, seed, tamode],
  );
  const parallelAngleProblems = useMemo(
    () => op === "parallel-angle" ? generateParallelAngle(seed, plmode) : [],
    [op, seed, plmode],
  );
  const parallelogramProblems = useMemo(
    () => op === "parallelogram" ? generateParallelogram(seed, pgmode) : [],
    [op, seed, pgmode],
  );
  const similarityProblems = useMemo(
    () => op === "similarity" ? generateSimilarity(seed, smmode) : [],
    [op, seed, smmode],
  );
  const circleAngleProblems = useMemo(
    () => op === "circle-angle" ? generateCircleAngle(seed, camode) : [],
    [op, seed, camode],
  );
  const pythagoreanProblems = useMemo(
    () => op === "pythagorean" ? generatePythagorean(seed, ptmode) : [],
    [op, seed, ptmode],
  );

  /* ---- settings panel ---- */

  const renderSettings = () => {
    switch (op) {
      case "circle-rd":
        return null;
      case "area":
        return (
          <div className="no-print settings-panel">
            <label>
              {"図形 "}
              <select className="operator-select" value={shape}
                onChange={(e) => onSettingChange(setShape, "shape", AREA_DEF.shape)(e.target.value as any)}>
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
              {"単位 "}
              <select className="operator-select" value={aunit}
                onChange={(e) => onSettingChange(setAunit, "aunit", AUNIT_DEF.aunit)(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="cm-m">cm²・m²</option>
                <option value="m-ha">m²・ha・km²</option>
              </select>
            </label>
          </div>
        );
      case "area-formula":
        return (
          <div className="no-print settings-panel">
            <label>
              {"図形 "}
              <select className="operator-select" value={ashape}
                onChange={(e) => onSettingChange(setAshape, "ashape", ASHAPE_DEF.ashape)(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="triangle">三角形</option>
                <option value="parallelogram">平行四辺形</option>
                <option value="trapezoid">台形</option>
              </select>
            </label>
          </div>
        );
      case "volume":
        return (
          <div className="no-print settings-panel">
            <label>
              {"形 "}
              <select className="operator-select" value={vshape}
                onChange={(e) => onSettingChange(setVshape, "vshape", VSHAPE_DEF.vshape)(e.target.value as any)}>
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
              {"問題の種類 "}
              <select className="operator-select" value={cmode}
                onChange={(e) => onSettingChange(setCmode, "cmode", CMODE_DEF.cmode)(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="forward">円周を求める</option>
                <option value="reverse">直径を求める</option>
              </select>
            </label>
          </div>
        );
      case "circle-area":
        return (
          <div className="no-print settings-panel">
            <label>
              {"問題の種類 "}
              <select className="operator-select" value={ctype}
                onChange={(e) => onSettingChange(setCtype, "ctype", CTYPE_DEF.ctype)(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="basic">円</option>
                <option value="half">半円</option>
              </select>
            </label>
          </div>
        );
      case "prism-volume":
        return (
          <div className="no-print settings-panel">
            <label>
              {"形 "}
              <select className="operator-select" value={pvshape}
                onChange={(e) => onSettingChange(setPvshape, "pvshape", PVSHAPE_DEF.pvshape)(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="prism">角柱</option>
                <option value="cylinder">円柱</option>
              </select>
            </label>
          </div>
        );
      case "scale":
        return null;
      case "sector":
        return (
          <div className="no-print settings-panel">
            <label>
              {"種類 "}
              <select className="operator-select" value={secmode}
                onChange={(e) => onSettingChange(setSecmode, "secmode", SECMODE_DEF.secmode)(e.target.value as SectorMode)}>
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
              {"種類 "}
              <select className="operator-select" value={solmode}
                onChange={(e) => onSettingChange(setSolmode, "solmode", SOLMODE_DEF.solmode)(e.target.value as SolidMode)}>
                <option value="mixed">すべて</option>
                <option value="cylinder">円柱</option>
                <option value="cone">円錐</option>
                <option value="sphere">球</option>
                <option value="prism">角柱</option>
              </select>
            </label>
          </div>
        );
      case "polygon-angle":
        return (
          <div className="no-print settings-panel">
            <label>
              {"種類 "}
              <select className="operator-select" value={pamode}
                onChange={(e) => onSettingChange(setPamode, "pamode", PAMODE_DEF.pamode)(e.target.value as PolygonAngleMode)}>
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
              {"種類 "}
              <select className="operator-select" value={tamode}
                onChange={(e) => onSettingChange(setTamode, "tamode", TAMODE_DEF.tamode)(e.target.value as TriAngleMode)}>
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
              {"種類 "}
              <select className="operator-select" value={plmode}
                onChange={(e) => onSettingChange(setPlmode, "plmode", PLMODE_DEF.plmode)(e.target.value as ParallelAngleMode)}>
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
              {"種類 "}
              <select className="operator-select" value={pgmode}
                onChange={(e) => onSettingChange(setPgmode, "pgmode", PGMODE_DEF.pgmode)(e.target.value as ParallelogramMode)}>
                <option value="mixed">すべて</option>
                <option value="sides">辺</option>
                <option value="angles">角度</option>
                <option value="diagonals">対角線</option>
              </select>
            </label>
          </div>
        );
      case "similarity":
        return (
          <div className="no-print settings-panel">
            <label>
              {"種類 "}
              <select className="operator-select" value={smmode}
                onChange={(e) => onSettingChange(setSmmode, "smmode", SMMODE_DEF.smmode)(e.target.value as SimilarityMode)}>
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
              {"種類 "}
              <select className="operator-select" value={camode}
                onChange={(e) => onSettingChange(setCamode, "camode", CAMODE_DEF.camode)(e.target.value as CircleAngleMode)}>
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
              {"種類 "}
              <select className="operator-select" value={ptmode}
                onChange={(e) => onSettingChange(setPtmode, "ptmode", PTMODE_DEF.ptmode)(e.target.value as PythagoreanMode)}>
                <option value="mixed">すべて</option>
                <option value="basic">基本</option>
                <option value="special">特殊な直角三角形</option>
                <option value="applied">応用</option>
              </select>
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  /* ---- render helpers ---- */

  const renderTextProblems = (items: TextProblem[]) => (
    <div className="dev-text-page">
      {items.map((p, i) => (
        <div key={i} className="dev-text-row">
          <span className="g1-num">({i + 1})</span>
          <span className="dev-text-q">{p.question}</span>
          <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.answer}</span>
        </div>
      ))}
    </div>
  );

  const renderFigProblems = <T extends { question: string; answer: string }>(
    items: T[],
    FigComponent: React.ComponentType<{ problem: T }>,
  ) => (
    <div className="dev-fig-page">
      {items.map((p, i) => (
        <div key={i} className="dev-prop-block">
          <div className="dev-prop-label">({i + 1})</div>
          <FigComponent problem={p} />
          <div style={{ marginTop: 8 }}>
            <div className="dev-text-row">
              <span className="dev-text-q">{p.question}</span>
              <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                <M tex={unicodeToLatex(p.answer)} />
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFigProblemsQA = <T extends { question: string; answerDisplay: string }>(
    items: T[],
    FigComponent: React.ComponentType<{ problem: T }>,
  ) => (
    <div className="dev-fig-page">
      {items.map((p, i) => (
        <div key={i} className="dev-prop-block">
          <div className="dev-prop-label">({i + 1})</div>
          <FigComponent problem={p} />
          <div className="dev-text-q">{p.question}</div>
          <div className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
            <M tex={unicodeToLatex(p.answerDisplay)} />
          </div>
        </div>
      ))}
    </div>
  );

  /* ---- render problems ---- */

  const renderProblems = () => {
    switch (op) {
      case "circle-rd":
        return renderFigProblems<CircleRDProblem>(circleRDProblems, CircleRDFig);

      case "area":
        return renderFigProblems<AreaProblem>(areaProblems, AreaFig);

      case "angle":
        return (
          <div className="dev-fig-page">
            {angleProblems.map((p: AngleProblem, i: number) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1})</div>
                <AngleFig problem={p} />
                <div style={{ marginTop: 8 }}>
                  <div className="dev-text-row">
                    <M tex={`${unicodeToLatex(p.display)} = ${texBox(p.answer + "^{\\circ}", showAnswers)}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "area-unit":
        return renderTextProblems(areaUnitProblems);

      case "area-formula":
        return renderFigProblems<AreaFormulaProblem>(areaFormulaProblems, AreaFormulaFig);

      case "volume":
        return renderFigProblems<VolumeProblem>(volumeProblems, VolumeFig);

      case "circumference":
        return renderFigProblems<CircumferenceProblem>(circumferenceProblems, CircumferenceFig);

      case "circle-area":
        return renderFigProblems<CircleAreaProblem>(circleAreaProblems, CircleAreaFig);

      case "prism-volume":
        return renderFigProblems<PrismVolumeProblem>(prismVolumeProblems, PrismVolumeFig);

      case "scale":
        return renderTextProblems(scaleProblems);

      case "sector":
        return (
          <div className="dev-fig-page">
            {sectorProblems.map((p: SectorProblem, i: number) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1})</div>
                <SectorFig problem={p} />
                <div style={{ marginTop: 8 }}>
                  <div className="dev-text-row">
                    <span className="dev-text-q">
                      {"半径 "}{p.radius}{"cm、中心角 "}{p.angle}{"° のおうぎ形の"}
                      {p.type === "arc" ? "弧の長さ" : "面積"}{"は？"}
                    </span>
                    <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                      <M tex={`${p.answerCoefficient === 1 ? "" : p.answerCoefficient}\\pi \\text{ ${p.unit}}`} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "solid-volume":
        return (
          <div className="dev-fig-page">
            {solidProblems.map((p: SolidProblem, i: number) => {
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
                  <SolidVolumeFig problem={p} />
                  <div style={{ marginTop: 8 }}>
                    <div className="dev-text-row">
                      <span className="dev-text-q">{question}</span>
                      <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                        <M tex={unicodeToLatex(p.answerDisplay)} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case "polygon-angle":
        return renderFigProblemsQA(polygonAngleProblems, PolygonAngleFig);

      case "triangle-angle":
        return renderFigProblemsQA(triangleAngleProblems, TriangleAngleFig);

      case "parallel-angle":
        return renderFigProblemsQA(parallelAngleProblems, ParallelAngleFig);

      case "parallelogram":
        return renderFigProblemsQA(parallelogramProblems, ParallelogramFig);

      case "similarity":
        return renderFigProblemsQA(similarityProblems, SimilarityFig);

      case "circle-angle":
        return renderFigProblemsQA(circleAngleProblems, CircleAngleFig);

      case "pythagorean":
        return renderFigProblemsQA(pythagoreanProblems, PythagoreanFig);

      default:
        return <p>不明な問題タイプです</p>;
    }
  };

  return (
    <ProblemPageLayout
      showAnswers={showAnswers}
      showSettings={showSettings}
      handleNew={handleNew}
      handleToggleAnswers={handleToggleAnswers}
      setShowSettings={setShowSettings}
      settingsPanel={renderSettings()}
      qrUrl={qrUrl}
    >
      {renderProblems()}
    </ProblemPageLayout>
  );
};

/* ================================================================
   Exported group definition
   ================================================================ */

export const geometry: ProblemGroup = {
  id: "geometry",
  label: "図形",
  operators: [
    { operator: "circle-rd", label: "円の半径と直径", grades: [3], category: "geometry" },
    { operator: "area", label: "面積", grades: [4], category: "geometry" },
    { operator: "angle", label: "角度", grades: [4], category: "geometry" },
    { operator: "area-unit", label: "面積の単位換算", grades: [4], category: "geometry" },
    { operator: "area-formula", label: "面積の公式", grades: [5], category: "geometry" },
    { operator: "volume", label: "体積", grades: [5], category: "geometry" },
    { operator: "circumference", label: "円周", grades: [5], category: "geometry" },
    { operator: "circle-area", label: "円の面積", grades: [6], category: "geometry" },
    { operator: "prism-volume", label: "角柱・円柱の体積", grades: [6], category: "geometry" },
    { operator: "scale", label: "縮尺", grades: [6], category: "geometry" },
    { operator: "sector", label: "おうぎ形", grades: [7], category: "geometry" },
    { operator: "solid-volume", label: "立体の体積・表面積", grades: [7], category: "geometry" },
    { operator: "polygon-angle", label: "多角形の角", grades: [8], category: "geometry" },
    { operator: "triangle-angle", label: "三角形の角度", grades: [8], category: "geometry" },
    { operator: "parallel-angle", label: "平行線と角", grades: [8], category: "geometry" },
    { operator: "parallelogram", label: "平行四辺形", grades: [8], category: "geometry" },
    { operator: "similarity", label: "相似", grades: [9], category: "geometry" },
    { operator: "circle-angle", label: "円周角", grades: [9], category: "geometry" },
    { operator: "pythagorean", label: "三平方の定理", grades: [9], category: "geometry" },
  ],
  Component: Geometry,
};
