export const Frac = ({ num, den, cls }: { num: number; den: number; cls?: string }) => {
  return (
    <span className={`dev-frac${cls ? " " + cls : ""}`}>
      <span className="dev-frac-num">{num}</span>
      <span className="dev-frac-den">{den}</span>
    </span>
  );
};
