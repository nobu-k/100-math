const ClockFace = ({ hour, minute }: { hour: number; minute: number }) => {
  const cx = 100, cy = 100, r = 88;
  const hourAngle = ((hour % 12) + minute / 60) * 30;
  const minuteAngle = minute * 6;

  const hand = (angle: number, len: number, w: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return (
      <line x1={cx} y1={cy} x2={cx + len * Math.cos(rad)} y2={cy + len * Math.sin(rad)}
        stroke="#000" strokeWidth={w} strokeLinecap="round" />
    );
  };

  return (
    <svg className="ws-clock-svg" viewBox="0 0 200 200">
      <circle cx={cx} cy={cy} r={r} fill="#fff" stroke="#000" strokeWidth="3" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = ((i * 30 - 90) * Math.PI) / 180;
        const inner = r - 10;
        const numR = r - 22;
        return (
          <g key={i}>
            <line x1={cx + inner * Math.cos(a)} y1={cy + inner * Math.sin(a)}
              x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="#000" strokeWidth="3" />
            <text x={cx + numR * Math.cos(a)} y={cy + numR * Math.sin(a)}
              textAnchor="middle" dominantBaseline="central" fontSize="18" fontWeight="bold" fill="#000">
              {i === 0 ? 12 : i}
            </text>
          </g>
        );
      })}
      {Array.from({ length: 60 }, (_, i) => {
        if (i % 5 === 0) return null;
        const a = ((i * 6 - 90) * Math.PI) / 180;
        return (
          <line key={i} x1={cx + (r - 4) * Math.cos(a)} y1={cy + (r - 4) * Math.sin(a)}
            x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="#000" strokeWidth="1" />
        );
      })}
      {hand(hourAngle, 48, 5)}
      {hand(minuteAngle, 68, 3)}
      <circle cx={cx} cy={cy} r="4" fill="#000" />
    </svg>
  );
};

export default ClockFace;
