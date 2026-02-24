import { useState, useCallback, useMemo } from "react";
import { M } from "../shared/M";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { type FactoringMode, generateFactoring } from "./factoring";
import { renderExprProblems } from "./renderExprProblems";

const DEF = { fcmode: "mixed" as FactoringMode, fcformula: false };
const PARAM_KEYS = ["fcmode", "fcformula"];

const Factoring = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const fcmodeRaw = p.get("fcmode") ?? DEF.fcmode;
    const fcmode = (["common", "formula", "mixed"] as const).includes(fcmodeRaw as FactoringMode)
      ? (fcmodeRaw as FactoringMode)
      : DEF.fcmode;
    const fcformula = p.get("fcformula") === "1";
    return { fcmode, fcformula };
  });

  const [fcmode, setFcmode] = useState(initial.fcmode);
  const [fcformula, setFcformula] = useState(initial.fcformula);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (fcmode !== DEF.fcmode) m.fcmode = fcmode;
    if (fcformula) m.fcformula = "1";
    return m;
  }, [fcmode, fcformula]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onFcmodeChange = useCallback(
    (v: FactoringMode) => {
      setFcmode(v);
      const p: Record<string, string> = {};
      if (v !== DEF.fcmode) p.fcmode = v;
      if (fcformula) p.fcformula = "1";
      regen(p);
    },
    [regen, fcformula],
  );

  const problems = useMemo(
    () => generateFactoring(seed, fcmode, fcformula ? 10 : 12),
    [seed, fcmode, fcformula],
  );

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select className="operator-select" value={fcmode}
          onChange={(e) => onFcmodeChange(e.target.value as FactoringMode)}>
          <option value="mixed">すべて</option>
          <option value="common">共通因数</option>
          <option value="formula">乗法公式の逆</option>
        </select>
      </label>
      <label>
        <input type="checkbox" checked={fcformula}
          onChange={() => {
            setFcformula((prev) => {
              const next = !prev;
              const url = new URL(window.location.href);
              if (next) url.searchParams.set("fcformula", "1");
              else url.searchParams.delete("fcformula");
              window.history.replaceState(null, "", url.toString());
              return next;
            });
          }} />
        {" "}乗法公式の逆を表示
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
        {fcformula && (
          <div className="formula-box">
            <M tex={"x^2 + 2xy + y^2 = (x+y)^2"} />
            <M tex={"x^2 - 2xy + y^2 = (x-y)^2"} />
            <M tex={"x^2 - y^2 = (x+y)(x-y)"} />
            <M tex={"x^2 + (a+b)x + ab = (x+a)(x+b)"} />
          </div>
        )}
        {renderExprProblems(problems, showAnswers)}
      </>
    </ProblemPageLayout>
  );
};

export default Factoring;
