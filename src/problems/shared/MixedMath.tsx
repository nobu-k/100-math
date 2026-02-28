import { M, texRed } from "./M";
import { unicodeToLatex } from "./katex-utils";

/**
 * CJK character ranges: hiragana, katakana, CJK unified ideographs,
 * CJK punctuation, and fullwidth forms.
 */
const CJK_RE = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF01-\uFF60]/;

/**
 * Splitting regex — captures runs of CJK characters.
 * Using split() with a capturing group preserves the matched CJK runs
 * at odd indices in the result array.
 */
const CJK_SPLIT = /([\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF01-\uFF60，、。・「」『』（）〜]+)/;

/**
 * Check if a math segment needs KaTeX rendering.
 * Simple numbers and basic punctuation can be rendered as plain text.
 */
const needsKatex = (text: string): boolean =>
  !/^[\d\s,.\-+−=]+$/.test(text);

/**
 * Render a string that may contain mixed Japanese text and math.
 *
 * Japanese (CJK) characters render as plain HTML text.
 * Simple numbers render as plain text (avoiding KaTeX font size mismatch).
 * Complex math passes through unicodeToLatex → KaTeX.
 */
export const MixedMath = ({ text, red }: { text: string; red?: boolean }) => {
  // Fast path: no CJK at all → render entirely as KaTeX (display style
  // so fractions and limits are full-sized rather than inline-squished)
  if (!CJK_RE.test(text)) {
    const tex = `\\displaystyle ${unicodeToLatex(text)}`;
    return <M tex={red ? texRed(tex) : tex} />;
  }

  const parts = text.split(CJK_SPLIT);
  const redStyle = red ? { color: "red" } as const : undefined;

  return (
    <span>
      {parts.map((part, i) => {
        if (!part) return null;

        // Odd indices are CJK matches
        if (i % 2 === 1) {
          return <span key={i} style={redStyle}>{part}</span>;
        }

        // Non-CJK segment
        const trimmed = part.trim();
        if (!trimmed) {
          return part ? " " : null;
        }

        // Simple numbers/punctuation → render as plain text
        if (!needsKatex(trimmed)) {
          return <span key={i} style={redStyle}>{part}</span>;
        }

        // Complex math → render via KaTeX
        const tex = unicodeToLatex(trimmed);
        const pre = part.length > trimmed.length && part[0] === " " ? " " : "";
        const post = part.length > trimmed.length && part[part.length - 1] === " " ? " " : "";

        return (
          <span key={i}>
            {pre}
            <M tex={red ? texRed(tex) : tex} />
            {post}
          </span>
        );
      })}
    </span>
  );
};
