import { useState, useCallback, useMemo } from "react";
import { M, texBox } from "../shared/M";
import { unicodeToLatex } from "../shared/katex-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateBoxEq } from "./box-eq";

const DEF = { ops: "addsub" as const };
const PARAM_KEYS = ["ops"];

const BoxEq = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const opsRaw = p.get("ops") ?? DEF.ops;
    const ops: "addsub" | "all" = opsRaw === "all" ? "all" : "addsub";
    return { ops };
  });

  const [ops, setOps] = useState(initial.ops);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (ops !== DEF.ops) m.ops = ops;
    return m;
  }, [ops]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onOpsChange = useCallback(
    (v: "addsub" | "all") => {
      setOps(v);
      const p: Record<string, string> = {};
      if (v !== DEF.ops) p.ops = v;
      regen(p);
    },
    [regen],
  );

  const problems = useMemo(() => generateBoxEq(seed, ops), [seed, ops]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        演算{" "}
        <select className="operator-select" value={ops}
          onChange={(e) => onOpsChange(e.target.value as "addsub" | "all")}>
          <option value="addsub">＋・− のみ</option>
          <option value="all">＋・−・×・÷</option>
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
      <div className="ws-page ws-cols-2">
        {problems.map((p, i) => (
          <div key={i} className="ws-problem">
            <span className="ws-num">({i + 1})</span>
            <span className="ws-expr">
              <M tex={unicodeToLatex(p.display)} />
              <span style={{ marginLeft: 8 }}>
                <M tex={texBox(p.answer, showAnswers)} />
              </span>
            </span>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default BoxEq;
