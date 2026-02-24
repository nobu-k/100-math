import { useState, useCallback, useMemo } from "react";
import { M, texAns } from "../shared/M";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { type AbsoluteValueMode, generateAbsoluteValue } from "./absolute-value";
import { parseEnum } from "../shared/enum-utils";

const DEF = { absmode: "find" as AbsoluteValueMode };
const PARAM_KEYS = ["absmode"];

const AbsoluteValue = () => {
  const [absmode, setAbsmode] = useState<AbsoluteValueMode>(() => {
    const p = new URLSearchParams(window.location.search);
    return parseEnum(p.get("absmode"), ["find", "list", "equation"] as const, DEF.absmode);
  });

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (absmode !== DEF.absmode) m.absmode = absmode;
    return m;
  }, [absmode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onAbsmodeChange = useCallback((v: AbsoluteValueMode) => {
    setAbsmode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.absmode) p.absmode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateAbsoluteValue(seed, absmode), [seed, absmode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select
          className="operator-select"
          value={absmode}
          onChange={(e) => onAbsmodeChange(e.target.value as AbsoluteValueMode)}
        >
          <option value="find">絶対値を求める</option>
          <option value="list">整数を列挙</option>
          <option value="equation">|x| = a</option>
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
        {problems.map((p, i) => {
          if (p.mode === "find") {
            return (
              <div key={i} className="g1-problem">
                <span className="g1-num">({i + 1})</span>
                <M tex={`\\lvert ${p.number} \\rvert = ${texAns(p.answer!, showAnswers)}`} />
              </div>
            );
          }
          if (p.mode === "list") {
            return (
              <div key={i} className="dev-text-row">
                <span className="g1-num">({i + 1})</span>
                <span className="dev-text-q">
                  絶対値が {p.threshold} 以下の整数をすべて書きなさい
                </span>
                <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                  {p.listAnswer!.join(", ")}
                </span>
              </div>
            );
          }
          return (
            <div key={i} className="dev-text-row">
              <span className="g1-num">({i + 1})</span>
              <span className="dev-text-q">|x| = {p.eqValue} のとき x = ?</span>
              <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                x = ±{p.eqValue}
              </span>
            </div>
          );
        })}
      </div>
    </ProblemPageLayout>
  );
};

export default AbsoluteValue;
