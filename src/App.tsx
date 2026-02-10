import { useState, useCallback } from "react";
import { problemTypes } from "./problems";
import "./App.css";

function getInitialType(): string {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");
  if (type && problemTypes.some((t) => t.id === type)) return type;
  return problemTypes[0].id;
}

function App() {
  const [selectedType, setSelectedType] = useState(getInitialType);
  const [menuOpen, setMenuOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);

  const handleSelectType = useCallback((id: string) => {
    setSelectedType(id);
    setMenuOpen(false);
    const url = new URL(window.location.href);
    // Clear stale problem params from other types
    url.searchParams.delete("q");
    url.searchParams.delete("hq");
    url.searchParams.delete("answers");
    url.searchParams.delete("op");
    url.searchParams.set("type", id);
    window.history.replaceState(null, "", url.toString());
  }, []);

  const currentType = problemTypes.find((t) => t.id === selectedType)!;
  const { Component } = currentType;

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
        <h2 className="sidebar-title">問題の種類 / Type</h2>
        <ul className="sidebar-menu">
          {problemTypes.map((type) => (
            <li
              key={type.id}
              className={`sidebar-item${type.id === selectedType ? " active" : ""}`}
              onClick={() => handleSelectType(type.id)}
            >
              <span className="sidebar-item-label">{type.label}</span>
              <span className="sidebar-item-label-en">{type.labelEn}</span>
            </li>
          ))}
        </ul>
      </nav>
      <div className="app">
        <h1 className="print-title">
          {currentType.label} / {currentType.labelEn}
        </h1>
        <Component />
      </div>
    </div>
  );
}

export default App;
