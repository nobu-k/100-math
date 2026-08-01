import { useState, useCallback, useEffect } from "react";
import {
  Outlet,
  ScrollRestoration,
  useLocation,
  useMatches,
  useNavigate,
} from "react-router-dom";
import Sidebar from "./Sidebar";
import "./styles/layout.css";
import "./problems/shared/worksheet.css";
import "./problems/shared/dev.css";
import "./styles/katex.css";

const App = () => {
  const matches = useMatches();
  const handle = matches[matches.length - 1]?.handle as
    { groupLabel?: string; opLabel?: string; isExam?: boolean } | undefined;
  const isExam = handle?.isExam === true;
  const location = useLocation();
  const navigate = useNavigate();
  const menuOpen =
    (location.state as { menuOpen?: boolean } | null)?.menuOpen === true;
  const [controlsOpen, setControlsOpen] = useState(false);

  // The open menu is its own history entry, so the back button from a
  // worksheet returns to the menu (ScrollRestoration brings back its
  // scroll position), and closing it pops the entry again.
  const toggleMenu = useCallback(() => {
    if (menuOpen) {
      navigate(-1);
    } else {
      navigate(location.pathname + location.search + location.hash, {
        state: { menuOpen: true },
      });
    }
  }, [menuOpen, navigate, location]);

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

  if (isExam) {
    return (
      <>
        <ScrollRestoration />
        <Outlet />
      </>
    );
  }

  return (
    <div className={`layout${controlsOpen ? " controls-open" : ""}`}>
      <ScrollRestoration />
      <div className="mobile-toolbar no-print">
        <button
          className="menu-toggle"
          onClick={toggleMenu}
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
      <Sidebar menuOpen={menuOpen} />
      <div className="app">
        {handle?.groupLabel && handle?.opLabel && (
          <h1 className="print-title">{handle.groupLabel} {handle.opLabel}</h1>
        )}
        <Outlet />
      </div>
    </div>
  );
};

export default App;
