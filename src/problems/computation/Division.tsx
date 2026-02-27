import { useState, useCallback, useMemo } from "react";
import { parseEnum } from "../shared/enum-utils";
import { M, texBox } from "../shared/M";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import useProblemPage from "../shared/useProblemPage";
import { generateDivision } from "./division";

const DEF = { rem: "mixed" as "none" | "yes" | "mixed" };
const PARAM_KEYS = ["rem"];

const Division = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const rem = parseEnum(p.get("rem"), ["none", "yes", "mixed"] as const, DEF.rem);
    return { rem };
  });

  const [rem, setRem] = useState(initial.rem);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (rem !== DEF.rem) m.rem = rem;
    return m;
  }, [rem]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onRemChange = useCallback((v: "none" | "yes" | "mixed") => {
    setRem(v);
    const p: Record<string, string> = {};
    if (v !== DEF.rem) p.rem = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateDivision(seed, rem), [seed, rem]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        あまり{" "}
        <select className="operator-select" value={rem}
          onChange={(e) => onRemChange(e.target.value as "none" | "yes" | "mixed")}>
          <option value="mixed">あり・なし混合</option>
          <option value="none">あまりなし</option>
          <option value="yes">あまりあり</option>
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
      <div className="ws-page ws-cols-3">
        {problems.map((p, i) => {
          const remainder = p.remainder > 0
            ? `\\text{ あまり }${texBox(p.remainder, showAnswers)}`
            : "";
          return (
            <div key={i} className="ws-problem">
              <span className="ws-num">({i + 1})</span>
              <M tex={`${p.dividend} \\div ${p.divisor} = ${texBox(p.quotient, showAnswers)}${remainder}`} />
            </div>
          );
        })}
      </div>
    </ProblemPageLayout>
  );
};

export default Division;
