import { useState, useCallback, useMemo } from "react";
import { M } from "../shared/M";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { type ExpansionMode, generateExpansion } from "./expansion";
import { renderExprProblems } from "./renderExprProblems";

const DEF = { exmode: "mixed" as ExpansionMode, exformula: false };
const PARAM_KEYS = ["exmode", "exformula"];

const Expansion = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const exmodeRaw = p.get("exmode") ?? DEF.exmode;
    const exmode = (["distribute", "formula", "mixed"] as const).includes(exmodeRaw as ExpansionMode)
      ? (exmodeRaw as ExpansionMode)
      : DEF.exmode;
    const exformula = p.get("exformula") === "1";
    return { exmode, exformula };
  });

  const [exmode, setExmode] = useState(initial.exmode);
  const [exformula, setExformula] = useState(initial.exformula);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (exmode !== DEF.exmode) m.exmode = exmode;
    if (exformula) m.exformula = "1";
    return m;
  }, [exmode, exformula]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onExmodeChange = useCallback(
    (v: ExpansionMode) => {
      setExmode(v);
      const p: Record<string, string> = {};
      if (v !== DEF.exmode) p.exmode = v;
      if (exformula) p.exformula = "1";
      regen(p);
    },
    [regen, exformula],
  );

  const onExformulaToggle = useCallback(() => {
    setExformula((prev) => {
      const next = !prev;
      const url = new URL(window.location.href);
      if (next) url.searchParams.set("exformula", "1");
      else url.searchParams.delete("exformula");
      window.history.replaceState(null, "", url.toString());
      return next;
    });
  }, []);

  const problems = useMemo(
    () => generateExpansion(seed, exmode, exformula ? 10 : 12),
    [seed, exmode, exformula],
  );

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select className="operator-select" value={exmode}
          onChange={(e) => onExmodeChange(e.target.value as ExpansionMode)}>
          <option value="mixed">すべて</option>
          <option value="distribute">分配法則</option>
          <option value="formula">乗法公式</option>
        </select>
      </label>
      <label>
        <input type="checkbox" checked={exformula} onChange={onExformulaToggle} />
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
        {exformula && (
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

export default Expansion;
