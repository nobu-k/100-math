import { useState, useCallback, useMemo } from "react";
import type { BarGraphProblem } from "./bar-graph";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateBarGraph } from "./bar-graph";

const BARS_DEF = 4;
const PARAM_KEYS = ["bars"];

const BarGraph = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return {
      bars: Math.max(4, Math.min(6,
        parseInt(p.get("bars") ?? String(BARS_DEF), 10) || BARS_DEF)),
    };
  });

  const [bars, setBars] = useState(initial.bars);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (bars !== BARS_DEF) m.bars = String(bars);
    return m;
  }, [bars]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onBarsChange = useCallback((v: number) => {
    setBars(v);
    const p: Record<string, string> = {};
    if (v !== BARS_DEF) p.bars = String(v);
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateBarGraph(seed, bars), [seed, bars]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        棒の数{" "}
        <select className="operator-select" value={bars}
          onChange={(e) => onBarsChange(Number(e.target.value))}>
          <option value={4}>4</option>
          <option value={5}>5</option>
          <option value={6}>6</option>
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
        {problems.map((bp, idx) => (
          <div key={idx} className="dev-prop-block">
            <div className="dev-prop-label">({idx + 1}) {bp.title}</div>
            {renderBarChart(bp)}
            <div style={{ marginTop: 8 }}>
              {bp.questions.map((q, j) => (
                <div key={j} className="dev-text-row">
                  <span className="dev-text-q">{q.question}</span>
                  <span className={`dev-text-a${showAnswers ? "" : " ws-hidden"}`}>{q.answer}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

const renderBarChart = (bp: BarGraphProblem) => {
  const chartWidth = 300; const chartHeight = 200;
  const marginLeft = 40; const marginBottom = 40; const marginTop = 10; const marginRight = 10;
  const plotWidth = chartWidth - marginLeft - marginRight;
  const plotHeight = chartHeight - marginTop - marginBottom;
  const barCount = bp.categories.length;
  const barGap = 4;
  const barWidth = Math.max(10, (plotWidth - barGap * (barCount + 1)) / barCount);
  const scaleSteps: number[] = [];
  for (let v = 0; v <= bp.scaleMax; v += bp.scaleStep) scaleSteps.push(v);
  return (
    <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ display: "block", margin: "8px 0" }}>
      <line x1={marginLeft} y1={marginTop} x2={marginLeft} y2={chartHeight - marginBottom} stroke="#333" strokeWidth={1} />
      <line x1={marginLeft} y1={chartHeight - marginBottom} x2={chartWidth - marginRight} y2={chartHeight - marginBottom} stroke="#333" strokeWidth={1} />
      {scaleSteps.map((v) => {
        const y = chartHeight - marginBottom - (v / bp.scaleMax) * plotHeight;
        return (<g key={v}>
          <line x1={marginLeft - 3} y1={y} x2={chartWidth - marginRight} y2={y} stroke="#ddd" strokeWidth={0.5} />
          <text x={marginLeft - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#333">{v}</text>
        </g>);
      })}
      <text x={marginLeft - 6} y={marginTop - 2} textAnchor="end" fontSize={9} fill="#666">({bp.unit})</text>
      {bp.categories.map((cat, i) => {
        const x = marginLeft + barGap + i * (barWidth + barGap);
        const barH = (bp.values[i] / bp.scaleMax) * plotHeight;
        const y = chartHeight - marginBottom - barH;
        return (<g key={i}>
          <rect x={x} y={y} width={barWidth} height={barH} fill="#4a90d9" stroke="#333" strokeWidth={0.5} />
          <text x={x + barWidth / 2} y={chartHeight - marginBottom + 14} textAnchor="middle" fontSize={10} fill="#333">{cat}</text>
        </g>);
      })}
    </svg>
  );
};

export default BarGraph;
