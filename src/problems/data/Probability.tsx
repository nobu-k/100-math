import { useState, useCallback, useMemo } from "react";
import type { ProbabilityMode } from "./probability";
import { M, texRed } from "../shared/M";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateProbability } from "./probability";

const PBMODE_DEF: ProbabilityMode = "mixed";
const PBMODE_VALUES: readonly ProbabilityMode[] = ["mixed", "basic", "two-dice"];
const PARAM_KEYS = ["pbmode"];

const Probability = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return {
      pbmode: parseEnum(p.get("pbmode"), PBMODE_VALUES, PBMODE_DEF),
    };
  });

  const [pbmode, setPbmode] = useState(initial.pbmode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (pbmode !== PBMODE_DEF) m.pbmode = pbmode;
    return m;
  }, [pbmode]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onPbmodeChange = useCallback((v: ProbabilityMode) => {
    setPbmode(v);
    const p: Record<string, string> = {};
    if (v !== PBMODE_DEF) p.pbmode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateProbability(seed, pbmode), [seed, pbmode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select className="operator-select" value={pbmode}
          onChange={(e) => onPbmodeChange(e.target.value as ProbabilityMode)}>
          <option value="mixed">すべて</option>
          <option value="basic">基本</option>
          <option value="two-dice">2つのさいころ</option>
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
            <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`} style={{ alignItems: "center" }}>
              <M tex={texRed(p.ansDen === 1 ? String(p.ansNum) : `\\frac{${p.ansNum}}{${p.ansDen}}`)} />
            </span>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

const parseEnum = <T extends string>(raw: string | null, values: readonly T[], def: T): T =>
  raw !== null && (values as readonly string[]).includes(raw) ? (raw as T) : def;

export default Probability;
