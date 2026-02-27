export const Box = ({ answer, show }: { answer: number | string; show: boolean }) => {
  return (
    <span className="ws-box">
      <span className={show ? "ws-box-val" : "ws-box-val ws-hidden"}>
        {answer}
      </span>
    </span>
  );
};
