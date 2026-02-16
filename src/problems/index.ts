export type { ProblemGroup, OperatorRoute } from "./types";
export { grid100 } from "./Grid100";
export { hissan } from "./Hissan";
export { fraction } from "./Fraction";
export { integer } from "./Integer";
export { underDevelopment } from "./UnderDevelopment";
export { devGrade2 } from "./grade2/Grade2";

import { grid100 } from "./Grid100";
import { hissan } from "./Hissan";
import { fraction } from "./Fraction";
import { integer } from "./Integer";
import { underDevelopment } from "./UnderDevelopment";
import { devGrade2 } from "./grade2/Grade2";
import type { ProblemGroup } from "./types";

export const problemGroups: ProblemGroup[] = [grid100, hissan, fraction, integer, underDevelopment, devGrade2];
