import { useState, useCallback, useEffect } from "react";
import { randomSeed, seedToHex, hexToSeed } from "../problems/random";
import { examOperatorMap, examOperators } from "./registry";
import ExamConfig from "./ExamConfig";
import ExamPreview from "./ExamPreview";
import type { ExamSection, ExamState } from "./types";
import "./exam.css";

let nextId = 100;
const genId = () => `s${nextId++}`;

const parseUrl = (): ExamState => {
  const p = new URLSearchParams(window.location.search);
  const seedHex = p.get("q");
  const seed = seedHex ? hexToSeed(seedHex) ?? randomSeed() : randomSeed();
  const title = p.get("t") ?? "";
  const showAnswers = p.get("a") === "1";

  const sectionsParam = p.get("s") ?? "";
  const sections: ExamSection[] = [];
  if (sectionsParam) {
    for (const part of sectionsParam.split(",")) {
      const lastSlash = part.lastIndexOf("/");
      const secondLastSlash = part.lastIndexOf("/", lastSlash - 1);
      if (secondLastSlash < 0) continue;
      const opKey = part.slice(0, lastSlash);
      const countStr = part.slice(lastSlash + 1);
      const count = parseInt(countStr, 10);
      if (!examOperatorMap.has(opKey) || isNaN(count)) continue;
      sections.push({ id: genId(), operatorKey: opKey, count });
    }
  }

  if (sections.length === 0) {
    const first = examOperators[0];
    if (first) {
      sections.push({
        id: genId(),
        operatorKey: first.key,
        count: first.defaultCount,
      });
    }
  }

  return { seed, title, sections, showAnswers };
};

const buildUrl = (state: ExamState): string => {
  const p = new URLSearchParams();
  p.set("q", seedToHex(state.seed));
  if (state.title) p.set("t", state.title);
  if (state.showAnswers) p.set("a", "1");
  if (state.sections.length > 0) {
    p.set(
      "s",
      state.sections.map((s) => `${s.operatorKey}/${s.count}`).join(","),
    );
  }
  return `?${p.toString()}`;
};

const ExamPage = () => {
  const [state, setState] = useState<ExamState>(parseUrl);

  useEffect(() => {
    const url = `/exam${buildUrl(state)}`;
    window.history.replaceState(null, "", url);
  }, [state]);

  const setSections = useCallback(
    (sections: ExamSection[]) => setState((s) => ({ ...s, sections })),
    [],
  );

  const setTitle = useCallback(
    (title: string) => setState((s) => ({ ...s, title })),
    [],
  );

  const handleNewSeed = useCallback(
    () => setState((s) => ({ ...s, seed: randomSeed() })),
    [],
  );

  const handleToggleAnswers = useCallback(
    () => setState((s) => ({ ...s, showAnswers: !s.showAnswers })),
    [],
  );

  return (
    <div className="exam-layout">
      <ExamConfig
        title={state.title}
        onTitleChange={setTitle}
        sections={state.sections}
        onSectionsChange={setSections}
        onNewSeed={handleNewSeed}
        showAnswers={state.showAnswers}
        onToggleAnswers={handleToggleAnswers}
      />
      <div className="exam-preview-panel">
        <ExamPreview
          seed={state.seed}
          title={state.title}
          sections={state.sections}
          showAnswers={state.showAnswers}
        />
      </div>
    </div>
  );
};

export default ExamPage;
