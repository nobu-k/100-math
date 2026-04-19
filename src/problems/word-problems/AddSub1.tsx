import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderTextProblems } from "../shared/renderHelpers";
import { generateAddSub1, type WordProblemMode, type WordProblemScript, type WordProblemOperators } from "./add-sub-1";
import { parseEnum } from "../shared/enum-utils";

const MODE_DEF: WordProblemMode = "mixed";
const MODE_VALUES: readonly WordProblemMode[] = ["mixed", "add", "sub"];
const SCRIPT_DEF: WordProblemScript = "hiragana";
const SCRIPT_VALUES: readonly WordProblemScript[] = ["kanji", "hiragana"];
const OPS_DEF: WordProblemOperators = "one";
const OPS_VALUES: readonly WordProblemOperators[] = ["one", "two", "mixed"];
const MAX_DEF = 10;
const MAX_VALUES = [10, 20] as const;
const PARAM_KEYS = ["mode", "max", "script", "ops"];

const AddSub1 = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const maxRaw = parseInt(p.get("max") ?? String(MAX_DEF), 10);
    const max = (MAX_VALUES as readonly number[]).includes(maxRaw) ? maxRaw : MAX_DEF;
    return {
      mode: parseEnum(p.get("mode"), MODE_VALUES, MODE_DEF),
      script: parseEnum(p.get("script"), SCRIPT_VALUES, SCRIPT_DEF),
      ops: parseEnum(p.get("ops"), OPS_VALUES, OPS_DEF),
      max,
    };
  });

  const [mode, setMode] = useState(initial.mode);
  const [max, setMax] = useState(initial.max);
  const [script, setScript] = useState(initial.script);
  const [ops, setOps] = useState(initial.ops);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (mode !== MODE_DEF) m.mode = mode;
    if (max !== MAX_DEF) m.max = String(max);
    if (script !== SCRIPT_DEF) m.script = script;
    if (ops !== OPS_DEF) m.ops = ops;
    return m;
  }, [mode, max, script, ops]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, updateParams, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const currentParams = (): Record<string, string> => {
    const p: Record<string, string> = {};
    if (mode !== MODE_DEF) p.mode = mode;
    if (max !== MAX_DEF) p.max = String(max);
    if (script !== SCRIPT_DEF) p.script = script;
    if (ops !== OPS_DEF) p.ops = ops;
    return p;
  };

  const onModeChange = useCallback((v: WordProblemMode) => {
    setMode(v);
    const p = currentParams();
    if (v !== MODE_DEF) p.mode = v;
    else delete p.mode;
    regen(p);
  }, [regen, max, script, ops]);

  const onMaxChange = useCallback((v: number) => {
    setMax(v);
    const p = currentParams();
    if (v !== MAX_DEF) p.max = String(v);
    else delete p.max;
    regen(p);
  }, [regen, mode, script, ops]);

  const onScriptChange = useCallback((v: WordProblemScript) => {
    setScript(v);
    const p = currentParams();
    if (v !== SCRIPT_DEF) p.script = v;
    else delete p.script;
    updateParams(p);
  }, [updateParams, mode, max, ops]);

  const onOpsChange = useCallback((v: WordProblemOperators) => {
    setOps(v);
    const p = currentParams();
    if (v !== OPS_DEF) p.ops = v;
    else delete p.ops;
    regen(p);
  }, [regen, mode, max, script]);

  const problems = useMemo(() => generateAddSub1(seed, max, mode, script, ops), [seed, max, mode, script, ops]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select className="operator-select" value={mode}
          onChange={(e) => onModeChange(e.target.value as WordProblemMode)}>
          <option value="mixed">たし算・ひき算</option>
          <option value="add">たし算</option>
          <option value="sub">ひき算</option>
        </select>
      </label>
      <label>
        数の範囲{" "}
        <select className="operator-select" value={max}
          onChange={(e) => onMaxChange(Number(e.target.value))}>
          <option value={10}>10まで</option>
          <option value={20}>20まで</option>
        </select>
      </label>
      <label>
        演算の数{" "}
        <select className="operator-select" value={ops}
          onChange={(e) => onOpsChange(e.target.value as WordProblemOperators)}>
          <option value="one">1つ</option>
          <option value="two">2つ</option>
          <option value="mixed">1つと2つ</option>
        </select>
      </label>
      <label>
        文字{" "}
        <select className="operator-select" value={script}
          onChange={(e) => onScriptChange(e.target.value as WordProblemScript)}>
          <option value="kanji">漢字あり</option>
          <option value="hiragana">ひらがなのみ</option>
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
