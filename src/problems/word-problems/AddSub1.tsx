import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderTextProblems } from "../shared/renderHelpers";
import { generateAddSub1, type WordProblemMode } from "./add-sub-1";
import { parseEnum } from "../shared/enum-utils";

const MODE_DEF: WordProblemMode = "mixed";
const MODE_VALUES: readonly WordProblemMode[] = ["mixed", "add", "sub"];
const MAX_DEF = 10;
const MAX_VALUES = [10, 20] as const;
const PARAM_KEYS = ["mode", "max"];

const AddSub1 = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const maxRaw = parseInt(p.get("max") ?? String(MAX_DEF), 10);
    const max = (MAX_VALUES as readonly number[]).includes(maxRaw) ? maxRaw : MAX_DEF;
    return {
      mode: parseEnum(p.get("mode"), MODE_VALUES, MODE_DEF),
      max,
    };
  });

  const [mode, setMode] = useState(initial.mode);
  const [max, setMax] = useState(initial.max);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (mode !== MODE_DEF) m.mode = mode;
    if (max !== MAX_DEF) m.max = String(max);
    return m;
  }, [mode, max]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onModeChange = useCallback((v: WordProblemMode) => {
    setMode(v);
    const p: Record<string, string> = {};
    if (v !== MODE_DEF) p.mode = v;
    if (max !== MAX_DEF) p.max = String(max);
    regen(p);
  }, [regen, max]);

  const onMaxChange = useCallback((v: number) => {
    setMax(v);
    const p: Record<string, string> = {};
    if (mode !== MODE_DEF) p.mode = mode;
    if (v !== MAX_DEF) p.max = String(v);
    regen(p);
  }, [regen, mode]);

  const problems = useMemo(() => generateAddSub1(seed, max, mode), [seed, max, mode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        しゅるい{" "}
        <select className="operator-select" value={mode}
          onChange={(e) => onModeChange(e.target.value as WordProblemMode)}>
          <option value="mixed">たし算・ひき算</option>
          <option value="add">たし算</option>
          <option value="sub">ひき算</option>
        </select>
      </label>
      <label>
        かずのはんい{" "}
        <select className="operator-select" value={max}
          onChange={(e) => onMaxChange(Number(e.target.value))}>
          <option value={10}>10まで</option>
          <option value={20}>20まで</option>
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

export default AddSub1;
