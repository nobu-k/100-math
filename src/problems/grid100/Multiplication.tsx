import { Grid100 } from "./Grid100";

const Multiplication = () => (
  <Grid100
    symbol="×"
    colHeader={(num) => num}
    compute={(row, col) => row * col}
  />
);

export default Multiplication;
