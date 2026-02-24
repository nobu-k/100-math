import { useState, useCallback, useMemo } from "react";
import type { SamplingMode } from "./sampling";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateSampling } from "./sampling";

const SPMODE_DEF: SamplingMode = "mixed";
const SPMODE_VALUES: readonly SamplingMode[] = ["mixed", "concept", "estimation"];
const PARAM_KEYS = ["spmode"];

const Sampling = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return {
      spmode: parseEnum(p.get("spmode"), SPMODE_VALUES, SPMODE_DEF),
    };
  });

  const [spmode, setSpmode] = useState(initial.spmode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (spmode !== SPMODE_DEF) m.spmode = spmode;
    return m;
  }, [spmode]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onSpmodeChange = useCallback((v: SamplingMode) => {
    setSpmode(v);
    const p: Record<string, string> = {};
    if (v !== SPMODE_DEF) p.spmode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateSampling(seed, spmode), [seed, spmode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select className="operator-select" value={spmode}
          onChange={(e) => onSpmodeChange(e.target.value as SamplingMode)}>
          <option value="mixed">すべて</option>
          <option value="concept">概念</option>
          <option value="estimation">推定</option>
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
      <div className="dev-text-page">
        {problems.map((p, i) => (
          <div key={i} className="dev-text-row">
            <span className="g1-num">({i + 1})</span>
            <span className="dev-text-q">{p.question}</span>
            <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.answerDisplay}</span>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

const parseEnum = <T extends string>(raw: string | null, values: readonly T[], def: T): T =>
  raw !== null && (values as readonly string[]).includes(raw) ? (raw as T) : def;

export default Sampling;
