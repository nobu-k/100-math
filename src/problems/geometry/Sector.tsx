import { useState, useCallback, useMemo } from "react";
import { M, texRed } from "../shared/M";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateSector } from "./sector";
import type { SectorProblem, SectorMode } from "./sector";
import SectorFig from "./figures/sector-fig";

const DEF = { secmode: "mixed" as SectorMode };
const PARAM_KEYS = ["secmode"];

const Sector = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const secmodeRaw = p.get("secmode") ?? DEF.secmode;
    const secmode = (["arc", "area", "mixed"] as const).includes(secmodeRaw as any)
      ? (secmodeRaw as SectorMode) : DEF.secmode;
    return { secmode };
  });

  const [secmode, setSecmode] = useState(initial.secmode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (secmode !== DEF.secmode) m.secmode = secmode;
    return m;
  }, [secmode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onSecmodeChange = useCallback((v: SectorMode) => {
    setSecmode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.secmode) p.secmode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateSector(seed, secmode), [seed, secmode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        {"種類 "}
        <select className="operator-select" value={secmode}
          onChange={(e) => onSecmodeChange(e.target.value as SectorMode)}>
          <option value="mixed">すべて</option>
          <option value="arc">弧の長さ</option>
          <option value="area">面積</option>
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
        {problems.map((p: SectorProblem, i: number) => (
          <div key={i} className="dev-prop-block">
            <div className="dev-prop-label">({i + 1})</div>
            <SectorFig problem={p} />
            <div style={{ marginTop: 8 }}>
              <div className="dev-text-row">
                <span className="dev-text-q">
                  {"半径 "}{p.radius}{"cm、中心角 "}{p.angle}{"° のおうぎ形の"}
                  {p.type === "arc" ? "弧の長さ" : "面積"}{"は？"}
                </span>
                <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                  <M tex={texRed(`${p.answerCoefficient === 1 ? "" : p.answerCoefficient}\\pi \\text{ ${p.unit}}`)} />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default Sector;
