import { describe, it, expect } from "vitest";
import { generateCrossTable } from "./cross-table";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateCrossTable
// ---------------------------------------------------------------------------
describe("generateCrossTable", () => {
  it("returns 4 problems", () => {
    const problems = generateCrossTable(42);
    expect(problems).toHaveLength(4);
  });

  it("each problem has a title, row/col labels, cells, and answers", () => {
    for (const seed of seeds) {
      const problems = generateCrossTable(seed);
      for (const p of problems) {
        expect(p.title.length).toBeGreaterThan(0);
        expect(p.rowLabels.length).toBeGreaterThanOrEqual(3); // at least 2 rows + 合計
        expect(p.colLabels.length).toBeGreaterThanOrEqual(4); // at least 3 cols + 合計
        expect(p.cells.length).toBe(p.rowLabels.length);
        for (const row of p.cells) {
          expect(row.length).toBe(p.colLabels.length);
        }
        expect(p.answers.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("last row label and last col label are 合計", () => {
    for (const seed of seeds) {
      const problems = generateCrossTable(seed);
      for (const p of problems) {
        expect(p.rowLabels[p.rowLabels.length - 1]).toBe("合計");
        expect(p.colLabels[p.colLabels.length - 1]).toBe("合計");
      }
    }
  });

  it("blanks are in total row/column only", () => {
    for (const seed of seeds) {
      const problems = generateCrossTable(seed);
      for (const p of problems) {
        const nrows = p.rowLabels.length - 1; // excluding 合計
        const ncols = p.colLabels.length - 1; // excluding 合計
        for (let r = 0; r < nrows; r++) {
          for (let c = 0; c < ncols; c++) {
            // data cells (non-total) should never be null
            expect(p.cells[r][c]).not.toBeNull();
          }
        }
      }
    }
  });

  it("number of null cells equals number of answers", () => {
    for (const seed of seeds) {
      const problems = generateCrossTable(seed);
      for (const p of problems) {
        let nullCount = 0;
        for (const row of p.cells) {
          for (const cell of row) {
            if (cell === null) nullCount++;
          }
        }
        expect(nullCount).toBe(p.answers.length);
      }
    }
  });

  it("non-null totals equal the sum of data cells in that row/column", () => {
    for (const seed of seeds) {
      const problems = generateCrossTable(seed);
      for (const p of problems) {
        const nrows = p.rowLabels.length - 1;
        const ncols = p.colLabels.length - 1;

        // Check non-null row totals (last column)
        for (let r = 0; r < nrows; r++) {
          const rowTotal = p.cells[r][ncols];
          if (rowTotal !== null) {
            let sum = 0;
            for (let c = 0; c < ncols; c++) {
              sum += p.cells[r][c] as number;
            }
            expect(rowTotal).toBe(sum);
          }
        }

        // Check non-null column totals (last row)
        for (let c = 0; c < ncols; c++) {
          const colTotal = p.cells[nrows][c];
          if (colTotal !== null) {
            let sum = 0;
            for (let r = 0; r < nrows; r++) {
              sum += p.cells[r][c] as number;
            }
            expect(colTotal).toBe(sum);
          }
        }

        // Check non-null grand total
        const grandCell = p.cells[nrows][ncols];
        if (grandCell !== null) {
          let grandTotal = 0;
          for (let r = 0; r < nrows; r++) {
            for (let c = 0; c < ncols; c++) {
              grandTotal += p.cells[r][c] as number;
            }
          }
          expect(grandCell).toBe(grandTotal);
        }
      }
    }
  });

  it("answers are correct totals for the blanked cells", () => {
    for (const seed of seeds) {
      const problems = generateCrossTable(seed);
      for (const p of problems) {
        const nrows = p.rowLabels.length - 1;
        const ncols = p.colLabels.length - 1;

        // Compute expected row totals, col totals, and grand total from data cells
        const rowTotals: number[] = [];
        for (let r = 0; r < nrows; r++) {
          let sum = 0;
          for (let c = 0; c < ncols; c++) {
            sum += p.cells[r][c] as number;
          }
          rowTotals.push(sum);
        }
        const colTotals: number[] = [];
        for (let c = 0; c < ncols; c++) {
          let sum = 0;
          for (let r = 0; r < nrows; r++) {
            sum += p.cells[r][c] as number;
          }
          colTotals.push(sum);
        }
        const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

        // Build expected values for total cells
        const expectedTotals: Map<string, number> = new Map();
        for (let r = 0; r < nrows; r++) {
          expectedTotals.set(`${r},${ncols}`, rowTotals[r]);
        }
        for (let c = 0; c < ncols; c++) {
          expectedTotals.set(`${nrows},${c}`, colTotals[c]);
        }
        expectedTotals.set(`${nrows},${ncols}`, grandTotal);

        // Every answer should match an expected total value
        // Collect the null positions and their expected values
        const nullExpected: number[] = [];
        for (let r = 0; r < p.cells.length; r++) {
          for (let c = 0; c < p.cells[r].length; c++) {
            if (p.cells[r][c] === null) {
              const key = `${r},${c}`;
              expect(expectedTotals.has(key)).toBe(true);
              nullExpected.push(expectedTotals.get(key)!);
            }
          }
        }

        // The answers (in blankPositions order) should be a permutation of
        // the null cells' expected values (in row-major order).
        // Since both sets contain the same values, sort and compare.
        const sortedAnswers = [...p.answers].sort((a, b) => a - b);
        const sortedExpected = [...nullExpected].sort((a, b) => a - b);
        expect(sortedAnswers).toEqual(sortedExpected);
      }
    }
  });

  it("data cell values are between 1 and 15", () => {
    for (const seed of seeds) {
      const problems = generateCrossTable(seed);
      for (const p of problems) {
        const nrows = p.rowLabels.length - 1;
        const ncols = p.colLabels.length - 1;
        for (let r = 0; r < nrows; r++) {
          for (let c = 0; c < ncols; c++) {
            const val = p.cells[r][c] as number;
            expect(val).toBeGreaterThanOrEqual(1);
            expect(val).toBeLessThanOrEqual(15);
          }
        }
      }
    }
  });

  it("has 3 to 4 blanks per problem", () => {
    for (const seed of seeds) {
      const problems = generateCrossTable(seed);
      for (const p of problems) {
        expect(p.answers.length).toBeGreaterThanOrEqual(3);
        expect(p.answers.length).toBeLessThanOrEqual(4);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateCrossTable(42);
    const b = generateCrossTable(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateCrossTable(1);
    const b = generateCrossTable(2);
    const aAnswers = a.map((p) => p.answers);
    const bAnswers = b.map((p) => p.answers);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
