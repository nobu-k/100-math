import { useState, useCallback, useEffect } from "react";
import { Outlet, useMatches } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./App.css";

const App = () => {
  const matches = useMatches();
  const handle = matches[matches.length - 1]?.handle as
    { groupLabel: string; opLabel: string } | undefined;
  const [menuOpen, setMenuOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);

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

  const closeMenu = useCallback(() => setMenuOpen(false), []);

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
      <Sidebar menuOpen={menuOpen} onClose={closeMenu} />
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
