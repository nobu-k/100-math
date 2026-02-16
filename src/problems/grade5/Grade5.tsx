import { useState, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { mulberry32, randomSeed, seedToHex, hexToSeed } from "../random";
import type { ProblemGroup } from "../types";

/* ================================================================
   Types
   ================================================================ */

type Grade5Op =
  | "percent"
  | "speed"
  | "area-formula"
  | "frac-decimal"
  | "average";

interface TextProblem {
  question: string;
  answer: string;
}

/* ================================================================
   Generators
   ================================================================ */

function generatePercent(
  seed: number,
  find: "ratio" | "compared" | "base" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const type = find === "mixed"
      ? (["ratio", "compared", "base"] as const)[Math.floor(rng() * 3)]
      : find;

    // generate clean numbers: base is multiple of 10, ratio is multiple of 5%
    const base = (2 + Math.floor(rng() * 19)) * 10; // 20-200 step 10
    const pct = (1 + Math.floor(rng() * 19)) * 5;  // 5%-95% step 5
    const compared = base * pct / 100;

    switch (type) {
      case "ratio":
        problems.push({
          question: `${base}人中${compared}人は何%？`,
          answer: `${pct}%`,
        });
        break;
      case "compared":
        problems.push({
          question: `${base}の${pct}%はいくつ？`,
          answer: `${compared}`,
        });
        break;
      case "base":
        problems.push({
          question: `□の${pct}%が${compared}のとき、□はいくつ？`,
          answer: `${base}`,
        });
        break;
    }
  }
  return problems;
}

function generateSpeed(
  seed: number,
  find: "speed" | "time" | "distance" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const type = find === "mixed"
      ? (["speed", "time", "distance"] as const)[Math.floor(rng() * 3)]
      : find;

    // clean values: speed is multiple of 10, time is small integer
    const speed = (3 + Math.floor(rng() * 18)) * 10; // 30-200 step 10
    const time = 1 + Math.floor(rng() * 8);           // 1-8 hours
    const distance = speed * time;

    switch (type) {
      case "distance":
        problems.push({
          question: `時速${speed}kmで${time}時間走ると何km？`,
          answer: `${distance}km`,
        });
        break;
      case "time":
        problems.push({
          question: `${distance}kmを時速${speed}kmで走ると何時間？`,
          answer: `${time}時間`,
        });
        break;
      case "speed":
        problems.push({
          question: `${distance}kmを${time}時間で走ったときの時速は？`,
          answer: `時速${speed}km`,
        });
        break;
    }
  }
  return problems;
}

function generateAreaFormula(
  seed: number,
  shape: "triangle" | "parallelogram" | "trapezoid" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const type = shape === "mixed"
      ? (["triangle", "parallelogram", "trapezoid"] as const)[Math.floor(rng() * 3)]
      : shape;

    switch (type) {
      case "triangle": {
        const base = 2 + Math.floor(rng() * 18); // even for clean halving
        const height = 2 + Math.floor(rng() * 18);
        // ensure integer area
        const b = base % 2 === 0 ? base : base + 1;
        const area = (b * height) / 2;
        problems.push({
          question: `底辺${b}cm、高さ${height}cmの三角形の面積は？`,
          answer: `${area}cm²`,
        });
        break;
      }
      case "parallelogram": {
        const base = 2 + Math.floor(rng() * 18);
        const height = 2 + Math.floor(rng() * 18);
        const area = base * height;
        problems.push({
          question: `底辺${base}cm、高さ${height}cmの平行四辺形の面積は？`,
          answer: `${area}cm²`,
        });
        break;
      }
      case "trapezoid": {
        const upper = 2 + Math.floor(rng() * 10);
        const lower = upper + 2 + Math.floor(rng() * 10);
        const height = 2 + Math.floor(rng() * 14);
        // ensure integer area
        const sum = upper + lower;
        const h = sum % 2 === 0 ? height : (height % 2 === 0 ? height : height + 1);
        const area = (sum * h) / 2;
        problems.push({
          question: `上底${upper}cm、下底${lower}cm、高さ${h}cmの台形の面積は？`,
          answer: `${area}cm²`,
        });
        break;
      }
    }
  }
  return problems;
}

