import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateRatio } from "./ratio";
import { parseEnum } from "../shared/enum-utils";

const DEF = { rtype: "mixed" as const };
const PARAM_KEYS = ["rtype"];

const Ratio = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const rtype = parseEnum(p.get("rtype"), ["mixed", "simplify", "fill"] as const, DEF.rtype);
    return { rtype };
  });

  const [rtype, setRtype] = useState(initial.rtype);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (rtype !== DEF.rtype) m.rtype = rtype;
    return m;
  }, [rtype]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onRtypeChange = useCallback(
    (v: "mixed" | "simplify" | "fill") => {
      setRtype(v);
      const p: Record<string, string> = {};
      if (v !== DEF.rtype) p.rtype = v;
      regen(p);
    },
    [regen],
  );

  const problems = useMemo(() => generateRatio(seed, rtype), [seed, rtype]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        問題の種類{" "}
        <select className="operator-select" value={rtype}
          onChange={(e) => onRtypeChange(e.target.value as any)}>
          <option value="mixed">すべて</option>
          <option value="simplify">簡単な比にする</option>
          <option value="fill">穴埋め</option>
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
            <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.answer}</span>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default Ratio;
