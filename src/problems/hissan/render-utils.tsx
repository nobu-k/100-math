/** Build a className string from a base class and conditional modifiers.
 *  Usage: cx("base", [condition, "modifier"], [cond2, "mod2"]) */
export function cx(base: string, ...modifiers: [boolean, string][]): string {
  let result = base;
  for (const [condition, className] of modifiers) {
    if (condition) result += " " + className;
  }
  return result;
}
