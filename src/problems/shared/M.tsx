import katex from "katex";
import { latexToText } from "./katex-utils";

/**
 * Render a LaTeX string via KaTeX.
 * Stores plain-text equivalent in data-text for the copy handler.
 */
export const M = ({ tex, text, className }: {
  tex: string;
  text?: string;
  className?: string;
}) => {
  const html = katex.renderToString(tex, { throwOnError: false });
  const plainText = text ?? latexToText(tex);
  return (
    <span
      className={className}
      data-text={plainText}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

/**
 * LaTeX for a boxed answer (grade ≤ 3): visible boxed value or hidden phantom.
 */
export const texBox = (val: number | string, show: boolean): string =>
  show
    ? `\\boxed{\\textcolor{red}{${val}}}`
    : `\\boxed{\\phantom{${val}}}`;

/**
 * LaTeX for a plain answer (grade > 3): red value or underline placeholder.
 */
export const texAns = (val: number | string, show: boolean): string =>
  show
    ? `\\textcolor{red}{${val}}`
    : `\\underline{\\phantom{${val}}}`;

/** Wrap LaTeX in red. */
export const texRed = (tex: string): string => `\\textcolor{red}{${tex}}`;

/**
 * LaTeX for a fraction answer, handling integer, mixed, and simple fraction forms.
 */
export const texFrac = (
  ansNum: number,
  ansDen: number,
  ansWhole?: number,
  ansPartNum?: number,
): string => {
  if (ansWhole !== undefined && ansPartNum !== undefined) {
    return `${ansWhole}\\frac{${ansPartNum}}{${ansDen}}`;
  }
  if (ansNum % ansDen === 0) {
    return String(ansNum / ansDen);
  }
  return `\\frac{${ansNum}}{${ansDen}}`;
};
