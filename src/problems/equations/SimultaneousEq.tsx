import { useState, useCallback, useMemo } from "react";
import { M, texRed } from "../shared/M";
import { unicodeToLatex } from "../shared/katex-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { parseEnum } from "../shared/enum-utils";
import { type SimEqMode, generateSimEq } from "./simultaneous-eq";

const DEF = { seqmode: "mixed" as SimEqMode };
const PARAM_KEYS = ["seqmode"];

const SimultaneousEq = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const seqmode = parseEnum(p.get("seqmode"), ["addition", "substitution", "mixed"] as const, DEF.seqmode);
    return { seqmode };
  });

  const [seqmode, setSeqmode] = useState(initial.seqmode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (seqmode !== DEF.seqmode) m.seqmode = seqmode;
    return m;
  }, [seqmode]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onSeqmodeChange = useCallback(
    (v: SimEqMode) => {
      setSeqmode(v);
      const p: Record<string, string> = {};
      if (v !== DEF.seqmode) p.seqmode = v;
      regen(p);
    },
    [regen],
  );

  const problems = useMemo(() => generateSimEq(seed, seqmode), [seed, seqmode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        解法{" "}
        <select className="operator-select" value={seqmode}
          onChange={(e) => onSeqmodeChange(e.target.value as SimEqMode)}>
          <option value="mixed">すべて</option>
          <option value="addition">加減法</option>
          <option value="substitution">代入法</option>
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
      <div className="dev-fig-page print-spread">
        {problems.map((p, i) => (
          <div key={i} className="dev-prop-block">
            <div className="dev-prop-label">({i + 1})</div>
            <M tex={`\\begin{cases} ${unicodeToLatex(p.eq1)} \\\\ ${unicodeToLatex(p.eq2)} \\end{cases}`} />
            <div className={`dev-text-a${showAnswers ? "" : " ws-hidden"}`}>
              <M tex={texRed(`x = ${p.answerX},\\, y = ${p.answerY}`)} />
            </div>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default SimultaneousEq;
