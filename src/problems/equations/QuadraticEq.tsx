import { useState, useCallback, useMemo } from "react";
import { M, texRed } from "../shared/M";
import { unicodeToLatex } from "../shared/katex-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { parseEnum } from "../shared/enum-utils";
import { type QuadEqMode, generateQuadEq } from "./quadratic-eq";

const DEF = { qemode: "mixed" as QuadEqMode, qeformula: false };
const PARAM_KEYS = ["qemode", "qeformula"];

const QuadraticEq = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const qemode = parseEnum(p.get("qemode"), ["factoring", "formula", "mixed"] as const, DEF.qemode);
    const qeformula = p.get("qeformula") === "1";
    return { qemode, qeformula };
  });

  const [qemode, setQemode] = useState(initial.qemode);
  const [qeformula, setQeformula] = useState(initial.qeformula);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (qemode !== DEF.qemode) m.qemode = qemode;
    if (qeformula) m.qeformula = "1";
    return m;
  }, [qemode, qeformula]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onQemodeChange = useCallback(
    (v: QuadEqMode) => {
      setQemode(v);
      const p: Record<string, string> = {};
      if (v !== DEF.qemode) p.qemode = v;
      if (qeformula) p.qeformula = "1";
      regen(p);
    },
    [regen, qeformula],
  );

  const problems = useMemo(
    () => generateQuadEq(seed, qemode, qeformula ? 6 : 8),
    [seed, qemode, qeformula],
  );

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select className="operator-select" value={qemode}
          onChange={(e) => onQemodeChange(e.target.value as QuadEqMode)}>
          <option value="mixed">すべて</option>
          <option value="factoring">因数分解</option>
          <option value="formula">解の公式</option>
        </select>
      </label>
      <label>
        <input type="checkbox" checked={qeformula}
          onChange={() => {
            setQeformula((prev) => {
              const next = !prev;
              const url = new URL(window.location.href);
              if (next) url.searchParams.set("qeformula", "1");
              else url.searchParams.delete("qeformula");
              window.history.replaceState(null, "", url.toString());
              return next;
            });
          }} />
        {" "}公式を表示
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
      <>
        {qeformula && (
          <div className="formula-box">
            <M tex={"x^2 + 2ax + a^2 = (x+a)^2"} />
            <M tex={"x^2 - 2ax + a^2 = (x-a)^2"} />
            <M tex={"x^2 - a^2 = (x+a)(x-a)"} />
            <M tex={"x^2 + (a+b)x + ab = (x+a)(x+b)"} />
            <M tex={"x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"} />
          </div>
        )}
        <div className={`ws-page ws-cols-2 ${qeformula ? "print-spread-short" : "print-spread"}`}>
          {problems.map((p, i) => (
            <div key={i} className="ws-problem">
              <span className="ws-num">({i + 1})</span>
              <span className="ws-expr">
                <M tex={unicodeToLatex(p.equation)} />
                <span className={`${showAnswers ? "" : "ws-hidden"}`} style={{ marginLeft: "1em" }}>
                  <M tex={texRed(unicodeToLatex(p.answerDisplay))} />
                </span>
              </span>
            </div>
          ))}
        </div>
      </>
    </ProblemPageLayout>
  );
};

export default QuadraticEq;
