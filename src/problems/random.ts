export const mulberry32 = (seed: number): (() => number) => {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const randomSeed = (): number => {
  return (Math.random() * 0xffffffff) >>> 0;
};

export const seedToHex = (seed: number): string => {
  return (seed >>> 0).toString(16).padStart(8, "0");
};

export const hexToSeed = (hex: string): number | null => {
  if (!/^[0-9a-fA-F]{8}$/.test(hex)) return null;
  return parseInt(hex, 16) >>> 0;
};
