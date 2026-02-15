import { useState, useCallback, useEffect } from "react";
import { problemGroups } from "./problems";
import "./App.css";

const BASE = import.meta.env.BASE_URL; // "/100-math/"

function parseRoute(pathname: string): { groupId: string; operator: string } | null {
  const rel = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  const parts = rel.replace(/\/$/, "").split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const group = problemGroups.find((g) => g.id === parts[0]);
  if (!group) return null;
  const op = group.operators.find((o) => o.operator === parts[1]);
  if (!op) return null;
  return { groupId: group.id, operator: op.operator };
}

const DEFAULT_PATH = `${BASE}grid100/addition`;

function getInitialRoute(): { groupId: string; operator: string } {
  const parsed = parseRoute(window.location.pathname);
  if (parsed) return parsed;
  window.history.replaceState(null, "", DEFAULT_PATH + window.location.search);
  return { groupId: "grid100", operator: "addition" };
}

function App() {
  const [route, setRoute] = useState(getInitialRoute);
  const [menuOpen, setMenuOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

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

  const currentGroup = problemGroups.find((g) => g.id === route.groupId)!;
  const currentOp = currentGroup.operators.find((o) => o.operator === route.operator)!;
  const { Component } = currentGroup;

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
        <h2 className="sidebar-title">問題の種類</h2>
        <ul className="sidebar-menu">
          {problemGroups.map((group) => (
            <li key={group.id} className="sidebar-group">
              <div
                className="sidebar-group-header"
                onClick={() => toggleGroup(group.id)}
              >
                <span>{group.label}</span>
                <span className="sidebar-group-toggle">
                  {collapsed.has(group.id) ? "▸" : "▾"}
                </span>
              </div>
              {!collapsed.has(group.id) && (
                <ul className="sidebar-group-items">
                  {group.operators.map((op) => (
                    <li
                      key={op.operator}
                      className={`sidebar-item${group.id === route.groupId && op.operator === route.operator ? " active" : ""}`}
                      onClick={() => navigate(group.id, op.operator)}
                    >
                      <span className="sidebar-item-label">{op.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="app">
        <h1 className="print-title">
          {currentGroup.label} {currentOp.label}
        </h1>
        <Component key={route.groupId + route.operator} operator={route.operator} />
      </div>
    </div>
  );
}

export default App;
