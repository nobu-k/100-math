import { useState, useCallback, useMemo } from "react";
import { parseEnum } from "../shared/enum-utils";
import { M, texBox } from "../shared/M";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import useProblemPage from "../shared/useProblemPage";
import { generateKukuBlank } from "./kuku-blank";

const DEF = { blank: "any" as "any" | "product" | "factor" };
const PARAM_KEYS = ["blank"];

const KukuBlank = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const blank = parseEnum(p.get("blank"), ["any", "product", "factor"] as const, DEF.blank);
    return { blank };
  });

  const [blank, setBlank] = useState(initial.blank);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (blank !== DEF.blank) m.blank = blank;
    return m;
  }, [blank]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onBlankChange = useCallback((v: "any" | "product" | "factor") => {
    setBlank(v);
    const p: Record<string, string> = {};
    if (v !== DEF.blank) p.blank = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateKukuBlank(seed, blank), [seed, blank]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        □の位置{" "}
        <select className="operator-select" value={blank}
          onChange={(e) => onBlankChange(e.target.value as "any" | "product" | "factor")}>
          <option value="any">ランダム</option>
          <option value="product">答え（積）</option>
          <option value="factor">かけられる数・かける数</option>
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
      <div className="ws-page ws-cols-3">
        {problems.map((p, i) => {
          const a = p.blankPos === "a" ? texBox(p.a, showAnswers) : String(p.a);
          const b = p.blankPos === "b" ? texBox(p.b, showAnswers) : String(p.b);
          const prod = p.blankPos === "product" ? texBox(p.product, showAnswers) : String(p.product);
          return (
            <div key={i} className="ws-problem">
              <span className="ws-num">({i + 1})</span>
              <M tex={`${a} \\times ${b} = ${prod}`} />
            </div>
          );
        })}
      </div>
    </ProblemPageLayout>
  );
};

export default KukuBlank;
