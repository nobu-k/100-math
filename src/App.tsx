import { useState } from "react";
import { problemTypes } from "./problems";
import "./App.css";

function App() {
  const [selectedType, setSelectedType] = useState(problemTypes[0].id);

  const currentType = problemTypes.find((t) => t.id === selectedType)!;
  const { Component } = currentType;

  return (
    <div className="layout">
      <nav className="sidebar no-print">
        <h2 className="sidebar-title">問題の種類 / Type</h2>
        <ul className="sidebar-menu">
          {problemTypes.map((type) => (
            <li
              key={type.id}
              className={`sidebar-item${type.id === selectedType ? " active" : ""}`}
              onClick={() => setSelectedType(type.id)}
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
