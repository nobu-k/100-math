export function Box({ answer, show }: { answer: number | string; show: boolean }) {
  return (
    <span className="g1-box">
      <span className={show ? "g1-box-val" : "g1-box-val g1-hidden"}>
        {answer}
      </span>
    </span>
  );
}
