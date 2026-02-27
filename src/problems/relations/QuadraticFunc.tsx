import { useState, useCallback, useMemo } from "react";
import { M, texRed } from "../shared/M";
import { unicodeToLatex } from "../shared/katex-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { type QuadFuncMode, generateQuadFunc } from "./quadratic-func";
import { parseEnum } from "../shared/enum-utils";

const DEF = { qfmode: "mixed" as QuadFuncMode };
const PARAM_KEYS = ["qfmode"];

const QuadraticFunc = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const qfmode = parseEnum(p.get("qfmode"), ["mixed", "value", "rate-of-change", "graph"] as const, DEF.qfmode);
    return { qfmode };
  });

  const [qfmode, setQfmode] = useState(initial.qfmode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (qfmode !== DEF.qfmode) m.qfmode = qfmode;
    return m;
  }, [qfmode]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onQfmodeChange = useCallback(
    (v: QuadFuncMode) => {
      setQfmode(v);
      const p: Record<string, string> = {};
      if (v !== DEF.qfmode) p.qfmode = v;
      regen(p);
    },
    [regen],
  );

  const problems = useMemo(() => generateQuadFunc(seed, qfmode), [seed, qfmode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select className="operator-select" value={qfmode}
          onChange={(e) => onQfmodeChange(e.target.value as QuadFuncMode)}>
          <option value="mixed">すべて</option>
          <option value="value">値を求める</option>
          <option value="rate-of-change">変化の割合</option>
          <option value="graph">グラフ</option>
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
            <span className="ws-num">({i + 1})</span>
            <span className="dev-text-q">{p.question}</span>
            <span className={`dev-text-a${showAnswers ? "" : " ws-hidden"}`}>
              <M tex={texRed(unicodeToLatex(p.answerDisplay))} />
            </span>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default QuadraticFunc;
