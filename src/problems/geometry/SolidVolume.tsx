import { useState, useCallback, useMemo } from "react";
import { parseEnum } from "../shared/enum-utils";
import { M, texRed } from "../shared/M";
import { unicodeToLatex } from "../shared/katex-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateSolid } from "./solid-volume";
import type { SolidProblem, SolidMode } from "./solid-volume";
import SolidVolumeFig from "./figures/solid-volume-fig";

const DEF = { solmode: "mixed" as SolidMode };
const PARAM_KEYS = ["solmode"];

const SolidVolume = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const solmode = parseEnum(p.get("solmode"), ["cylinder", "cone", "sphere", "prism", "mixed"] as const, DEF.solmode);
    return { solmode };
  });

  const [solmode, setSolmode] = useState(initial.solmode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (solmode !== DEF.solmode) m.solmode = solmode;
    return m;
  }, [solmode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onSolmodeChange = useCallback((v: SolidMode) => {
    setSolmode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.solmode) p.solmode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateSolid(seed, solmode), [seed, solmode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        {"種類 "}
        <select className="operator-select" value={solmode}
          onChange={(e) => onSolmodeChange(e.target.value as SolidMode)}>
          <option value="mixed">すべて</option>
          <option value="cylinder">円柱</option>
          <option value="cone">円錐</option>
          <option value="sphere">球</option>
          <option value="prism">角柱</option>
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
      <div className="dev-fig-page">
        {problems.map((p: SolidProblem, i: number) => (
          <div key={i} className="dev-prop-block">
            <div className="dev-prop-label">({i + 1})</div>
            <SolidVolumeFig problem={p} />
            <div style={{ marginTop: 8 }}>
              <div className="dev-text-row">
                <span className="dev-text-q">{buildQuestion(p)}</span>
                <span className={`dev-text-a${showAnswers ? "" : " ws-hidden"}`}>
                  <M tex={texRed(unicodeToLatex(p.answerDisplay))} />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

const buildQuestion = (p: SolidProblem): string => {
  if (p.solidType === "cylinder") {
    return `底面の半径 ${p.radius}cm、高さ ${p.height}cm の円柱の${p.calcType === "volume" ? "体積" : "表面積"}は？`;
  }
  if (p.solidType === "cone") {
    if (p.calcType === "volume") {
      return `底面の半径 ${p.radius}cm、高さ ${p.height}cm の円錐の体積は？`;
    }
    return `底面の半径 ${p.radius}cm、母線の長さ ${p.slantHeight}cm の円錐の表面積は？`;
  }
  if (p.solidType === "sphere") {
    return `半径 ${p.radius}cm の球の${p.calcType === "volume" ? "体積" : "表面積"}は？`;
  }
  return `底面の一辺 ${p.baseEdge}cm の${p.baseSides === 4 ? "正四" : "三"}角柱（高さ ${p.height}cm）の体積は？`;
};

export default SolidVolume;
