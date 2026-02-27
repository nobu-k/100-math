import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { parseEnum } from "../shared/enum-utils";
import { type FuncType, generateProductQuotientDiff } from "./product-quotient-diff";
import { renderExprProblems } from "../equations/renderExprProblems";

const FUNC_TYPES = ["polynomial", "trig", "exponential", "logarithmic", "mixed"] as const;
const DEF = { funcType: "mixed" as FuncType };
const PARAM_KEYS = ["funcType"];

const ProductQuotientDiff = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return { funcType: parseEnum(p.get("funcType"), FUNC_TYPES, DEF.funcType) };
  });

  const [funcType, setFuncType] = useState(initial.funcType);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (funcType !== DEF.funcType) m.funcType = funcType;
    return m;
  }, [funcType]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onFuncTypeChange = useCallback((v: FuncType) => {
    setFuncType(v);
    const p: Record<string, string> = {};
    if (v !== DEF.funcType) p.funcType = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateProductQuotientDiff(seed, funcType), [seed, funcType]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        関数{" "}
        <select className="operator-select" value={funcType} onChange={(e) => onFuncTypeChange(e.target.value as FuncType)}>
          <option value="mixed">すべて</option>
          <option value="polynomial">多項式</option>
          <option value="trig">三角関数</option>
          <option value="exponential">指数関数</option>
          <option value="logarithmic">対数関数</option>
        </select>
      </label>
    </div>
  );

  return (
    <ProblemPageLayout showAnswers={showAnswers} showSettings={showSettings} handleNew={handleNew}
      handleToggleAnswers={handleToggleAnswers} setShowSettings={setShowSettings} settingsPanel={settingsPanel} qrUrl={qrUrl}>
      {renderExprProblems(problems, showAnswers)}
    </ProblemPageLayout>
  );
};

export default ProductQuotientDiff;
