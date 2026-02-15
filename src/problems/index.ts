export type { ProblemGroup, OperatorRoute } from "./types";
export { grid100 } from "./Grid100";
export { hissan } from "./Hissan";

import { grid100 } from "./Grid100";
import { hissan } from "./Hissan";
import type { ProblemGroup } from "./types";

export const problemGroups: ProblemGroup[] = [grid100, hissan];
