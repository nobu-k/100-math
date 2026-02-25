import { Grid100 } from "./Grid100";

const Addition = () => (
  <Grid100
    symbol="+"
    colHeader={(num) => num}
    compute={(row, col) => row + col}
  />
);

export default Addition;
