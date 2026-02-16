/* ================================================================
   Shared math utilities
   ================================================================ */

export function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

export function simplify(num: number, den: number): [number, number] {
  const g = gcd(num, den);
  return [num / g, den / g];
}

/* ----------------------------------------------------------------
   numberToKanji — converts integers up to 兆 (10^12) to kanji
   ---------------------------------------------------------------- */

const KANJI_DIGITS = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

const SMALL_UNITS: [number, string][] = [
  [1000, "千"],
  [100, "百"],
  [10, "十"],
];

function smallSection(n: number): string {
  if (n === 0) return "";
  let result = "";
  for (const [unit, label] of SMALL_UNITS) {
    const d = Math.floor(n / unit);
    if (d > 0) result += (d === 1 ? "" : KANJI_DIGITS[d]) + label;
    n = n % unit;
  }
  if (n > 0) result += KANJI_DIGITS[n];
  return result;
}

const BIG_UNITS: [number, string][] = [
  [1e12, "兆"],
  [1e8, "億"],
  [1e4, "万"],
];

export function numberToKanji(n: number): string {
  if (n === 0) return "〇";
  let result = "";
  for (const [unit, label] of BIG_UNITS) {
    const d = Math.floor(n / unit);
    if (d > 0) result += smallSection(d) + label;
    n = n % unit;
  }
  if (n > 0) result += smallSection(n);
  return result;
}
