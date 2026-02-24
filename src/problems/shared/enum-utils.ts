export const parseEnum = <T extends string>(
  raw: string | null,
  values: readonly T[],
  def: T,
): T => (raw !== null && (values as readonly string[]).includes(raw) ? (raw as T) : def);
