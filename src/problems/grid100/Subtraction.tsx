import { Grid100 } from "./Grid100";

const Subtraction = () => (
  <Grid100
    symbol="−"
    colHeader={(num) => num + 10}
    compute={(row, col) => col + 10 - row}
  />
);

export default Subtraction;
