import { useState, useCallback, useMemo } from "react";
import { M, texBox } from "../shared/M";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateMentalMath } from "./mental-math";

const DEF = { mmode: "mixed" as "add" | "sub" | "mixed" };
const PARAM_KEYS = ["mmode"];

const MentalMath = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const mmodeRaw = p.get("mmode") ?? DEF.mmode;
    const mmode: "add" | "sub" | "mixed" =
      mmodeRaw === "add" || mmodeRaw === "sub" ? mmodeRaw : "mixed";
    return { mmode };
  });

  const [mmode, setMmode] = useState(initial.mmode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (mmode !== DEF.mmode) m.mmode = mmode;
    return m;
  }, [mmode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onMmodeChange = useCallback((v: "add" | "sub" | "mixed") => {
    setMmode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.mmode) p.mmode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateMentalMath(seed, mmode), [seed, mmode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        計算{" "}
        <select className="operator-select" value={mmode}
          onChange={(e) => onMmodeChange(e.target.value as "add" | "sub" | "mixed")}>
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
      <div className="g1-page g1-cols-4">
        {problems.map((p, i) => (
          <div key={i} className="g1-problem">
            <span className="g1-num">({i + 1})</span>
            <M tex={`${p.left} ${p.op === "+" ? "+" : "-"} ${p.right} = ${texBox(p.answer, showAnswers)}`} />
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default MentalMath;
