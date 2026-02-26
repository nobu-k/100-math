export type { ProblemGroup, OperatorRoute } from "./types";
export { grid100 } from "./Grid100";
export { hissan } from "./Hissan";
export { integer } from "./Integer";
export { computation } from "./Computation";
export { numbers } from "./Numbers";
export { fractions } from "./Fractions";
export { equations } from "./Equations";
export { geometry } from "./Geometry";
export { measurement } from "./Measurement";
export { relations } from "./Relations";
export { data } from "./Data";

import { grid100 } from "./Grid100";
import { hissan } from "./Hissan";
import { integer } from "./Integer";
import { computation } from "./Computation";
import { numbers } from "./Numbers";
import { fractions } from "./Fractions";
import { equations } from "./Equations";
import { geometry } from "./Geometry";
import { measurement } from "./Measurement";
import { relations } from "./Relations";
import { data } from "./Data";
import type { ProblemGroup } from "./types";

export const problemGroups: ProblemGroup[] = [
  grid100, hissan, integer,
  computation, numbers, fractions, equations,
  geometry, measurement, relations, data,
];
