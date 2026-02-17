import { mulberry32 } from "../random";

export interface CrossTableProblem {
  title: string;
  rowLabels: string[];
  colLabels: string[];
  cells: (number | null)[][];
  answers: number[];
}

export function generateCrossTable(seed: number): CrossTableProblem[] {
  const rng = mulberry32(seed);
  const problems: CrossTableProblem[] = [];

  const settings = [
    { title: "好きな遊びしらべ", rows: ["男子", "女子"], cols: ["ドッジボール", "おにごっこ", "なわとび"] },
    { title: "読書冊数しらべ", rows: ["1組", "2組"], cols: ["物語", "図鑑", "まんが"] },
    { title: "通学方法しらべ", rows: ["男子", "女子"], cols: ["歩き", "バス", "車"] },
    { title: "好きな季節しらべ", rows: ["男子", "女子"], cols: ["春", "夏", "秋", "冬"] },
  ];

  for (let t = 0; t < 4; t++) {
    const s = settings[t];
    const nrows = s.rows.length;
    const ncols = s.cols.length;

    // generate data
    const data: number[][] = [];
    for (let r = 0; r < nrows; r++) {
      const row: number[] = [];
      for (let c = 0; c < ncols; c++) {
        row.push(1 + Math.floor(rng() * 15));
      }
      data.push(row);
    }

    // add row totals and col totals
    const rowTotals = data.map(row => row.reduce((a, b) => a + b, 0));
    const colTotals: number[] = [];
    for (let c = 0; c < ncols; c++) {
      colTotals.push(data.reduce((sum, row) => sum + row[c], 0));
    }
    const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

    // build cells with totals: rows + "合計", cols + "合計"
    const fullRows = [...s.rows, "合計"];
    const fullCols = [...s.cols, "合計"];
    const cells: (number | null)[][] = [];
    for (let r = 0; r <= nrows; r++) {
      const row: (number | null)[] = [];
      for (let c = 0; c <= ncols; c++) {
        if (r < nrows && c < ncols) row.push(data[r][c]);
        else if (r < nrows && c === ncols) row.push(rowTotals[r]);
        else if (r === nrows && c < ncols) row.push(colTotals[c]);
        else row.push(grandTotal);
      }
      cells.push(row);
    }

    // blank some cells (pick 3-4 from totals row/col)
    const blankPositions: [number, number][] = [];
    const totalCells: [number, number][] = [];
    for (let c = 0; c <= ncols; c++) totalCells.push([nrows, c]);
    for (let r = 0; r < nrows; r++) totalCells.push([r, ncols]);

    // shuffle and pick
    for (let j = totalCells.length - 1; j > 0; j--) {
      const k = Math.floor(rng() * (j + 1));
      [totalCells[j], totalCells[k]] = [totalCells[k], totalCells[j]];
    }
    const numBlanks = 3 + Math.floor(rng() * 2);
    for (let j = 0; j < Math.min(numBlanks, totalCells.length); j++) {
      blankPositions.push(totalCells[j]);
    }

    const answers: number[] = [];
    for (const [r, c] of blankPositions) {
      answers.push(cells[r][c] as number);
      cells[r][c] = null;
    }

    problems.push({ title: s.title, rowLabels: fullRows, colLabels: fullCols, cells, answers });
  }
  return problems;
}
