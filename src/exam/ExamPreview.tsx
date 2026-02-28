import { useMemo } from "react";
import { mulberry32 } from "../problems/random";
import { examOperatorMap } from "./registry";
import type { ExamSection } from "./types";

interface ExamPreviewProps {
  seed: number;
  title: string;
  sections: ExamSection[];
  showAnswers: boolean;
}

const SECTION_LABELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const ExamPreview = ({ seed, title, sections, showAnswers }: ExamPreviewProps) => {
  const generated = useMemo(() => {
    const rng = mulberry32(seed);
    return sections.map((sec) => {
      const def = examOperatorMap.get(sec.operatorKey);
      if (!def) return { def: null, problems: [] };
      const sectionSeed = (rng() * 0xffffffff) >>> 0;
      const problems = def.generate(sectionSeed, sec.count);
      return { def, problems };
    });
  }, [seed, sections, showAnswers]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="exam-preview">
      <div className="exam-header">
        <h1 className="exam-header-title">{title || "テスト"}</h1>
        <span className="exam-name-line">
          名前<span className="exam-name-blank" />
        </span>
      </div>
      {generated.map((g, i) => {
        if (!g.def) return null;
        return (
          <div key={sections[i].id} className="exam-section">
            <div className="exam-section-title">
              <span className="exam-section-title-num">{SECTION_LABELS[i] ?? i + 1}</span>
              <span className="exam-section-title-inst">{g.def.instruction}</span>
            </div>
            {g.def.render(g.problems, showAnswers)}
          </div>
        );
      })}
    </div>
  );
};

export default ExamPreview;
