import type { ProblemGroup } from "./types";

function UnderDevelopment({ operator }: { operator: string }) {
  return (
    <div style={{ padding: "2em", color: "#888" }}>
      <p>この問題は開発中です: {operator}</p>
    </div>
  );
}

export const underDevelopment: ProblemGroup = {
  id: "dev",
  label: "開発中",
  operators: [],
  Component: UnderDevelopment,
};
