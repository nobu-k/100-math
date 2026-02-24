import { useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateLineGraph } from "./line-graph";

const PARAM_KEYS: string[] = [];

const LineGraph = () => {
  const getSettingsParams = useCallback((): Record<string, string> => ({}), []);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const problems = useMemo(() => generateLineGraph(seed), [seed]);

  return (
    <ProblemPageLayout
      showAnswers={showAnswers}
      showSettings={showSettings}
      handleNew={handleNew}
      handleToggleAnswers={handleToggleAnswers}
      setShowSettings={setShowSettings}
      settingsPanel={null}
      qrUrl={qrUrl}
    >
      <div className="dev-text-page">
        {problems.map((p, idx) => {
          const maxVal = Math.max(...p.values);
          const minVal = Math.min(...p.values);
          const range = maxVal - minVal || 1;
          const padding = 40;
          const graphWidth = 300;
          const graphHeight = 200;
          const stepX = graphWidth / (p.labels.length - 1);

          return (
            <div key={idx} className="dev-prop-block">
              <div className="dev-prop-label">
                ({idx + 1}) {p.title}
              </div>
              <svg
                width={graphWidth + padding * 2}
                height={graphHeight + padding * 2}
                style={{ display: "block", margin: "8px 0" }}
              >
                {/* Y-axis */}
                <line
                  x1={padding} y1={padding}
                  x2={padding} y2={padding + graphHeight}
                  stroke="#333" strokeWidth={1}
                />
                {/* X-axis */}
                <line
                  x1={padding} y1={padding + graphHeight}
                  x2={padding + graphWidth} y2={padding + graphHeight}
                  stroke="#333" strokeWidth={1}
                />
                {/* Y-axis labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
                  const val = Math.round(minVal + range * frac);
                  const y = padding + graphHeight - graphHeight * frac;
                  return (
                    <g key={i}>
                      <line
                        x1={padding - 4} y1={y}
                        x2={padding} y2={y}
                        stroke="#333" strokeWidth={1}
                      />
                      <text
                        x={padding - 8} y={y + 4}
                        textAnchor="end" fontSize={10} fill="#333"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}
                {/* X-axis labels */}
                {p.labels.map((label, i) => {
                  const x = padding + i * stepX;
                  return (
                    <text
                      key={i}
                      x={x} y={padding + graphHeight + 16}
                      textAnchor="middle" fontSize={9} fill="#333"
                    >
                      {label}
                    </text>
                  );
                })}
                {/* Line */}
                <polyline
                  points={p.values.map((v, i) => {
                    const x = padding + i * stepX;
                    const y = padding + graphHeight - ((v - minVal) / range) * graphHeight;
                    return `${x},${y}`;
                  }).join(" ")}
                  fill="none" stroke="#2196F3" strokeWidth={2}
                />
                {/* Dots */}
                {p.values.map((v, i) => {
                  const x = padding + i * stepX;
                  const y = padding + graphHeight - ((v - minVal) / range) * graphHeight;
                  return (
                    <circle
                      key={i} cx={x} cy={y} r={3}
                      fill="#2196F3"
                    />
                  );
                })}
                {/* Unit label */}
                <text
                  x={padding - 8} y={padding - 8}
                  textAnchor="end" fontSize={10} fill="#666"
                >
                  ({p.unit})
                </text>
              </svg>
              {p.questions.map((q, qi) => (
                <div key={qi} className="dev-text-row">
                  <span className="dev-text-q">{q.question}</span>
                  <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                    {q.answer}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </ProblemPageLayout>
  );
};

export default LineGraph;
