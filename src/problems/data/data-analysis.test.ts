import { describe, it, expect } from "vitest";
import {
  generateDataAnalysis,
  type RepresentativeProblem,
  type FrequencyProblem,
} from "./data-analysis";

const seeds = [1, 2, 42, 100, 999];

describe("generateDataAnalysis", () => {
  it("representative mode returns 6 problems", () => {
    const problems = generateDataAnalysis(42, "representative");
    expect(problems).toHaveLength(6);
  });

  it("frequency mode returns 6 problems", () => {
    const problems = generateDataAnalysis(42, "frequency");
    expect(problems).toHaveLength(6);
  });

  it("mixed mode returns 6 problems", () => {
    const problems = generateDataAnalysis(42, "mixed");
    expect(problems).toHaveLength(6);
  });

  it("defaults to mixed mode", () => {
    const a = generateDataAnalysis(42);
    const b = generateDataAnalysis(42, "mixed");
    expect(a).toEqual(b);
  });

  it("is deterministic with the same seed", () => {
    const a = generateDataAnalysis(42, "mixed");
    const b = generateDataAnalysis(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateDataAnalysis(1, "representative");
    const b = generateDataAnalysis(2, "representative");
    const aData = a.map((p) => (p as RepresentativeProblem).data);
    const bData = b.map((p) => (p as RepresentativeProblem).data);
    expect(aData).not.toEqual(bData);
  });

  it("mixed mode produces both representative and frequency problems", () => {
    let hasRepresentative = false;
    let hasFrequency = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateDataAnalysis(seed, "mixed");
      for (const p of problems) {
        if (p.mode === "representative") hasRepresentative = true;
        if (p.mode === "frequency") hasFrequency = true;
      }
    }
    expect(hasRepresentative).toBe(true);
    expect(hasFrequency).toBe(true);
  });

  it("representative: data is sorted in ascending order", () => {
    for (const seed of seeds) {
      const problems = generateDataAnalysis(seed, "representative");
      for (const p of problems) {
        const rp = p as RepresentativeProblem;
        for (let i = 1; i < rp.data.length; i++) {
          expect(rp.data[i]).toBeGreaterThanOrEqual(rp.data[i - 1]);
        }
      }
    }
  });

  it("representative: mean is correct", () => {
    for (const seed of seeds) {
      const problems = generateDataAnalysis(seed, "representative");
      for (const p of problems) {
        const rp = p as RepresentativeProblem;
        const sum = rp.data.reduce((a, b) => a + b, 0);
        const expectedMean =
          Math.round((sum / rp.data.length) * 10) / 10;
        expect(rp.mean).toBeCloseTo(expectedMean, 1);
      }
    }
  });

  it("representative: median is correct", () => {
    for (const seed of seeds) {
      const problems = generateDataAnalysis(seed, "representative");
      for (const p of problems) {
        const rp = p as RepresentativeProblem;
        const mid = Math.floor(rp.data.length / 2);
        const expectedMedian =
          rp.data.length % 2 === 0
            ? Math.round(((rp.data[mid - 1] + rp.data[mid]) / 2) * 10) / 10
            : rp.data[mid];
        expect(rp.median).toBeCloseTo(expectedMedian, 1);
      }
    }
  });

  it("representative: range is max - min", () => {
    for (const seed of seeds) {
      const problems = generateDataAnalysis(seed, "representative");
      for (const p of problems) {
        const rp = p as RepresentativeProblem;
        expect(rp.range).toBe(
          rp.data[rp.data.length - 1] - rp.data[0],
        );
      }
    }
  });

  it("representative: data size is between 7 and 12", () => {
    for (const seed of seeds) {
      const problems = generateDataAnalysis(seed, "representative");
      for (const p of problems) {
        const rp = p as RepresentativeProblem;
        expect(rp.data.length).toBeGreaterThanOrEqual(7);
        expect(rp.data.length).toBeLessThanOrEqual(12);
      }
    }
  });

  it("frequency: frequencies sum to total", () => {
    for (const seed of seeds) {
      const problems = generateDataAnalysis(seed, "frequency");
      for (const p of problems) {
        const fp = p as FrequencyProblem;
        const sum = fp.frequencies.reduce((a, b) => a + b, 0);
        expect(sum).toBe(fp.total);
      }
    }
  });

  it("frequency: cumulative frequencies are correct", () => {
    for (const seed of seeds) {
      const problems = generateDataAnalysis(seed, "frequency");
      for (const p of problems) {
        const fp = p as FrequencyProblem;
        let cumSum = 0;
        for (let i = 0; i < fp.frequencies.length; i++) {
          cumSum += fp.frequencies[i];
          expect(fp.cumulativeFrequencies[i]).toBe(cumSum);
        }
      }
    }
  });

  it("frequency: relative frequencies sum to approximately 1", () => {
    for (const seed of seeds) {
      const problems = generateDataAnalysis(seed, "frequency");
      for (const p of problems) {
        const fp = p as FrequencyProblem;
        const sum = fp.relativeFrequencies.reduce((a, b) => a + b, 0);
        expect(sum).toBeCloseTo(1, 1);
      }
    }
  });

  it("frequency: total is between 20 and 40", () => {
    for (const seed of seeds) {
      const problems = generateDataAnalysis(seed, "frequency");
      for (const p of problems) {
        const fp = p as FrequencyProblem;
        expect(fp.total).toBeGreaterThanOrEqual(20);
        expect(fp.total).toBeLessThanOrEqual(40);
      }
    }
  });
});
