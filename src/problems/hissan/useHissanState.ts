import { useState, useCallback, useMemo } from "react";
import { randomSeed, hexToSeed } from "../random";

export interface UseHissanStateOptions<C> {
  parseConfig: (params: URLSearchParams) => C;
  buildParams: (seed: number, showAnswers: boolean, cfg: C) => URLSearchParams;
  paramKeys: string[];
}

const updateUrl = <C>(seed: number, showAnswers: boolean, cfg: C, buildParams: (seed: number, showAnswers: boolean, cfg: C) => URLSearchParams, paramKeys: string[]) => {
  const url = new URL(window.location.href);
  const params = buildParams(seed, showAnswers, cfg);
  for (const key of paramKeys) {
    url.searchParams.delete(key);
  }
  for (const [key, value] of params) {
    url.searchParams.set(key, value);
  }
  window.history.replaceState(null, "", url.toString());
};

export const useHissanState = <C>({ parseConfig, buildParams, paramKeys }: UseHissanStateOptions<C>) => {
  const getInitialConfig = (): C => {
    return parseConfig(new URLSearchParams(window.location.search));
  };

  const getInitialSeed = (): number => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      const parsed = hexToSeed(q);
      if (parsed !== null) return parsed;
    }
    const seed = randomSeed();
    updateUrl(seed, false, getInitialConfig(), buildParams, paramKeys);
    return seed;
  };

  const [seed, setSeed] = useState(getInitialSeed);
  const [showAnswers, setShowAnswers] = useState(() => {
    return new URLSearchParams(window.location.search).get("answers") === "1";
  });
  const [cfg, setCfg] = useState(getInitialConfig);
  const [showSettings, setShowSettings] = useState(false);

  const handleNewProblems = useCallback(() => {
    const newSeed = randomSeed();
    updateUrl(newSeed, false, cfg, buildParams, paramKeys);
    setSeed(newSeed);
    setShowAnswers(false);
  }, [cfg, buildParams, paramKeys]);

  const handleToggleAnswers = useCallback(() => {
    setShowAnswers((prev) => {
      updateUrl(seed, !prev, cfg, buildParams, paramKeys);
      return !prev;
    });
  }, [seed, cfg, buildParams, paramKeys]);

  const handleToggleGrid = useCallback((getGrid: (c: C) => boolean, setGrid: (c: C, v: boolean) => C) => {
    setCfg((prev) => {
      const next = setGrid(prev, !getGrid(prev));
      updateUrl(seed, showAnswers, next, buildParams, paramKeys);
      return next;
    });
  }, [seed, showAnswers, buildParams, paramKeys]);

  const qrUrl = useMemo(() => {
    const url = new URL(window.location.href);
    for (const key of paramKeys) {
      url.searchParams.delete(key);
    }
    const params = buildParams(seed, true, cfg);
    for (const [key, value] of params) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  }, [seed, cfg, buildParams, paramKeys]);

  const resetWithConfig = useCallback((next: C) => {
    const newSeed = randomSeed();
    setSeed(newSeed);
    setShowAnswers(false);
    updateUrl(newSeed, false, next, buildParams, paramKeys);
  }, [buildParams, paramKeys]);

  return { seed, showAnswers, cfg, setCfg, showSettings, setShowSettings, handleNewProblems, handleToggleAnswers, handleToggleGrid, qrUrl, resetWithConfig };
};
