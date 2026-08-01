import { useState, useCallback, useMemo } from "react";
import { M } from "../shared/M";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { parseEnum } from "../shared/enum-utils";
import { type SqrtExpansionMode, generateSqrtExpansion } from "./sqrt-expansion";
import { renderExprProblems } from "./renderExprProblems";

const DEF = { sqexmode: "mixed" as SqrtExpansionMode, sqexformula: false };
const PARAM_KEYS = ["sqexmode", "sqexformula"];

const SqrtExpansion = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const sqexmode = parseEnum(p.get("sqexmode"), ["distribute", "formula", "mixed"] as const, DEF.sqexmode);
    const sqexformula = p.get("sqexformula") === "1";
    return { sqexmode, sqexformula };
  });

  const [sqexmode, setSqexmode] = useState(initial.sqexmode);
  const [sqexformula, setSqexformula] = useState(initial.sqexformula);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (sqexmode !== DEF.sqexmode) m.sqexmode = sqexmode;
    if (sqexformula) m.sqexformula = "1";
    return m;
  }, [sqexmode, sqexformula]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onSqexmodeChange = useCallback(
    (v: SqrtExpansionMode) => {
      setSqexmode(v);
      const p: Record<string, string> = {};
      if (v !== DEF.sqexmode) p.sqexmode = v;
      if (sqexformula) p.sqexformula = "1";
      regen(p);
    },
    [regen, sqexformula],
  );

  const onSqexformulaToggle = useCallback(() => {
    setSqexformula((prev) => {
      const next = !prev;
      const url = new URL(window.location.href);
      if (next) url.searchParams.set("sqexformula", "1");
      else url.searchParams.delete("sqexformula");
      window.history.replaceState(null, "", url.toString());
      return next;
    });
  }, []);

  const problems = useMemo(
    () => generateSqrtExpansion(seed, sqexmode, sqexformula ? 10 : 12),
    [seed, sqexmode, sqexformula],
  );

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select className="operator-select" value={sqexmode}
          onChange={(e) => onSqexmodeChange(e.target.value as SqrtExpansionMode)}>
          <option value="mixed">すべて</option>
          <option value="distribute">分配法則</option>
          <option value="formula">乗法公式</option>
        </select>
      </label>
      <label>
        <input type="checkbox" checked={sqexformula} onChange={onSqexformulaToggle} />
        {" "}乗法公式を表示
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
      <>
        {sqexformula && (
          <div className="formula-box">
            <M tex={"(x+y)^2 = x^2 + 2xy + y^2"} />
            <M tex={"(x-y)^2 = x^2 - 2xy + y^2"} />
            <M tex={"(x+y)(x-y) = x^2 - y^2"} />
            <M tex={"(x+a)(x+b) = x^2 + (a+b)x + ab"} />
          </div>
        )}
        {renderExprProblems(problems, showAnswers)}
      </>
    </ProblemPageLayout>
  );
};

export default SqrtExpansion;
