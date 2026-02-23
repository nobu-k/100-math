import { useState, useCallback, useMemo } from "react";
import type { ProblemGroup } from "./types";
import type { TextProblem } from "./shared/types";
import useProblemPage from "./shared/useProblemPage";
import ProblemPageLayout from "./shared/ProblemPageLayout";
import { generateClock, type ClockProblem } from "./measurement/clock";
import { generateUnitConv } from "./measurement/unit-conv";
import { generateTimeCalc } from "./measurement/time-calc";
import { generateUnitConv3 } from "./measurement/unit-conv3";
import { generateTimeCalc3 } from "./measurement/time-calc3";
import { generateSpeed } from "./measurement/speed";
import { generateUnitAmount } from "./measurement/unit-amount";
import { generateAverage } from "./measurement/average";

/* ================================================================
   Types & Defaults
   ================================================================ */

type MeasurementOp =
  | "clock"
  | "unit-conv"
  | "time-calc"
  | "unit-conv3"
  | "time-calc3"
  | "speed"
  | "unit-amount"
  | "average";

type Prec = "hour" | "half" | "5min" | "1min";
type UnitType = "mixed" | "length" | "volume";
type TimeType = "mixed" | "after" | "duration";
type Unit3Type = "mixed" | "length" | "weight";
type Time3Mode = "mixed" | "after" | "duration" | "seconds";
type SpeedFind = "mixed" | "distance" | "time" | "speed";

const PREC_DEF: Prec = "half";
const UNIT_DEF: UnitType = "mixed";
const TTYPE_DEF: TimeType = "mixed";
const UNIT3_DEF: Unit3Type = "mixed";
const T3MODE_DEF: Time3Mode = "mixed";
const SFIND_DEF: SpeedFind = "mixed";
const ACNT_DEF = 5;

const PARAM_KEYS = ["prec", "unit", "ttype", "unit3", "t3mode", "sfind", "acnt"];

const PREC_VALUES: readonly Prec[] = ["hour", "half", "5min", "1min"];
const UNIT_VALUES: readonly UnitType[] = ["mixed", "length", "volume"];
const TTYPE_VALUES: readonly TimeType[] = ["mixed", "after", "duration"];
const UNIT3_VALUES: readonly Unit3Type[] = ["mixed", "length", "weight"];
const T3MODE_VALUES: readonly Time3Mode[] = ["mixed", "after", "duration", "seconds"];
const SFIND_VALUES: readonly SpeedFind[] = ["mixed", "distance", "time", "speed"];

const parseEnum = <T extends string>(raw: string | null, values: readonly T[], def: T): T =>
  raw !== null && (values as readonly string[]).includes(raw) ? (raw as T) : def;

/* ================================================================
   Main component
   ================================================================ */

