import { useState, useCallback, useMemo } from "react";
import { M, texRed, texAns, texFrac } from "../shared/M";
import { parseEnum } from "../shared/enum-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateDiffFrac } from "./diff-frac";

const DEF = { dfop: "mixed" as "mixed" | "add" | "sub" };
const PARAM_KEYS = ["dfop"];

const DiffFrac = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const dfop = parseEnum(p.get("dfop"), ["mixed", "add", "sub"] as const, DEF.dfop);
    return { dfop };
  });

  const [dfop, setDfop] = useState(initial.dfop);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (dfop !== DEF.dfop) m.dfop = dfop;
    return m;
  }, [dfop]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onDfopChange = useCallback((v: "mixed" | "add" | "sub") => {
    setDfop(v);
    const p: Record<string, string> = {};
    if (v !== DEF.dfop) p.dfop = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateDiffFrac(seed, dfop), [seed, dfop]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        演算{" "}
        <select className="operator-select" value={dfop}
          onChange={(e) => onDfopChange(e.target.value as "mixed" | "add" | "sub")}>
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
      <div className="ws-page ws-cols-2 print-spread">
        {problems.map((p, i) => (
          <div key={i} className="ws-problem">
            <span className="ws-num">({i + 1})</span>
            <M tex={`\\frac{${p.aNum}}{${p.aDen}} ${p.op === "+" ? "+" : "-"} \\frac{${p.bNum}}{${p.bDen}} = ${showAnswers ? texRed(texFrac(p.ansNum, p.ansDen, p.ansWhole, p.ansPartNum)) : texAns("?", false)}`} />
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default DiffFrac;
