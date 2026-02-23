import { useState, useCallback, useMemo } from "react";
import type { ProblemGroup } from "./types";
import type { TextProblem } from "./shared/types";
import type { BarGraphProblem } from "./data/bar-graph";
import type { DataAnalysisProblem, DataAnalysisMode } from "./data/data-analysis";
import type { ProbabilityMode } from "./data/probability";
import type { SamplingMode } from "./data/sampling";
import { Frac } from "./shared/Frac";
import useProblemPage from "./shared/useProblemPage";
import ProblemPageLayout from "./shared/ProblemPageLayout";
import { generateTableRead } from "./data/table-read";
import { generateBarGraph } from "./data/bar-graph";
import { generateLineGraph } from "./data/line-graph";
import { generateCrossTable } from "./data/cross-table";
import { generateRepresentative } from "./data/representative";
import { generateCounting } from "./data/counting";
import { generateFreqTable } from "./data/freq-table";
import { generateDataAnalysis } from "./data/data-analysis";
import { generateProbability } from "./data/probability";
import { generateSampling } from "./data/sampling";

/* ================================================================
   Types & Defaults
   ================================================================ */

type DataOp =
  | "table-read"
  | "bar-graph"
  | "line-graph"
  | "cross-table"
  | "representative"
  | "counting"
  | "freq-table"
  | "data-analysis"
  | "probability"
  | "sampling";

type RepFind = "mixed" | "mean" | "median" | "mode";

const CATS_DEF = 4;
const BARS_DEF = 4;
const REPFIND_DEF: RepFind = "mixed";
const DAMODE_DEF: DataAnalysisMode = "mixed";
const PBMODE_DEF: ProbabilityMode = "mixed";
const SPMODE_DEF: SamplingMode = "mixed";

const PARAM_KEYS = ["cats", "bars", "repfind", "damode", "pbmode", "spmode"];

const REPFIND_VALUES: readonly RepFind[] = ["mixed", "mean", "median", "mode"];
const DAMODE_VALUES: readonly DataAnalysisMode[] = ["mixed", "representative", "frequency"];
const PBMODE_VALUES: readonly ProbabilityMode[] = ["mixed", "basic", "two-dice"];
const SPMODE_VALUES: readonly SamplingMode[] = ["mixed", "concept", "estimation"];

const parseEnum = <T extends string>(raw: string | null, values: readonly T[], def: T): T =>
  raw !== null && (values as readonly string[]).includes(raw) ? (raw as T) : def;

/* ================================================================
   Main component
   ================================================================ */

