export type { ProblemGroup, OperatorRoute } from "./types";
export { grid100 } from "./Grid100";
export { hissan } from "./Hissan";
export { integer } from "./Integer";
export { computation } from "./Computation";
export { numbers } from "./Numbers";
export { fractions } from "./Fractions";
export { decimals } from "./Decimals";
export { equations } from "./Equations";
export { geometry } from "./Geometry";
export { measurement } from "./Measurement";
export { relations } from "./Relations";
export { data } from "./Data";
export { math1 } from "./Math1";
export { mathA } from "./MathA";
export { math2 } from "./Math2";
export { mathB } from "./MathB";
export { math3 } from "./Math3";
export { mathC } from "./MathC";

import { grid100 } from "./Grid100";
import { hissan } from "./Hissan";
import { integer } from "./Integer";
import { computation } from "./Computation";
import { numbers } from "./Numbers";
import { fractions } from "./Fractions";
import { decimals } from "./Decimals";
import { equations } from "./Equations";
import { geometry } from "./Geometry";
import { measurement } from "./Measurement";
import { relations } from "./Relations";
import { data } from "./Data";
import { math1 } from "./Math1";
import { mathA } from "./MathA";
import { math2 } from "./Math2";
import { mathB } from "./MathB";
import { math3 } from "./Math3";
import { mathC } from "./MathC";
import type { ProblemGroup } from "./types";

export const problemGroups: ProblemGroup[] = [
  grid100, hissan, integer,
  computation, numbers, fractions, decimals, equations,
  geometry, measurement, relations, data,
  math1, mathA, math2, mathB, math3, mathC,
];
