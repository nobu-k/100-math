import { useState, useCallback, useMemo } from "react";
import { randomSeed, seedToHex, hexToSeed } from "../random";

const useProblemPage = (
  paramKeys: string[],
  getSettingsParams: () => Record<string, string>,
) => {
  const getInitialBase = () => {
    const p = new URLSearchParams(window.location.search);
    const qHex = p.get("q");
    const seed = qHex ? hexToSeed(qHex) ?? randomSeed() : randomSeed();
    const showAnswers = p.get("answers") === "1";
    return { seed, showAnswers };
  };

  const cleanParams = useCallback((url: URL) => {
    for (const k of paramKeys) url.searchParams.delete(k);
    url.searchParams.delete("q");
    url.searchParams.delete("answers");
  }, [paramKeys]);

  const [initial] = useState(getInitialBase);
  const [seed, setSeed] = useState(initial.seed);
  const [showAnswers, setShowAnswers] = useState(initial.showAnswers);
  const [showSettings, setShowSettings] = useState(false);

  const syncUrl = useCallback(
    (s: number, ans: boolean, overrides?: Record<string, string>) => {
      const url = new URL(window.location.href);
      cleanParams(url);
      url.searchParams.set("q", seedToHex(s));
      if (ans) url.searchParams.set("answers", "1");
      if (overrides) {
        for (const [k, v] of Object.entries(overrides)) url.searchParams.set(k, v);
      }
      window.history.replaceState(null, "", url.toString());
    },
    [cleanParams],
  );

  useState(() => { syncUrl(seed, showAnswers, getSettingsParams()); });

  const handleNew = useCallback(() => {
    const s = randomSeed();
    setSeed(s);
    setShowAnswers(false);
    syncUrl(s, false, getSettingsParams());
  }, [syncUrl, getSettingsParams]);

  const handleToggleAnswers = useCallback(() => {
    setShowAnswers((prev) => {
      syncUrl(seed, !prev, getSettingsParams());
      return !prev;
    });
  }, [seed, syncUrl, getSettingsParams]);

  const regen = useCallback(
    (overrides: Record<string, string>) => {
      const s = randomSeed();
      setSeed(s);
      setShowAnswers(false);
      syncUrl(s, false, overrides);
    },
    [syncUrl],
  );

  const qrUrl = useMemo(() => {
    const url = new URL(window.location.href);
    cleanParams(url);
    url.searchParams.set("q", seedToHex(seed));
    url.searchParams.set("answers", "1");
    const sp = getSettingsParams();
    for (const [k, v] of Object.entries(sp)) url.searchParams.set(k, v);
    return url.toString();
  }, [seed, getSettingsParams, cleanParams]);

  return { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl };
};

export default useProblemPage;
