import { useState, useCallback, useMemo } from "react";
import { M, texBox } from "../shared/M";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateMushikui } from "./mushikui";

const DEF = { max: 100, mode: "mixed" as "add" | "sub" | "mixed" };
const PARAM_KEYS = ["max", "mode"];

const Mushikui = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const max = Math.max(5, Math.min(200,
      parseInt(p.get("max") ?? String(DEF.max), 10) || DEF.max));
    const modeRaw = p.get("mode") ?? DEF.mode;
    const mode: "add" | "sub" | "mixed" =
      modeRaw === "add" || modeRaw === "sub" ? modeRaw : "mixed";
    return { max, mode };
  });

  const [max, setMax] = useState(initial.max);
  const [mode, setMode] = useState(initial.mode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (max !== DEF.max) m.max = String(max);
    if (mode !== DEF.mode) m.mode = mode;
    return m;
  }, [max, mode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onMaxChange = useCallback((v: number) => {
    setMax(v);
    const p: Record<string, string> = {};
    if (v !== DEF.max) p.max = String(v);
    if (mode !== DEF.mode) p.mode = mode;
    regen(p);
  }, [mode, regen]);

  const onModeChange = useCallback((v: "add" | "sub" | "mixed") => {
    setMode(v);
    const p: Record<string, string> = {};
    if (max !== DEF.max) p.max = String(max);
    if (v !== DEF.mode) p.mode = v;
    regen(p);
  }, [max, regen]);

  const problems = useMemo(() => generateMushikui(seed, max, mode), [seed, max, mode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        最大の数{" "}
        <select className="operator-select" value={max}
          onChange={(e) => onMaxChange(Number(e.target.value))}>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={200}>200</option>
        </select>
      </label>
      <label>
        計算{" "}
        <select className="operator-select" value={mode}
          onChange={(e) => onModeChange(e.target.value as "add" | "sub" | "mixed")}>
          <option value="mixed">たし算・ひき算</option>
          <option value="add">たし算のみ</option>
          <option value="sub">ひき算のみ</option>
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
      <div className="ws-page ws-cols-2">
        {problems.map((p, i) => {
          const left = p.left !== null ? String(p.left) : texBox(p.answer, showAnswers);
          const right = p.right !== null ? String(p.right) : texBox(p.answer, showAnswers);
          const result = p.result !== null ? String(p.result) : texBox(p.answer, showAnswers);
          return (
            <div key={i} className="ws-problem">
              <span className="ws-num">({i + 1})</span>
              <M tex={`${left} ${p.op === "+" ? "+" : "-"} ${right} = ${result}`} />
            </div>
          );
        })}
      </div>
    </ProblemPageLayout>
  );
};

export default Mushikui;
