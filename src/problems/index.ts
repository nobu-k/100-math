export type { ProblemGroup, OperatorRoute } from "./types";
export { grid100 } from "./Grid100";
export { hissan } from "./Hissan";
export { fraction } from "./Fraction";
export { integer } from "./Integer";
export { underDevelopment } from "./UnderDevelopment";

import { grid100 } from "./Grid100";
import { hissan } from "./Hissan";
import { fraction } from "./Fraction";
import { integer } from "./Integer";
import { underDevelopment } from "./UnderDevelopment";
import type { ProblemGroup } from "./types";

export const problemGroups: ProblemGroup[] = [grid100, hissan, fraction, integer, underDevelopment];