const Measurement = ({ operator }: { operator: string }) => {
  const op = operator as MeasurementOp;

  /* ---- read initial URL settings ---- */

  const getInitialSettings = () => {
    const p = new URLSearchParams(window.location.search);
    return {
      prec: parseEnum(p.get("prec"), PREC_VALUES, PREC_DEF),
      unit: parseEnum(p.get("unit"), UNIT_VALUES, UNIT_DEF),
      ttype: parseEnum(p.get("ttype"), TTYPE_VALUES, TTYPE_DEF),
      unit3: parseEnum(p.get("unit3"), UNIT3_VALUES, UNIT3_DEF),
      t3mode: parseEnum(p.get("t3mode"), T3MODE_VALUES, T3MODE_DEF),
      sfind: parseEnum(p.get("sfind"), SFIND_VALUES, SFIND_DEF),
      acnt: Math.max(3, Math.min(6,
        parseInt(p.get("acnt") ?? String(ACNT_DEF), 10) || ACNT_DEF)),
    };
  };

  const [initial] = useState(getInitialSettings);
  const [prec, setPrec] = useState(initial.prec);
  const [unit, setUnit] = useState(initial.unit);
  const [ttype, setTtype] = useState(initial.ttype);
  const [unit3, setUnit3] = useState(initial.unit3);
  const [t3mode, setT3mode] = useState(initial.t3mode);
  const [sfind, setSfind] = useState(initial.sfind);
  const [acnt, setAcnt] = useState(initial.acnt);

  /* ---- settings params for URL sync ---- */

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    switch (op) {
      case "clock":
        if (prec !== PREC_DEF) m.prec = prec;
        break;
      case "unit-conv":
        if (unit !== UNIT_DEF) m.unit = unit;
        break;
      case "time-calc":
        if (ttype !== TTYPE_DEF) m.ttype = ttype;
        break;
      case "unit-conv3":
        if (unit3 !== UNIT3_DEF) m.unit3 = unit3;
        break;
      case "time-calc3":
        if (t3mode !== T3MODE_DEF) m.t3mode = t3mode;
        break;
      case "speed":
        if (sfind !== SFIND_DEF) m.sfind = sfind;
        break;
      case "average":
        if (acnt !== ACNT_DEF) m.acnt = String(acnt);
        break;
      case "unit-amount":
        break;
    }
    return m;
  }, [op, prec, unit, ttype, unit3, t3mode, sfind, acnt]);

  /* ---- shared hook ---- */

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  /* ---- settings change handlers ---- */

  const onPrecChange = useCallback((v: Prec) => {
    setPrec(v);
    const p: Record<string, string> = {};
    if (v !== PREC_DEF) p.prec = v;
    regen(p);
  }, [regen]);

  const onUnitChange = useCallback((v: UnitType) => {
    setUnit(v);
    const p: Record<string, string> = {};
    if (v !== UNIT_DEF) p.unit = v;
    regen(p);
  }, [regen]);

  const onTtypeChange = useCallback((v: TimeType) => {
    setTtype(v);
    const p: Record<string, string> = {};
    if (v !== TTYPE_DEF) p.ttype = v;
    regen(p);
  }, [regen]);

  const onUnit3Change = useCallback((v: Unit3Type) => {
    setUnit3(v);
    const p: Record<string, string> = {};
    if (v !== UNIT3_DEF) p.unit3 = v;
    regen(p);
  }, [regen]);

  const onT3modeChange = useCallback((v: Time3Mode) => {
    setT3mode(v);
    const p: Record<string, string> = {};
    if (v !== T3MODE_DEF) p.t3mode = v;
    regen(p);
  }, [regen]);

  const onSfindChange = useCallback((v: SpeedFind) => {
    setSfind(v);
    const p: Record<string, string> = {};
    if (v !== SFIND_DEF) p.sfind = v;
    regen(p);
  }, [regen]);

  const onAcntChange = useCallback((v: number) => {
    setAcnt(v);
    const p: Record<string, string> = {};
    if (v !== ACNT_DEF) p.acnt = String(v);
    regen(p);
  }, [regen]);

  /* ---- generate problems ---- */

  const clockProblems = useMemo(
    () => op === "clock" ? generateClock(seed, prec) : [],
    [op, seed, prec],
  );
  const unitConvProblems = useMemo(
    () => op === "unit-conv" ? generateUnitConv(seed, unit) : [],
    [op, seed, unit],
  );
  const timeCalcProblems = useMemo(
    () => op === "time-calc" ? generateTimeCalc(seed, ttype) : [],
    [op, seed, ttype],
  );
  const unitConv3Problems = useMemo(
    () => op === "unit-conv3" ? generateUnitConv3(seed, unit3) : [],
    [op, seed, unit3],
  );
  const timeCalc3Problems = useMemo(
    () => op === "time-calc3" ? generateTimeCalc3(seed, t3mode) : [],
    [op, seed, t3mode],
  );
  const speedProblems = useMemo(
    () => op === "speed" ? generateSpeed(seed, sfind) : [],
    [op, seed, sfind],
  );
  const unitAmountProblems = useMemo(
    () => op === "unit-amount" ? generateUnitAmount(seed) : [],
    [op, seed],
  );
  const averageProblems = useMemo(
    () => op === "average" ? generateAverage(seed, acnt) : [],
    [op, seed, acnt],
  );

  /* ---- settings panel ---- */

  const renderSettings = () => {
    switch (op) {
      case "clock":
        return (
          <div className="no-print settings-panel">
            <label>
              むずかしさ{" "}
              <select className="operator-select" value={prec}
                onChange={(e) => onPrecChange(e.target.value as Prec)}>
                <option value="hour">ちょうど（○時）</option>
                <option value="half">30分（○時／○時半）</option>
                <option value="5min">5分きざみ</option>
                <option value="1min">1分きざみ</option>
              </select>
            </label>
          </div>
        );
      case "unit-conv":
        return (
          <div className="no-print settings-panel">
            <label>
              単位{" "}
              <select className="operator-select" value={unit}
                onChange={(e) => onUnitChange(e.target.value as UnitType)}>
                <option value="mixed">すべて</option>
                <option value="length">長さ（mm・cm・m）</option>
                <option value="volume">かさ（mL・dL・L）</option>
              </select>
            </label>
          </div>
        );
      case "time-calc":
        return (
          <div className="no-print settings-panel">
            <label>
              問題の種類{" "}
              <select className="operator-select" value={ttype}
                onChange={(e) => onTtypeChange(e.target.value as TimeType)}>
                <option value="mixed">すべて</option>
                <option value="after">時刻を求める</option>
                <option value="duration">時間を求める</option>
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
                onChange={(e) => onUnit3Change(e.target.value as Unit3Type)}>
                <option value="mixed">すべて</option>
                <option value="length">長さ（m・km）</option>
                <option value="weight">重さ（g・kg・t）</option>
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
                onChange={(e) => onT3modeChange(e.target.value as Time3Mode)}>
                <option value="mixed">すべて</option>
                <option value="after">時刻を求める</option>
                <option value="duration">時間を求める</option>
                <option value="seconds">秒の計算</option>
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
                onChange={(e) => onSfindChange(e.target.value as SpeedFind)}>
                <option value="mixed">すべて</option>
                <option value="distance">距離</option>
                <option value="time">時間</option>
                <option value="speed">速さ</option>
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
      case "unit-amount":
        return null;
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

  const renderClockProblems = (items: ClockProblem[]) => (
    <div className="g1-clock-grid">
      {items.map((p, i) => (
        <div key={i} className="g1-clock-item">
          <span className="g1-num">({i + 1})</span>
          <ClockFace hour={p.hour} minute={p.minute} />
          <span className={`g1-clock-answer${showAnswers ? "" : " g1-hidden"}`}>
            {p.minute === 0 ? `${p.hour}時` : `${p.hour}時${p.minute}分`}
          </span>
        </div>
      ))}
    </div>
  );

  /* ---- render problems ---- */

  const renderProblems = () => {
    switch (op) {
      case "clock":
        return renderClockProblems(clockProblems);
      case "unit-conv":
        return renderTextProblems(unitConvProblems);
      case "time-calc":
        return renderTextProblems(timeCalcProblems);
      case "unit-conv3":
        return renderTextProblems(unitConv3Problems);
      case "time-calc3":
        return renderTextProblems(timeCalc3Problems);
      case "speed":
        return renderTextProblems(speedProblems);
      case "unit-amount":
        return renderTextProblems(unitAmountProblems);
      case "average":
        return renderTextProblems(averageProblems);
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
   ClockFace SVG
   ================================================================ */

const ClockFace = ({ hour, minute }: { hour: number; minute: number }) => {
  const cx = 100, cy = 100, r = 88;
  const hourAngle = ((hour % 12) + minute / 60) * 30;
  const minuteAngle = minute * 6;

  const hand = (angle: number, len: number, w: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return (
      <line x1={cx} y1={cy} x2={cx + len * Math.cos(rad)} y2={cy + len * Math.sin(rad)}
        stroke="#000" strokeWidth={w} strokeLinecap="round" />
    );
  };

  return (
    <svg className="g1-clock-svg" viewBox="0 0 200 200">
      <circle cx={cx} cy={cy} r={r} fill="#fff" stroke="#000" strokeWidth="3" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = ((i * 30 - 90) * Math.PI) / 180;
        const inner = r - 10;
        const numR = r - 22;
        return (
          <g key={i}>
            <line x1={cx + inner * Math.cos(a)} y1={cy + inner * Math.sin(a)}
              x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="#000" strokeWidth="3" />
            <text x={cx + numR * Math.cos(a)} y={cy + numR * Math.sin(a)}
              textAnchor="middle" dominantBaseline="central" fontSize="18" fontWeight="bold" fill="#000">
              {i === 0 ? 12 : i}
            </text>
          </g>
        );
      })}
      {Array.from({ length: 60 }, (_, i) => {
        if (i % 5 === 0) return null;
        const a = ((i * 6 - 90) * Math.PI) / 180;
        return (
          <line key={i} x1={cx + (r - 4) * Math.cos(a)} y1={cy + (r - 4) * Math.sin(a)}
            x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="#000" strokeWidth="1" />
        );
      })}
      {hand(hourAngle, 48, 5)}
      {hand(minuteAngle, 68, 3)}
      <circle cx={cx} cy={cy} r="4" fill="#000" />
    </svg>
  );
};

/* ================================================================
   Export
   ================================================================ */

export const measurement: ProblemGroup = {
  id: "measurement",
  label: "測定",
  operators: [
    { operator: "clock", label: "時計のよみ方", grades: [1], category: "measurement" },
    { operator: "unit-conv", label: "単位の換算", grades: [2], category: "measurement" },
    { operator: "time-calc", label: "時刻と時間", grades: [2], category: "measurement" },
    { operator: "unit-conv3", label: "単位の換算", grades: [3], category: "measurement" },
    { operator: "time-calc3", label: "時刻と時間（3年）", grades: [3], category: "measurement" },
    { operator: "speed", label: "速さ・時間・距離", grades: [5], category: "measurement" },
    { operator: "unit-amount", label: "単位量あたり", grades: [5], category: "measurement" },
    { operator: "average", label: "平均", grades: [5], category: "measurement" },
  ],
  Component: Measurement,
};
