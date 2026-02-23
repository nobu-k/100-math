import { useState, useCallback, useEffect, useMemo } from "react";
import { problemGroups } from "./problems";
import type { OperatorRoute } from "./problems";
import "./App.css";

const BASE = import.meta.env.BASE_URL; // "/100-math/"

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

const DEFAULT_PATH = `${BASE}grid100/addition`;

const App = () => {
  const [route, setRoute] = useState(getInitialRoute);
  const [menuOpen, setMenuOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);

  const gradeView = useMemo(buildGradeView, []);
  const categoryView = useMemo(buildCategoryView, []);

  useEffect(() => {
    const onPopState = () => {
      const parsed = parseRoute(window.location.pathname);
      if (parsed) setRoute(parsed);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((groupId: string, operator: string) => {
    const path = `${BASE}${groupId}/${operator}`;
    window.history.pushState(null, "", path);
    setRoute({ groupId, operator });
    setMenuOpen(false);
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

  const currentGroup = problemGroups.find((g) => g.id === route.groupId)!;
  const currentOp = currentGroup.operators.find((o) => o.operator === route.operator)!;
  const { Component } = currentGroup;

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
                  const isActive = groupId === route.groupId && op.operator === route.operator;
                  const needsPrefix = groupId !== catKey;
                  return (
                    <li
                      key={`${groupId}-${op.operator}`}
                      className={`sidebar-item${isActive ? " active" : ""}`}
                      onClick={() => navigate(groupId, op.operator)}
                    >
                      <span className="sidebar-item-label">
                        {needsPrefix ? `${groupLabel}（${op.label}）` : op.label}
                        {renderGradeBadges(op)}
                      </span>
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
                {entries.map(({ groupId, op }) => {
                  const isActive = groupId === route.groupId && op.operator === route.operator;
                  return (
                    <li
                      key={`${groupId}-${op.operator}`}
                      className={`sidebar-item${isActive ? " active" : ""}`}
                      onClick={() => navigate(groupId, op.operator)}
                    >
                      <span className="sidebar-item-label">
                        {op.label}
                      </span>
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
        <h1 className="print-title">
          {currentGroup.label} {currentOp.label}
        </h1>
        <Component key={route.groupId + route.operator} operator={route.operator} />
      </div>
    </div>
  );
};

export default App;

const getInitialRoute = (): { groupId: string; operator: string } => {
  const parsed = parseRoute(window.location.pathname);
  if (parsed) return parsed;
  window.history.replaceState(null, "", DEFAULT_PATH + window.location.search);
  return { groupId: "grid100", operator: "addition" };
};

const parseRoute = (pathname: string): { groupId: string; operator: string } | null => {
  const rel = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  const parts = rel.replace(/\/$/, "").split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const group = problemGroups.find((g) => g.id === parts[0]);
  if (!group) return null;
  const op = group.operators.find((o) => o.operator === parts[1]);
  if (!op) return null;
  return { groupId: group.id, operator: op.operator };
};

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
