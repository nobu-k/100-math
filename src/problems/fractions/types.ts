export interface FracProblem {
  aNum: number; aDen: number;
  bNum: number; bDen: number;
  ansNum: number; ansDen: number;
  /** optional whole part for mixed number answers */
  ansWhole?: number;
  ansPartNum?: number;
}
