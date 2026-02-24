import { useState, useCallback, useMemo } from "react";
import { M, texRed } from "../shared/M";
import { unicodeToLatex } from "../shared/katex-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { type LinearFuncMode, generateLinearFunc } from "./linear-func";

const DEF = { lfmode: "mixed" as LinearFuncMode };
const PARAM_KEYS = ["lfmode"];

const LinearFunc = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const lfmodeRaw = p.get("lfmode") ?? DEF.lfmode;
    const lfmode = (["mixed", "slope-intercept", "two-points", "rate-of-change"] as const).includes(lfmodeRaw as any)
      ? (lfmodeRaw as LinearFuncMode)
      : DEF.lfmode;
    return { lfmode };
  });

  const [lfmode, setLfmode] = useState(initial.lfmode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (lfmode !== DEF.lfmode) m.lfmode = lfmode;
    return m;
  }, [lfmode]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onLfmodeChange = useCallback(
    (v: LinearFuncMode) => {
      setLfmode(v);
      const p: Record<string, string> = {};
      if (v !== DEF.lfmode) p.lfmode = v;
      regen(p);
    },
    [regen],
  );

  const problems = useMemo(() => generateLinearFunc(seed, lfmode), [seed, lfmode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select className="operator-select" value={lfmode}
          onChange={(e) => onLfmodeChange(e.target.value as LinearFuncMode)}>
          <option value="mixed">すべて</option>
          <option value="slope-intercept">傾き・切片</option>
          <option value="two-points">2点から</option>
          <option value="rate-of-change">変化の割合</option>
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
            <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
              <M tex={texRed(unicodeToLatex(p.answerDisplay))} />
            </span>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default LinearFunc;
