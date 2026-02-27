const renderTableProblems = (
  problems: { label: string; xValues: number[]; yValues: (number | null)[]; answers: number[] }[],
  showAnswers: boolean,
) => (
  <div className="dev-text-page print-spread">
    {problems.map((p, idx) => {
      let ansIdx = 0;
      return (
        <div key={idx} className="dev-prop-block">
          <div className="dev-prop-label">({idx + 1}) {p.label}</div>
          <table className="dev-prop-table">
            <thead><tr><th>x</th>{p.xValues.map((x, j) => <th key={j}>{x}</th>)}</tr></thead>
            <tbody>
              <tr>
                <td>y</td>
                {p.yValues.map((y, j) => {
                  if (y !== null) return <td key={j}>{y}</td>;
                  const ans = p.answers[ansIdx++];
                  return (
                    <td key={j} className="dev-prop-blank">
                      <span className={showAnswers ? "dev-frac-ans" : "ws-hidden"}>{ans}</span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      );
    })}
  </div>
);

export default renderTableProblems;
