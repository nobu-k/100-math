import { mulberry32, randomSeed, seedToHex, hexToSeed } from "../random";

export interface Problem {
  rowHeaders: number[];
  colHeaders: number[];
}

export const generateProblem = (seed: number): Problem => {
  const rng = mulberry32(seed);
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return {
    rowHeaders: seededShuffle(digits, rng),
    colHeaders: seededShuffle(digits, rng),
  };
};

const seededShuffle = (arr: number[], rng: () => number): number[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getInitialSeed = (): number => {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (q) {
    const parsed = hexToSeed(q);
    if (parsed !== null) return parsed;
  }
  const seed = randomSeed();
  updateUrl(seed, false);
  return seed;
};

export const updateUrl = (seed: number, showAnswers: boolean) => {
  const url = new URL(window.location.href);
  url.searchParams.set("q", seedToHex(seed));
  if (showAnswers) {
    url.searchParams.set("answers", "1");
  } else {
    url.searchParams.delete("answers");
  }
  window.history.replaceState(null, "", url.toString());
};

export const buildQrUrl = (seed: number): string => {
  const url = new URL(window.location.href);
  url.searchParams.set("q", seedToHex(seed));
  url.searchParams.set("answers", "1");
  return url.toString();
};
