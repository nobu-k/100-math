import { useState, useCallback, useEffect, useMemo } from "react";
import { NavLink, Outlet, useMatches } from "react-router-dom";
import { problemGroups } from "./problems";
import type { OperatorRoute } from "./problems";
import "./App.css";

type ViewMode = "category" | "grade";

interface GradeEntry {
  groupId: string;
  groupLabel: string;
  op: OperatorRoute;
}

const GRADE_LABELS: Record<number, string> = {
  1: "小1", 2: "小2", 3: "小3", 4: "小4", 5: "小5", 6: "小6",
  7: "中1", 8: "中2", 9: "中3", 10: "高1", 11: "高2", 12: "高3",
};

const CATEGORY_LABELS: [string, string][] = [
  ["computation", "計算"],
  ["numbers", "数の性質"],
  ["fractions", "分数・小数"],
  ["equations", "式・方程式"],
  ["geometry", "図形"],
  ["measurement", "測定"],
  ["relations", "変化と関係"],
  ["data", "データ・統計"],
];

const App = () => {
  const matches = useMatches();
  const handle = matches[matches.length - 1]?.handle as
    { groupLabel: string; opLabel: string } | undefined;
  const [menuOpen, setMenuOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);

  const gradeView = useMemo(buildGradeView, []);
  const categoryView = useMemo(buildCategoryView, []);

  /* ---- copy handler: replace KaTeX with plain-text from data-text ---- */
  useEffect(() => {
    const onCopy = (e: ClipboardEvent) => {
      const sel = document.getSelection();
      if (!sel || sel.isCollapsed) return;
      const range = sel.getRangeAt(0);
      const fragment = range.cloneContents();
      const walk = (node: Node) => {
        if (node instanceof HTMLElement && node.dataset.text !== undefined) {
          const text = document.createTextNode(node.dataset.text);
          node.replaceWith(text);
          return;
        }
        // walk children (copy to array first since replaceWith mutates)
        const children = Array.from(node.childNodes);
        for (const child of children) walk(child);
      };
      walk(fragment);
      const div = document.createElement("div");
      div.appendChild(fragment);
      e.clipboardData?.setData("text/plain", div.textContent ?? "");
      e.preventDefault();
    };
    document.addEventListener("copy", onCopy);
    return () => document.removeEventListener("copy", onCopy);
  }, []);

  const toggleGroup = useCallback((groupId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  const switchView = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    setCollapsed(new Set());
    try { localStorage.setItem("sidebar-view", mode); } catch { /* ignore */ }
  }, []);

  const renderGradeBadges = (op: OperatorRoute) => {
    if (!op.grades?.length) return null;
    return (
      <span className="grade-badges">
        {op.grades.map((g) => (
          <span key={g} className="grade-badge">{GRADE_LABELS[g] ?? g}</span>
        ))}
      </span>
    );
  };

  const renderCategoryView = () => (
    <ul className="sidebar-menu">
      {categoryView.map(([catKey, catLabel, entries]) => {
        const key = `cat-${catKey}`;
        return (
          <li key={key} className="sidebar-group">
            <div
              className="sidebar-group-header"
              onClick={() => toggleGroup(key)}
            >
              <span>{catLabel}</span>
              <span className="sidebar-group-toggle">
                {collapsed.has(key) ? "▸" : "▾"}
              </span>
            </div>
            {!collapsed.has(key) && (
              <ul className="sidebar-group-items">
                {entries.map(({ groupId, groupLabel, op }) => {
                  const needsPrefix = groupId !== catKey;
                  return (
                    <li key={`${groupId}-${op.operator}`} className="sidebar-item">
                      <NavLink
                        to={`/${groupId}/${op.operator}`}
                        onClick={() => setMenuOpen(false)}
                      >
                        <span className="sidebar-item-label">
                          {needsPrefix ? `${groupLabel}（${op.label}）` : op.label}
                          {renderGradeBadges(op)}
                        </span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );

  const renderGradeView = () => (
    <ul className="sidebar-menu">
      {[...gradeView.entries()].map(([grade, entries]) => {
        const key = `grade-${grade}`;
        const dupLabels = new Set(
          entries.map((e) => e.op.label)
            .filter((l, i, a) => a.indexOf(l) !== i),
        );
        return (
          <li key={key} className="sidebar-group">
            <div
              className="sidebar-group-header"
              onClick={() => toggleGroup(key)}
            >
              <span>{GRADE_LABELS[grade] ?? `${grade}年`}</span>
              <span className="sidebar-group-toggle">
                {collapsed.has(key) ? "▸" : "▾"}
              </span>
            </div>
            {!collapsed.has(key) && (
              <ul className="sidebar-group-items">
                {entries.map(({ groupId, groupLabel, op }) => {
                  const needsPrefix = dupLabels.has(op.label)
                    || groupId === "grid100" || groupId === "hissan";
                  const label = needsPrefix
                    ? `${op.label}（${groupLabel}）`
                    : op.label;
                  return (
                    <li key={`${groupId}-${op.operator}`} className="sidebar-item">
                      <NavLink
                        to={`/${groupId}/${op.operator}`}
                        onClick={() => setMenuOpen(false)}
                      >
                        <span className="sidebar-item-label">
                          {label}
                        </span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={`layout${controlsOpen ? " controls-open" : ""}`}>
      <div className="mobile-toolbar no-print">
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen((v) => !v)}
        >
          ☰
        </button>
        <button
          className="controls-toggle"
          onClick={() => setControlsOpen((v) => !v)}
        >
          ⚙
        </button>
      </div>
      <nav className={`sidebar no-print${menuOpen ? " menu-open" : ""}`}>
        <div className="sidebar-view-toggle">
          <button
            className={`view-toggle-btn${viewMode === "category" ? " active" : ""}`}
            onClick={() => switchView("category")}
          >
            種類別
          </button>
          <button
            className={`view-toggle-btn${viewMode === "grade" ? " active" : ""}`}
            onClick={() => switchView("grade")}
          >
            学年別
          </button>
        </div>
        {viewMode === "category" ? renderCategoryView() : renderGradeView()}
      </nav>
      <div className="app">
        {handle && (
          <h1 className="print-title">{handle.groupLabel} {handle.opLabel}</h1>
        )}
        <Outlet />
      </div>
    </div>
  );
};

export default App;


const buildGradeView = (): Map<number, GradeEntry[]> => {
  const map = new Map<number, GradeEntry[]>();
  for (const group of problemGroups) {
    for (const op of group.operators) {
      const grades = op.grades ?? [];
      for (const g of grades) {
        if (!map.has(g)) map.set(g, []);
        map.get(g)!.push({ groupId: group.id, groupLabel: group.label, op });
      }
    }
  }
  return new Map([...map.entries()].sort((a, b) => a[0] - b[0]));
};

const buildCategoryView = (): [string, string, GradeEntry[]][] => {
  const map = new Map<string, GradeEntry[]>();
  for (const group of problemGroups) {
    for (const op of group.operators) {
      const cat = op.category;
      if (!cat) continue;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push({ groupId: group.id, groupLabel: group.label, op });
    }
  }
  return CATEGORY_LABELS
    .filter(([key]) => map.has(key))
    .map(([key, label]) => [key, label, map.get(key)!]);
};

const getInitialViewMode = (): ViewMode => {
  try {
    const v = localStorage.getItem("sidebar-view");
    if (v === "grade") return "grade";
  } catch { /* ignore */ }
  return "category";
};
