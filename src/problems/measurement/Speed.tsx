import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderTextProblems } from "../shared/renderHelpers";
import { generateSpeed } from "./speed";

type SpeedFind = "mixed" | "distance" | "time" | "speed";

const SFIND_DEF: SpeedFind = "mixed";
const SFIND_VALUES: readonly SpeedFind[] = ["mixed", "distance", "time", "speed"];
const PARAM_KEYS = ["sfind"];

const Speed = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return { sfind: parseEnum(p.get("sfind"), SFIND_VALUES, SFIND_DEF) };
  });

  const [sfind, setSfind] = useState(initial.sfind);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (sfind !== SFIND_DEF) m.sfind = sfind;
    return m;
  }, [sfind]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onSfindChange = useCallback((v: SpeedFind) => {
    setSfind(v);
    const p: Record<string, string> = {};
    if (v !== SFIND_DEF) p.sfind = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateSpeed(seed, sfind), [seed, sfind]);

  const settingsPanel = (
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
      {renderTextProblems(problems, showAnswers)}
    </ProblemPageLayout>
  );
};

const parseEnum = <T extends string>(raw: string | null, values: readonly T[], def: T): T =>
  raw !== null && (values as readonly string[]).includes(raw) ? (raw as T) : def;

export default Speed;
