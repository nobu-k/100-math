import { useCallback, useMemo } from "react";
import { examOperatorGroups, examOperatorMap } from "./registry";
import type { ExamSection } from "./types";

interface ExamConfigProps {
  title: string;
  onTitleChange: (title: string) => void;
  sections: ExamSection[];
  onSectionsChange: (sections: ExamSection[]) => void;
  onNewSeed: () => void;
  showAnswers: boolean;
  onToggleAnswers: () => void;
}

let nextId = 1;
const genId = () => `s${nextId++}`;

const ExamConfig = ({
  title,
  onTitleChange,
  sections,
  onSectionsChange,
  onNewSeed,
  showAnswers,
  onToggleAnswers,
}: ExamConfigProps) => {
  const groups = useMemo(examOperatorGroups, []);

  const updateSection = useCallback(
    (id: string, patch: Partial<ExamSection>) => {
      onSectionsChange(
        sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      );
    },
    [sections, onSectionsChange],
  );

  const removeSection = useCallback(
    (id: string) => {
      onSectionsChange(sections.filter((s) => s.id !== id));
    },
    [sections, onSectionsChange],
  );

  const addSection = useCallback(() => {
    const firstOp = groups[0]?.operators[0];
    if (!firstOp) return;
    onSectionsChange([
      ...sections,
      {
        id: genId(),
        operatorKey: firstOp.key,
        count: firstOp.defaultCount,
      },
    ]);
  }, [groups, sections, onSectionsChange]);

  const handleGroupChange = useCallback(
    (sectionId: string, groupLabel: string) => {
      const group = groups.find((g) => g.label === groupLabel);
      const firstOp = group?.operators[0];
      if (!firstOp) return;
      updateSection(sectionId, {
        operatorKey: firstOp.key,
        count: firstOp.defaultCount,
      });
    },
    [groups, updateSection],
  );

  const handleOperatorChange = useCallback(
    (sectionId: string, opKey: string) => {
      const def = examOperatorMap.get(opKey);
      if (!def) return;
      updateSection(sectionId, {
        operatorKey: opKey,
        count: def.defaultCount,
      });
    },
    [updateSection],
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="exam-config">
      <h2 className="exam-config-title">試験作成</h2>

      <input
        className="exam-title-input"
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="テストのタイトル"
      />

      {sections.map((sec, idx) => {
        const def = examOperatorMap.get(sec.operatorKey);
        const currentGroup = def?.groupLabel ?? groups[0]?.label ?? "";
        const currentGroupOps = groups.find((g) => g.label === currentGroup)?.operators ?? [];

        return (
          <div key={sec.id} className="exam-section-card">
            <div className="exam-section-header">
              <span className="exam-section-number">大問 {idx + 1}</span>
              <button
                className="exam-section-delete"
                onClick={() => removeSection(sec.id)}
                title="削除"
              >
                ×
              </button>
            </div>

            <div className="exam-section-row">
              <label>分類</label>
              <select
                value={currentGroup}
                onChange={(e) => handleGroupChange(sec.id, e.target.value)}
              >
                {groups.map((g) => (
                  <option key={g.label} value={g.label}>{g.label}</option>
                ))}
              </select>
            </div>

            <div className="exam-section-row">
              <label>種類</label>
              <select
                value={sec.operatorKey}
                onChange={(e) => handleOperatorChange(sec.id, e.target.value)}
              >
                {currentGroupOps.map((op) => (
                  <option key={op.key} value={op.key}>{op.label}</option>
                ))}
              </select>
            </div>

            <div className="exam-section-row">
              <label>問題数</label>
              <div className="exam-count-control">
                <button
                  className="exam-count-btn"
                  onClick={() => updateSection(sec.id, { count: Math.max(1, sec.count - 1) })}
                >
                  −
                </button>
                <span className="exam-count-val">{sec.count}</span>
                <button
                  className="exam-count-btn"
                  onClick={() => updateSection(sec.id, { count: Math.min(def?.maxCount ?? 20, sec.count + 1) })}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <div className="exam-config-actions">
        <button className="exam-add-btn" onClick={addSection}>
          + セクション追加
        </button>
        <div className="exam-action-row">
          <button className="exam-action-btn" onClick={onNewSeed}>新しい問題</button>
          <button className="exam-action-btn" onClick={onToggleAnswers}>
            {showAnswers ? "答え非表示" : "答え表示"}
          </button>
        </div>
        <button className="exam-action-btn" onClick={handlePrint}>印刷</button>
      </div>
    </div>
  );
};

export default ExamConfig;
