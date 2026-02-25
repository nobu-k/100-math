import { describe, it, expect } from "vitest";
import {
  divisionTerminates,
  divisionCycleLength,
  decimalDisplayWidth,
} from "./index";

// Verify re-exports work
describe("index re-exports", () => {
  it("re-exports divisionTerminates", () => {
    expect(divisionTerminates(12, 4, 3)).toEqual({ terminates: true, stepsNeeded: 0 });
  });

  it("re-exports divisionCycleLength", () => {
    expect(divisionCycleLength(10, 3, 10)).toEqual({ cycleStart: 0, cycleLength: 1 });
  });

  it("re-exports decimalDisplayWidth", () => {
    expect(decimalDisplayWidth(2, 1)).toBe(2);
  });
});