const Data = ({ operator }: { operator: string }) => {
  const op = operator as DataOp;

  /* ---- read initial URL settings ---- */

  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return {
      cats: Math.max(3, Math.min(5,
        parseInt(p.get("cats") ?? String(CATS_DEF), 10) || CATS_DEF)),
      bars: Math.max(4, Math.min(6,
        parseInt(p.get("bars") ?? String(BARS_DEF), 10) || BARS_DEF)),
      repfind: parseEnum(p.get("repfind"), REPFIND_VALUES, REPFIND_DEF),
      damode: parseEnum(p.get("damode"), DAMODE_VALUES, DAMODE_DEF),
      pbmode: parseEnum(p.get("pbmode"), PBMODE_VALUES, PBMODE_DEF),
      spmode: parseEnum(p.get("spmode"), SPMODE_VALUES, SPMODE_DEF),
    };
  });

  const [cats, setCats] = useState(initial.cats);
  const [bars, setBars] = useState(initial.bars);
  const [repfind, setRepfind] = useState(initial.repfind);
  const [damode, setDamode] = useState(initial.damode);
  const [pbmode, setPbmode] = useState(initial.pbmode);
  const [spmode, setSpmode] = useState(initial.spmode);

  /* ---- settings params for URL sync ---- */

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    switch (op) {
      case "table-read":
        if (cats !== CATS_DEF) m.cats = String(cats);
        break;
      case "bar-graph":
        if (bars !== BARS_DEF) m.bars = String(bars);
        break;
      case "representative":
        if (repfind !== REPFIND_DEF) m.repfind = repfind;
        break;
      case "data-analysis":
        if (damode !== DAMODE_DEF) m.damode = damode;
        break;
      case "probability":
        if (pbmode !== PBMODE_DEF) m.pbmode = pbmode;
        break;
      case "sampling":
        if (spmode !== SPMODE_DEF) m.spmode = spmode;
        break;
      case "line-graph":
      case "cross-table":
      case "counting":
      case "freq-table":
        break;
    }
    return m;
  }, [op, cats, bars, repfind, damode, pbmode, spmode]);

  /* ---- shared hook ---- */

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  /* ---- settings change handlers ---- */

  const onCatsChange = useCallback((v: number) => {
    setCats(v);
    const p: Record<string, string> = {};
    if (v !== CATS_DEF) p.cats = String(v);
    regen(p);
  }, [regen]);

  const onBarsChange = useCallback((v: number) => {
    setBars(v);
    const p: Record<string, string> = {};
    if (v !== BARS_DEF) p.bars = String(v);
    regen(p);
  }, [regen]);

  const onRepfindChange = useCallback((v: RepFind) => {
    setRepfind(v);
    const p: Record<string, string> = {};
    if (v !== REPFIND_DEF) p.repfind = v;
    regen(p);
  }, [regen]);

  const onDamodeChange = useCallback((v: DataAnalysisMode) => {
    setDamode(v);
    const p: Record<string, string> = {};
    if (v !== DAMODE_DEF) p.damode = v;
    regen(p);
  }, [regen]);

  const onPbmodeChange = useCallback((v: ProbabilityMode) => {
    setPbmode(v);
    const p: Record<string, string> = {};
    if (v !== PBMODE_DEF) p.pbmode = v;
    regen(p);
  }, [regen]);

  const onSpmodeChange = useCallback((v: SamplingMode) => {
    setSpmode(v);
    const p: Record<string, string> = {};
    if (v !== SPMODE_DEF) p.spmode = v;
    regen(p);
  }, [regen]);

  /* ---- generate problems ---- */

  const tableProblems = useMemo(
    () => op === "table-read" ? generateTableRead(seed, cats) : [],
    [op, seed, cats],
  );
  const barGraphProblems = useMemo(
    () => op === "bar-graph" ? generateBarGraph(seed, bars) : [],
    [op, seed, bars],
  );
  const lineGraphProblems = useMemo(
    () => op === "line-graph" ? generateLineGraph(seed) : [],
    [op, seed],
  );
  const crossTableProblems = useMemo(
    () => op === "cross-table" ? generateCrossTable(seed) : [],
    [op, seed],
  );
  const repProblems = useMemo(
    () => op === "representative" ? generateRepresentative(seed, repfind) : [],
    [op, seed, repfind],
  );
  const countingProblems = useMemo(
    () => op === "counting" ? generateCounting(seed) : [],
    [op, seed],
  );
  const freqTableProblems = useMemo(
    () => op === "freq-table" ? generateFreqTable(seed) : [],
    [op, seed],
  );
  const dataProblems = useMemo(
    () => op === "data-analysis" ? generateDataAnalysis(seed, damode) : [],
    [op, seed, damode],
  );
  const probProblems = useMemo(
    () => op === "probability" ? generateProbability(seed, pbmode) : [],
    [op, seed, pbmode],
  );
  const sampProblems = useMemo(
    () => op === "sampling" ? generateSampling(seed, spmode) : [],
    [op, seed, spmode],
  );

  /* ---- settings panel ---- */

  const renderSettings = () => {
    switch (op) {
      case "table-read":
        return (
          <div className="no-print settings-panel">
            <label>
              カテゴリ数{" "}
              <select className="operator-select" value={cats}
                onChange={(e) => onCatsChange(Number(e.target.value))}>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </label>
          </div>
        );
      case "bar-graph":
        return (
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
      case "representative":
        return (
          <div className="no-print settings-panel">
            <label>
              求めるもの{" "}
              <select className="operator-select" value={repfind}
                onChange={(e) => onRepfindChange(e.target.value as RepFind)}>
                <option value="mixed">すべて</option>
                <option value="mean">平均値</option>
                <option value="median">中央値</option>
                <option value="mode">最頻値</option>
              </select>
            </label>
          </div>
        );
      case "data-analysis":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={damode}
                onChange={(e) => onDamodeChange(e.target.value as DataAnalysisMode)}>
                <option value="mixed">すべて</option>
                <option value="representative">代表値</option>
                <option value="frequency">度数分布表</option>
              </select>
            </label>
          </div>
        );
      case "probability":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={pbmode}
                onChange={(e) => onPbmodeChange(e.target.value as ProbabilityMode)}>
                <option value="mixed">すべて</option>
                <option value="basic">基本</option>
                <option value="two-dice">2つのさいころ</option>
              </select>
            </label>
          </div>
        );
      case "sampling":
        return (
          <div className="no-print settings-panel">
            <label>
              種類{" "}
              <select className="operator-select" value={spmode}
                onChange={(e) => onSpmodeChange(e.target.value as SamplingMode)}>
                <option value="mixed">すべて</option>
                <option value="concept">概念</option>
                <option value="estimation">推定</option>
              </select>
            </label>
          </div>
        );
      case "line-graph":
      case "cross-table":
      case "counting":
      case "freq-table":
        return null;
      default:
        return null;
    }
  };

  /* ---- render helpers ---- */

  const renderTextProblems = (items: TextProblem[]) => (
    <div className="dev-text-page">
      {items.map((p, i) => (
        <div key={i} className="dev-text-row">
          <span className="g1-num">({i + 1})</span>
          <span className="dev-text-q">{p.question}</span>
          <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.answer}</span>
        </div>
      ))}
    </div>
  );

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

  /* ---- render problems ---- */

  const renderProblems = () => {
    switch (op) {
      case "table-read":
        return (
          <div className="dev-text-page">
            {tableProblems.map((tp, idx) => (
              <div key={idx} className="dev-prop-block">
                <div className="dev-prop-label">({idx + 1}) {tp.title}</div>
                <table className="dev-prop-table">
                  <thead><tr>{tp.categories.map((c, j) => <th key={j}>{c}</th>)}</tr></thead>
                  <tbody><tr>{tp.values.map((v, j) => <td key={j}>{v}</td>)}</tr></tbody>
                </table>
                <div style={{ marginTop: 8 }}>
                  {tp.questions.map((q, j) => (
                    <div key={j} className="dev-text-row">
                      <span className="dev-text-q">{q.question}</span>
                      <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{q.answer}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case "bar-graph":
        return (
          <div className="dev-text-page">
            {barGraphProblems.map((bp, idx) => (
              <div key={idx} className="dev-prop-block">
                <div className="dev-prop-label">({idx + 1}) {bp.title}</div>
                {renderBarChart(bp)}
                <div style={{ marginTop: 8 }}>
                  {bp.questions.map((q, j) => (
                    <div key={j} className="dev-text-row">
                      <span className="dev-text-q">{q.question}</span>
                      <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{q.answer}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case "line-graph":
        return (
          <div className="dev-text-page">
            {lineGraphProblems.map((p, idx) => {
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
        );

      case "cross-table":
        return (
          <div className="dev-text-page">
            {crossTableProblems.map((p, idx) => {
              let ansIdx = 0;
              return (
                <div key={idx} className="dev-prop-block">
                  <div className="dev-prop-label">({idx + 1}) {p.title}</div>
                  <table className="dev-prop-table">
                    <thead><tr><th></th>{p.colLabels.map((col, j) => <th key={j}>{col}</th>)}</tr></thead>
                    <tbody>
                      {p.rowLabels.map((row, r) => (
                        <tr key={r}>
                          <td><strong>{row}</strong></td>
                          {p.cells[r].map((cell, c) => {
                            if (cell !== null) return <td key={c}>{cell}</td>;
                            const ans = p.answers[ansIdx++];
                            return (<td key={c} className="dev-prop-blank">
                              <span className={showAnswers ? "dev-frac-ans" : "g1-hidden"}>{ans}</span>
                            </td>);
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        );

      case "representative":
        return (
          <div className="dev-text-page">
            {repProblems.map((p, i) => (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1}) データ: {p.data.join(", ")}</div>
                {(repfind === "mean" || repfind === "mixed") && (
                  <div className="dev-text-row">
                    <span className="dev-text-q">平均値:</span>
                    <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.meanAnswer}</span>
                  </div>
                )}
                {(repfind === "median" || repfind === "mixed") && (
                  <div className="dev-text-row">
                    <span className="dev-text-q">中央値:</span>
                    <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.medianAnswer}</span>
                  </div>
                )}
                {(repfind === "mode" || repfind === "mixed") && (
                  <div className="dev-text-row">
                    <span className="dev-text-q">最頻値:</span>
                    <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.modeAnswer}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case "counting":
        return renderTextProblems(countingProblems);

      case "freq-table":
        return (
          <div className="dev-text-page">
            {freqTableProblems.map((p, idx) => {
              let ansIdx = 0;
              return (
                <div key={idx} className="dev-prop-block">
                  <div className="dev-prop-label">({idx + 1}) データ: {p.data.join(", ")}</div>
                  <table className="dev-prop-table">
                    <thead><tr><th>階級</th><th>度数</th></tr></thead>
                    <tbody>
                      {p.classes.map((cls, j) => {
                        const freq = p.frequencies[j];
                        if (freq !== null) return (<tr key={j}><td>{cls}</td><td>{freq}</td></tr>);
                        const ans = p.answers[ansIdx++];
                        return (<tr key={j}><td>{cls}</td><td className="dev-prop-blank">
                          <span className={showAnswers ? "dev-frac-ans" : "g1-hidden"}>{ans}</span>
                        </td></tr>);
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        );

      case "data-analysis":
        return (
          <div className="dev-text-page">
            {dataProblems.map((p: DataAnalysisProblem, i: number) => {
              if (p.mode === "representative") {
                return (
                  <div key={i} className="dev-prop-block">
                    <div className="dev-prop-label">({i + 1}) データ: {p.data.join(", ")}</div>
                    <div className="dev-text-row"><span className="dev-text-q">平均値:</span><span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.mean}</span></div>
                    <div className="dev-text-row"><span className="dev-text-q">中央値:</span><span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.median}</span></div>
                    <div className="dev-text-row"><span className="dev-text-q">最頻値:</span><span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.modeValue}</span></div>
                    <div className="dev-text-row"><span className="dev-text-q">範囲:</span><span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.range}</span></div>
                  </div>
                );
              }
              // frequency table
              return (
                <div key={i} className="dev-prop-block">
                  <div className="dev-prop-label">({i + 1}) 度数分布表を完成させなさい（合計 {p.total} 人）</div>
                  <table className="dev-prop-table">
                    <thead><tr><th>階級</th><th>度数</th><th>相対度数</th><th>累積度数</th></tr></thead>
                    <tbody>
                      {p.classes.map((cls, j) => {
                        const hidden = p.hiddenIndices.includes(j);
                        return (
                          <tr key={j}>
                            <td>{cls[0]}以上{cls[1]}未満</td>
                            <td className={hidden ? "dev-prop-blank" : ""}>
                              {hidden ? (<span className={showAnswers ? "dev-frac-ans" : "g1-hidden"}>{p.frequencies[j]}</span>) : p.frequencies[j]}
                            </td>
                            <td>{p.relativeFrequencies[j].toFixed(2)}</td>
                            <td>{p.cumulativeFrequencies[j]}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        );

      case "probability":
        return (
          <div className="dev-text-page">
            {probProblems.map((p, i) => (
              <div key={i} className="dev-text-row">
                <span className="g1-num">({i + 1})</span>
                <span className="dev-text-q">{p.question}</span>
                <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`} style={{ alignItems: "center" }}>
                  {p.ansDen === 1 ? p.ansNum : <Frac num={p.ansNum} den={p.ansDen} />}
                </span>
              </div>
            ))}
          </div>
        );

      case "sampling":
        return (
          <div className="dev-text-page">
            {sampProblems.map((p, i) => (
              <div key={i} className="dev-text-row">
                <span className="g1-num">({i + 1})</span>
                <span className="dev-text-q">{p.question}</span>
                <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.answerDisplay}</span>
              </div>
            ))}
          </div>
        );

      default:
        return <p>不明な問題タイプです</p>;
    }
  };

  return (
    <ProblemPageLayout
      showAnswers={showAnswers}
      showSettings={showSettings}
      handleNew={handleNew}
      handleToggleAnswers={handleToggleAnswers}
      setShowSettings={setShowSettings}
      settingsPanel={renderSettings()}
      qrUrl={qrUrl}
    >
      {renderProblems()}
    </ProblemPageLayout>
  );
};

/* ================================================================
   Exported group definition
   ================================================================ */

export const data: ProblemGroup = {
  id: "data",
  label: "データ・統計",
  operators: [
    { operator: "table-read", label: "表の読み取り", grades: [2], category: "data" },
    { operator: "bar-graph", label: "棒グラフ", grades: [3], category: "data" },
    { operator: "line-graph", label: "折れ線グラフ", grades: [4], category: "data" },
    { operator: "cross-table", label: "二次元の表", grades: [4], category: "data" },
    { operator: "representative", label: "代表値", grades: [6], category: "data" },
    { operator: "counting", label: "場合の数", grades: [6], category: "data" },
    { operator: "freq-table", label: "度数分布表", grades: [6], category: "data" },
    { operator: "data-analysis", label: "データの分析", grades: [7], category: "data" },
    { operator: "probability", label: "確率", grades: [8], category: "data" },
    { operator: "sampling", label: "標本調査", grades: [9], category: "data" },
  ],
  Component: Data,
};
