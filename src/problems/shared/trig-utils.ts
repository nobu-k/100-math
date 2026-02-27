/* ================================================================
   Trigonometric exact values and helpers
   ================================================================ */

export interface AngleEntry {
  degrees: number;
  radiansLatex: string;
  sin: string;       // exact LaTeX string
  cos: string;
  tan: string;       // "\\text{undefined}" for 90°, 270°
}

/**
 * Standard angles table: 0° to 360° in key increments.
 * Values are LaTeX-ready strings for exact trigonometric values.
 */
export const STANDARD_ANGLES: AngleEntry[] = [
  { degrees: 0,   radiansLatex: "0",                     sin: "0",                        cos: "1",                        tan: "0" },
  { degrees: 30,  radiansLatex: "\\frac{\\pi}{6}",       sin: "\\frac{1}{2}",             cos: "\\frac{\\sqrt{3}}{2}",     tan: "\\frac{1}{\\sqrt{3}}" },
  { degrees: 45,  radiansLatex: "\\frac{\\pi}{4}",       sin: "\\frac{\\sqrt{2}}{2}",     cos: "\\frac{\\sqrt{2}}{2}",     tan: "1" },
  { degrees: 60,  radiansLatex: "\\frac{\\pi}{3}",       sin: "\\frac{\\sqrt{3}}{2}",     cos: "\\frac{1}{2}",             tan: "\\sqrt{3}" },
  { degrees: 90,  radiansLatex: "\\frac{\\pi}{2}",       sin: "1",                        cos: "0",                        tan: "\\text{undefined}" },
  { degrees: 120, radiansLatex: "\\frac{2\\pi}{3}",      sin: "\\frac{\\sqrt{3}}{2}",     cos: "-\\frac{1}{2}",            tan: "-\\sqrt{3}" },
  { degrees: 135, radiansLatex: "\\frac{3\\pi}{4}",      sin: "\\frac{\\sqrt{2}}{2}",     cos: "-\\frac{\\sqrt{2}}{2}",    tan: "-1" },
  { degrees: 150, radiansLatex: "\\frac{5\\pi}{6}",      sin: "\\frac{1}{2}",             cos: "-\\frac{\\sqrt{3}}{2}",    tan: "-\\frac{1}{\\sqrt{3}}" },
  { degrees: 180, radiansLatex: "\\pi",                   sin: "0",                        cos: "-1",                       tan: "0" },
  { degrees: 210, radiansLatex: "\\frac{7\\pi}{6}",      sin: "-\\frac{1}{2}",            cos: "-\\frac{\\sqrt{3}}{2}",    tan: "\\frac{1}{\\sqrt{3}}" },
  { degrees: 225, radiansLatex: "\\frac{5\\pi}{4}",      sin: "-\\frac{\\sqrt{2}}{2}",    cos: "-\\frac{\\sqrt{2}}{2}",    tan: "1" },
  { degrees: 240, radiansLatex: "\\frac{4\\pi}{3}",      sin: "-\\frac{\\sqrt{3}}{2}",    cos: "-\\frac{1}{2}",            tan: "\\sqrt{3}" },
  { degrees: 270, radiansLatex: "\\frac{3\\pi}{2}",      sin: "-1",                       cos: "0",                        tan: "\\text{undefined}" },
  { degrees: 300, radiansLatex: "\\frac{5\\pi}{3}",      sin: "-\\frac{\\sqrt{3}}{2}",    cos: "\\frac{1}{2}",             tan: "-\\sqrt{3}" },
  { degrees: 315, radiansLatex: "\\frac{7\\pi}{4}",      sin: "-\\frac{\\sqrt{2}}{2}",    cos: "\\frac{\\sqrt{2}}{2}",     tan: "-1" },
  { degrees: 330, radiansLatex: "\\frac{11\\pi}{6}",     sin: "-\\frac{1}{2}",            cos: "\\frac{\\sqrt{3}}{2}",     tan: "-\\frac{1}{\\sqrt{3}}" },
  { degrees: 360, radiansLatex: "2\\pi",                  sin: "0",                        cos: "1",                        tan: "0" },
];

/**
 * Convert degrees to radian LaTeX string.
 * e.g. 135 → "\\frac{3\\pi}{4}"
 */
export const degreesToRadiansLatex = (deg: number): string => {
  const entry = STANDARD_ANGLES.find((a) => a.degrees === deg);
  if (entry) return entry.radiansLatex;
  // General case: deg/180 * pi, reduced
  const g = gcdLocal(Math.abs(deg), 180);
  const num = deg / g;
  const den = 180 / g;
  if (den === 1) return num === 1 ? "\\pi" : `${num}\\pi`;
  if (num === 1) return `\\frac{\\pi}{${den}}`;
  return `\\frac{${num}\\pi}{${den}}`;
};

const gcdLocal = (a: number, b: number): number => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
};
