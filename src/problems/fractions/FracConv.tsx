import { useState, useCallback, useMemo } from "react";
import { M, texRed, texAns } from "../shared/M";
import { parseEnum } from "../shared/enum-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateFracConv } from "./frac-conv";

const DEF = { fconv: "both" as "both" | "to-mixed" | "to-improper" };
const PARAM_KEYS = ["fdir"];

const FracConv = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const fconv = parseEnum(p.get("fdir"), ["both", "to-mixed", "to-improper"] as const, DEF.fconv);
    return { fconv };
  });

  const [fconv, setFconv] = useState(initial.fconv);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (fconv !== DEF.fconv) m.fdir = fconv;
    return m;
  }, [fconv]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onFconvChange = useCallback((v: "both" | "to-mixed" | "to-improper") => {
    setFconv(v);
    const p: Record<string, string> = {};
    if (v !== DEF.fconv) p.fdir = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateFracConv(seed, fconv), [seed, fconv]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        変換方向{" "}
        <select className="operator-select" value={fconv}
          onChange={(e) => onFconvChange(e.target.value as "both" | "to-mixed" | "to-improper")}>
          <option value="both">両方</option>
          <option value="to-mixed">仮分数→帯分数</option>
          <option value="to-improper">帯分数→仮分数</option>
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
      <div className="dev-text-page print-spread">
        {problems.map((p, i) => {
          const [fromTex, toTex] = buildFracConvTex(p, showAnswers);
          return (
            <div key={i} className="dev-text-row dev-frac-row">
              <span className="ws-num">({i + 1})</span>
              <M tex={`${fromTex} \\rightarrow ${toTex}`} />
            </div>
          );
        })}
      </div>
    </ProblemPageLayout>
  );
};

const buildFracConvTex = (
  p: ReturnType<typeof generateFracConv>[number],
  showAnswers: boolean,
): [string, string] => {
  if (p.direction === "to-mixed") {
    const fromTex = `\\frac{${p.fromNum}}{${p.fromDen}}`;
    const toTex = showAnswers
      ? texRed(`${p.toWhole}\\frac{${p.toNum}}{${p.toDen}}`)
      : texAns("?", false);
    return [fromTex, toTex];
  }
  const fromTex = `${p.fromWhole}\\frac{${p.fromNum}}{${p.fromDen}}`;
  const toTex = showAnswers
    ? texRed(`\\frac{${p.toNum}}{${p.toDen}}`)
    : texAns("?", false);
  return [fromTex, toTex];
};

export default FracConv;