function generateFracDecimal(
  seed: number,
  direction: "to-decimal" | "to-fraction" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  // Fractions that convert to terminating decimals
  const cleanFracs: [number, number][] = [
    [1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5],
    [1, 8], [3, 8], [5, 8], [7, 8], [1, 10], [3, 10], [7, 10], [9, 10],
    [1, 20], [3, 20], [7, 20], [9, 20],
    [1, 25], [2, 25], [3, 25], [4, 25],
  ];

  for (let i = 0; i < 10; i++) {
    const dir = direction === "mixed"
      ? (rng() < 0.5 ? "to-decimal" : "to-fraction")
      : direction;

    const [num, den] = cleanFracs[Math.floor(rng() * cleanFracs.length)];
    const decimal = num / den;
    const decStr = decimal % 1 === 0 ? String(decimal) : decimal.toFixed(
      String(decimal).split(".")[1]?.length ?? 1
    );

    if (dir === "to-decimal") {
      problems.push({
        question: `${num}/${den} を小数で表しなさい`,
        answer: decStr,
      });
    } else {
      problems.push({
        question: `${decStr} を分数で表しなさい`,
        answer: `${num}/${den}`,
      });
    }
  }
  return problems;
}

function generateAverage(
  seed: number,
  count: number,
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 8; i++) {
    const n = count;
    // generate values that have an integer average
    const avg = 50 + Math.floor(rng() * 50);
    const total = avg * n;
    const values: number[] = [];
    let remaining = total;
    for (let j = 0; j < n - 1; j++) {
      const maxVal = Math.min(100, remaining - (n - j - 1));
      const minVal = Math.max(1, remaining - 100 * (n - j - 1));
      const v = minVal + Math.floor(rng() * (maxVal - minVal + 1));
      values.push(v);
      remaining -= v;
    }
    values.push(remaining);

    // shuffle
    for (let j = values.length - 1; j > 0; j--) {
      const k = Math.floor(rng() * (j + 1));
      [values[j], values[k]] = [values[k], values[j]];
    }

    problems.push({
      question: `${values.join("、")} の平均は？`,
      answer: `${avg}`,
    });
  }
  return problems;
}

/* ================================================================
   URL state helpers
   ================================================================ */

const ALL_PARAMS = ["q", "answers", "pfind", "sfind", "ashape", "fdir", "acnt"];

function cleanParams(url: URL) {
  for (const k of ALL_PARAMS) url.searchParams.delete(k);
}

/* ================================================================
   Defaults
   ================================================================ */

const PCT_DEF = { pfind: "mixed" as const };
const SPD_DEF = { sfind: "mixed" as const };
const AREA_DEF = { ashape: "mixed" as const };
const FRAC_DEF = { fdir: "mixed" as const };
const AVG_DEF = { acnt: 5 };

/* ================================================================
   Main component
   ================================================================ */

