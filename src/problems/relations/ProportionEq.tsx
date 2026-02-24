import { useState, useCallback, useMemo } from "react";
import { M, texRed } from "../shared/M";
import { unicodeToLatex } from "../shared/katex-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { type ProportionMode, generateProportion } from "./proportion-eq";

const DEF = { propmode: "mixed" as ProportionMode };
const PARAM_KEYS = ["propmode"];

const ProportionEq = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const propmodeRaw = p.get("propmode") ?? DEF.propmode;
    const propmode = (["mixed", "direct", "inverse"] as const).includes(propmodeRaw as any)
      ? (propmodeRaw as ProportionMode)
      : DEF.propmode;
    return { propmode };
  });

  const [propmode, setPropmode] = useState(initial.propmode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (propmode !== DEF.propmode) m.propmode = propmode;
    return m;
  }, [propmode]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onPropmodeChange = useCallback(
    (v: ProportionMode) => {
      setPropmode(v);
      const p: Record<string, string> = {};
      if (v !== DEF.propmode) p.propmode = v;
      regen(p);
    },
    [regen],
  );

  const problems = useMemo(() => generateProportion(seed, propmode), [seed, propmode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select className="operator-select" value={propmode}
          onChange={(e) => onPropmodeChange(e.target.value as ProportionMode)}>
          <option value="mixed">比例・反比例</option>
          <option value="direct">比例のみ</option>
          <option value="inverse">反比例のみ</option>
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

export default ProportionEq;
