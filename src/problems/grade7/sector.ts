import { mulberry32 } from "../random";

export type SectorMode = "arc" | "area" | "mixed";

export interface SectorProblem {
  /** "arc" or "area" */
  type: "arc" | "area";
  /** Radius in cm */
  radius: number;
  /** Central angle in degrees */
  angle: number;
  /** Answer coefficient of π, e.g. 4 means 4π */
  answerCoefficient: number;
  /** Display answer, e.g. "4π cm" */
  answerDisplay: string;
  /** Unit: "cm" for arc, "cm²" for area */
  unit: string;
}

export const generateSector = (
  seed: number,
  mode: SectorMode = "mixed",
): SectorProblem[] => {
  const rng = mulberry32(seed);
  const problems: SectorProblem[] = [];
  const seen = new Set<string>();
  const angles = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 360];
  const radii = [2, 3, 4, 5, 6, 8, 9, 10, 12, 15];

  for (let i = 0; i < 10; i++) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const type: "arc" | "area" =
        mode === "mixed" ? (rng() < 0.5 ? "arc" : "area") : mode;
      const radius = radii[Math.floor(rng() * radii.length)];
      const angle = angles[Math.floor(rng() * angles.length)];

      let answerCoefficient: number;
      let unit: string;

      if (type === "arc") {
        // Arc length = 2πr × (angle/360)
        answerCoefficient = (2 * radius * angle) / 360;
        unit = "cm";
      } else {
        // Area = πr² × (angle/360)
        answerCoefficient = (radius * radius * angle) / 360;
        unit = "cm²";
      }

      // Check that the coefficient is a nice number (integer or simple fraction)
      const rounded = Math.round(answerCoefficient * 100) / 100;
      // Accept integers and halves
      if (rounded !== Math.round(rounded * 2) / 2) continue;

      const key = `${type}-${radius}-${angle}`;
      if (!seen.has(key) || attempt === 29) {
        seen.add(key);
        const coeffStr =
          answerCoefficient === 1
            ? ""
            : answerCoefficient === Math.floor(answerCoefficient)
              ? `${answerCoefficient}`
              : `${answerCoefficient}`;
        problems.push({
          type,
          radius,
          angle,
          answerCoefficient: rounded,
          answerDisplay: `${coeffStr}π ${unit}`,
          unit,
        });
        break;
      }
    }
  }
  return problems;
};