function Grade5({ operator }: { operator: string }) {
  const op = operator as Grade5Op;

  const getInitial = () => {
    const p = new URLSearchParams(window.location.search);
    const qHex = p.get("q");
    const seed = qHex ? hexToSeed(qHex) ?? randomSeed() : randomSeed();
    const showAnswers = p.get("answers") === "1";

    const pfindRaw = p.get("pfind") ?? PCT_DEF.pfind;
    const pfind: "ratio" | "compared" | "base" | "mixed" =
      (["ratio", "compared", "base", "mixed"] as const).includes(pfindRaw as any)
        ? (pfindRaw as any) : PCT_DEF.pfind;

    const sfindRaw = p.get("sfind") ?? SPD_DEF.sfind;
    const sfind: "speed" | "time" | "distance" | "mixed" =
      (["speed", "time", "distance", "mixed"] as const).includes(sfindRaw as any)
        ? (sfindRaw as any) : SPD_DEF.sfind;

    const ashapeRaw = p.get("ashape") ?? AREA_DEF.ashape;
    const ashape: "triangle" | "parallelogram" | "trapezoid" | "mixed" =
      (["triangle", "parallelogram", "trapezoid", "mixed"] as const).includes(ashapeRaw as any)
        ? (ashapeRaw as any) : AREA_DEF.ashape;

    const fdirRaw = p.get("fdir") ?? FRAC_DEF.fdir;
    const fdir: "to-decimal" | "to-fraction" | "mixed" =
      (["to-decimal", "to-fraction", "mixed"] as const).includes(fdirRaw as any)
        ? (fdirRaw as any) : FRAC_DEF.fdir;

    const acnt = Math.max(3, Math.min(6,
      parseInt(p.get("acnt") ?? String(AVG_DEF.acnt), 10) || AVG_DEF.acnt));

    return { seed, showAnswers, pfind, sfind, ashape, fdir, acnt };
  };

  const [initial] = useState(getInitial);
  const [seed, setSeed] = useState(initial.seed);
  const [showAnswers, setShowAnswers] = useState(initial.showAnswers);
  const [showSettings, setShowSettings] = useState(false);

  const [pfind, setPfind] = useState(initial.pfind);
  const [sfind, setSfind] = useState(initial.sfind);
  const [ashape, setAshape] = useState(initial.ashape);
  const [fdir, setFdir] = useState(initial.fdir);
  const [acnt, setAcnt] = useState(initial.acnt);

  const syncUrl = useCallback(
    (s: number, ans: boolean, overrides?: Record<string, string>) => {
      const url = new URL(window.location.href);
      cleanParams(url);
      url.searchParams.set("q", seedToHex(s));
      if (ans) url.searchParams.set("answers", "1");
      if (overrides) {
        for (const [k, v] of Object.entries(overrides)) url.searchParams.set(k, v);
      }
      window.history.replaceState(null, "", url.toString());
    },
    [],
  );

  const settingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    switch (op) {
      case "percent":
        if (pfind !== PCT_DEF.pfind) m.pfind = pfind;
        break;
      case "speed":
        if (sfind !== SPD_DEF.sfind) m.sfind = sfind;
        break;
      case "area-formula":
        if (ashape !== AREA_DEF.ashape) m.ashape = ashape;
        break;
      case "frac-decimal":
        if (fdir !== FRAC_DEF.fdir) m.fdir = fdir;
        break;
      case "average":
        if (acnt !== AVG_DEF.acnt) m.acnt = String(acnt);
        break;
    }
    return m;
  }, [op, pfind, sfind, ashape, fdir, acnt]);

  useState(() => { syncUrl(seed, showAnswers, settingsParams()); });

  const handleNew = useCallback(() => {
    const s = randomSeed();
    setSeed(s);
    setShowAnswers(false);
    syncUrl(s, false, settingsParams());
  }, [syncUrl, settingsParams]);

  const handleToggleAnswers = useCallback(() => {
    setShowAnswers((prev) => {
      syncUrl(seed, !prev, settingsParams());
      return !prev;
    });
  }, [seed, syncUrl, settingsParams]);

  const regen = useCallback(
    (overrides: Record<string, string>) => {
      const s = randomSeed();
      setSeed(s);
      setShowAnswers(false);
      syncUrl(s, false, overrides);
    },
    [syncUrl],
  );

  const qrUrl = useMemo(() => {
    const url = new URL(window.location.href);
    cleanParams(url);
    url.searchParams.set("q", seedToHex(seed));
    url.searchParams.set("answers", "1");
    const sp = settingsParams();
    for (const [k, v] of Object.entries(sp)) url.searchParams.set(k, v);
    return url.toString();
  }, [seed, settingsParams]);

  /* ---- settings change handlers ---- */

  const onPfindChange = useCallback((v: typeof pfind) => {
    setPfind(v);
    const p: Record<string, string> = {};
    if (v !== PCT_DEF.pfind) p.pfind = v;
    regen(p);
  }, [regen]);

  const onSfindChange = useCallback((v: typeof sfind) => {
    setSfind(v);
    const p: Record<string, string> = {};
    if (v !== SPD_DEF.sfind) p.sfind = v;
    regen(p);
  }, [regen]);

  const onAshapeChange = useCallback((v: typeof ashape) => {
    setAshape(v);
    const p: Record<string, string> = {};
    if (v !== AREA_DEF.ashape) p.ashape = v;
    regen(p);
  }, [regen]);

  const onFdirChange = useCallback((v: typeof fdir) => {
    setFdir(v);
    const p: Record<string, string> = {};
    if (v !== FRAC_DEF.fdir) p.fdir = v;
    regen(p);
  }, [regen]);

  const onAcntChange = useCallback((v: number) => {
    setAcnt(v);
    const p: Record<string, string> = {};
    if (v !== AVG_DEF.acnt) p.acnt = String(v);
    regen(p);
  }, [regen]);

  /* ---- generate problems ---- */

  const pctProblems = useMemo(
    () => op === "percent" ? generatePercent(seed, pfind) : [],
    [op, seed, pfind],
  );
  const spdProblems = useMemo(
    () => op === "speed" ? generateSpeed(seed, sfind) : [],
    [op, seed, sfind],
  );
  const areaProblems = useMemo(
    () => op === "area-formula" ? generateAreaFormula(seed, ashape) : [],
    [op, seed, ashape],
  );
  const fracProblems = useMemo(
    () => op === "frac-decimal" ? generateFracDecimal(seed, fdir) : [],
    [op, seed, fdir],
  );
  const avgProblems = useMemo(
    () => op === "average" ? generateAverage(seed, acnt) : [],
    [op, seed, acnt],
  );

  /* ---- settings panel ---- */

  const renderSettings = () => {
    switch (op) {
      case "percent":
        return (
          <div className="no-print settings-panel">
            <label>
              求めるもの{" "}
              <select className="operator-select" value={pfind}
                onChange={(e) => onPfindChange(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="ratio">割合（何%？）</option>
                <option value="compared">比べる量</option>
                <option value="base">もとにする量</option>
              </select>
            </label>
          </div>
        );
      case "speed":
        return (
          <div className="no-print settings-panel">
            <label>
              求めるもの{" "}
              <select className="operator-select" value={sfind}
                onChange={(e) => onSfindChange(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="distance">距離</option>
                <option value="time">時間</option>
                <option value="speed">速さ</option>
              </select>
            </label>
          </div>
        );
      case "area-formula":
        return (
          <div className="no-print settings-panel">
            <label>
              図形{" "}
              <select className="operator-select" value={ashape}
                onChange={(e) => onAshapeChange(e.target.value as any)}>
                <option value="mixed">すべて</option>
                <option value="triangle">三角形</option>
                <option value="parallelogram">平行四辺形</option>
                <option value="trapezoid">台形</option>
              </select>
            </label>
          </div>
        );
      case "frac-decimal":
        return (
          <div className="no-print settings-panel">
            <label>
              変換方向{" "}
              <select className="operator-select" value={fdir}
                onChange={(e) => onFdirChange(e.target.value as any)}>
                <option value="mixed">両方</option>
                <option value="to-decimal">分数→小数</option>
                <option value="to-fraction">小数→分数</option>
              </select>
            </label>
          </div>
        );
      case "average":
        return (
          <div className="no-print settings-panel">
            <label>
              データの個数{" "}
              <select className="operator-select" value={acnt}
                onChange={(e) => onAcntChange(Number(e.target.value))}>
                <option value={3}>3個</option>
                <option value={4}>4個</option>
                <option value={5}>5個</option>
                <option value={6}>6個</option>
              </select>
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  /* ---- render problems ---- */

  const renderProblems = () => {
    switch (op) {
      case "percent":
      case "speed":
      case "area-formula":
      case "frac-decimal":
      case "average": {
        const items = op === "percent" ? pctProblems
          : op === "speed" ? spdProblems
          : op === "area-formula" ? areaProblems
          : op === "frac-decimal" ? fracProblems
          : avgProblems;
        return (
          <div className="dev-text-page">
            {items.map((p, i) => (
              <div key={i} className="dev-text-row">
                <span className="g1-num">({i + 1})</span>
                <span className="dev-text-q">{p.question}</span>
                <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                  {p.answer}
                </span>
              </div>
            ))}
          </div>
        );
      }
      default:
        return <p>不明な問題タイプです</p>;
    }
  };

  return (
    <>
      <div className="no-print controls">
        <button onClick={handleNew}>新しい問題</button>
        <button onClick={handleToggleAnswers}>
          {showAnswers ? "答えを隠す" : "答え"}
        </button>
        <button onClick={() => setShowSettings((v) => !v)}>設定</button>
      </div>
      {showSettings && renderSettings()}
      {renderProblems()}
      <div className="qr-section">
        <QRCodeSVG value={qrUrl} size={80} />
        <span className="qr-label">答え</span>
      </div>
    </>
  );
}

export default Grade5;

export const devGrade5: ProblemGroup = {
  id: "dev5",
  label: "5年（開発中）",
  operators: [
    { operator: "percent", label: "割合と百分率" },
    { operator: "speed", label: "速さ・時間・距離" },
    { operator: "area-formula", label: "面積の公式" },
    { operator: "frac-decimal", label: "分数と小数" },
    { operator: "average", label: "平均" },
  ],
  Component: Grade5,
};
