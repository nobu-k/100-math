import { useState, useCallback, useMemo, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { problemGroups } from "./problems";
import type { OperatorRoute } from "./problems";

type ViewMode = "category" | "grade";

interface GradeEntry {
  groupId: string;
  groupLabel: string;
  op: OperatorRoute;
}

interface SidebarProps {
  menuOpen: boolean;
  onClose: () => void;
}

const GRADE_LABELS: Record<number, string> = {
  1: "小1", 2: "小2", 3: "小3", 4: "小4", 5: "小5", 6: "小6",
  7: "中1", 8: "中2", 9: "中3", 10: "高1", 11: "高2", 12: "高3",
};

const CATEGORY_LABELS: [string, string][] = [
  ["computation", "計算"],
  ["numbers", "数の性質"],
  ["fractions", "分数"],
  ["decimals", "小数"],
  ["equations", "式・方程式"],
  ["geometry", "図形"],
  ["measurement", "測定"],
  ["relations", "変化と関係"],
  ["data", "データ・統計"],
];

const Sidebar = ({ menuOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState<Set<string>>(initCollapsed);
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);
  const [search, setSearch] = useState("");

  const gradeView = useMemo(buildGradeView, []);
  const categoryView = useMemo(buildCategoryView, []);

  // Auto-expand the group containing the active route
  const activeGroupKey = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    const [groupId, operator] = parts;
    if (!groupId || !operator) return null;

    if (viewMode === "category") {
      for (const [catKey, , entries] of categoryView) {
        if (entries.some((e) => e.groupId === groupId && e.op.operator === operator))
          return `cat-${catKey}`;
      }
    } else {
      for (const [grade, entries] of gradeView.entries()) {
        if (entries.some((e) => e.groupId === groupId && e.op.operator === operator))
          return `grade-${grade}`;
      }
    }
    return null;
  }, [location.pathname, viewMode, categoryView, gradeView]);

  useEffect(() => {
    if (activeGroupKey) {
      setCollapsed((prev) => {
        if (!prev.has(activeGroupKey)) return prev;
        const next = new Set(prev);
        next.delete(activeGroupKey);
        return next;
      });
    }
  }, [activeGroupKey]);

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
    setCollapsed(initCollapsed());
    try { localStorage.setItem("sidebar-view", mode); } catch { /* ignore */ }
  }, []);

  const isSearching = search.trim().length > 0;
  const searchNorm = search.trim().toLowerCase();

  const matchesSearch = (entry: GradeEntry) => {
    if (!searchNorm) return true;
    return (
      entry.op.label.toLowerCase().includes(searchNorm) ||
      entry.groupLabel.toLowerCase().includes(searchNorm)
    );
  };

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
        const filtered = isSearching ? entries.filter(matchesSearch) : entries;
        if (isSearching && filtered.length === 0) return null;
        const key = `cat-${catKey}`;
        const isOpen = isSearching || !collapsed.has(key);
        return (
          <li key={key} className="sidebar-group">
            <div
              className="sidebar-group-header"
              onClick={() => toggleGroup(key)}
            >
              <span>{catLabel}</span>
              <span className="sidebar-group-toggle">
                {isOpen ? "▾" : "▸"}
              </span>
            </div>
            {isOpen && (
              <ul className="sidebar-group-items">
                {filtered.map(({ groupId, groupLabel, op }) => {
                  const needsPrefix = groupId !== catKey;
                  return (
                    <li key={`${groupId}-${op.operator}`} className="sidebar-item">
                      <NavLink
                        to={`/${groupId}/${op.operator}`}
                        onClick={onClose}
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
        const filtered = isSearching ? entries.filter(matchesSearch) : entries;
        if (isSearching && filtered.length === 0) return null;
        const key = `grade-${grade}`;
        const isOpen = isSearching || !collapsed.has(key);
        const dupLabels = new Set(
          filtered.map((e) => e.op.label)
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
                {isOpen ? "▾" : "▸"}
              </span>
            </div>
            {isOpen && (
              <ul className="sidebar-group-items">
                {filtered.map(({ groupId, groupLabel, op }) => {
                  const needsPrefix = dupLabels.has(op.label)
                    || groupId === "grid100" || groupId === "hissan";
                  const label = needsPrefix
                    ? `${op.label}（${groupLabel}）`
                    : op.label;
                  return (
                    <li key={`${groupId}-${op.operator}`} className="sidebar-item">
                      <NavLink
                        to={`/${groupId}/${op.operator}`}
                        onClick={onClose}
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
    <nav className={`sidebar no-print${menuOpen ? " menu-open" : ""}`}>
      <div className="sidebar-header">
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
        <div className="sidebar-search">
          <input
            type="text"
            placeholder="検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {viewMode === "category" ? renderCategoryView() : renderGradeView()}
    </nav>
  );
};

export default Sidebar;


const initCollapsed = (): Set<string> => {
  const all = new Set<string>();
  for (const [catKey] of CATEGORY_LABELS) all.add(`cat-${catKey}`);
  for (let g = 1; g <= 12; g++) all.add(`grade-${g}`);
  return all;
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
