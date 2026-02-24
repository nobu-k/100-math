import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateClock, type ClockProblem } from "./clock";
import ClockFace from "./ClockFace";

type Prec = "hour" | "half" | "5min" | "1min";

const PREC_DEF: Prec = "half";
const PREC_VALUES: readonly Prec[] = ["hour", "half", "5min", "1min"];
const PARAM_KEYS = ["prec"];

const Clock = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return { prec: parseEnum(p.get("prec"), PREC_VALUES, PREC_DEF) };
  });

  const [prec, setPrec] = useState(initial.prec);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (prec !== PREC_DEF) m.prec = prec;
    return m;
  }, [prec]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onPrecChange = useCallback((v: Prec) => {
    setPrec(v);
    const p: Record<string, string> = {};
    if (v !== PREC_DEF) p.prec = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateClock(seed, prec), [seed, prec]);

  const settingsPanel = (
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

  return (
    <ProblemPageLayout
      showAnswers={showAnswers}
      showSettings={showSettings}
      handleNew={handleNew}
      handleToggleAnswers={handleToggleAnswers}
      setShowSettings={setShowSettings}
      settingsPanel={settingsPanel}
      qrUrl={qrUrl}
    >
      {renderClockProblems(problems, showAnswers)}
    </ProblemPageLayout>
  );
};

const renderClockProblems = (items: ClockProblem[], showAnswers: boolean) => (
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

const parseEnum = <T extends string>(raw: string | null, values: readonly T[], def: T): T =>
  raw !== null && (values as readonly string[]).includes(raw) ? (raw as T) : def;

export default Clock;
