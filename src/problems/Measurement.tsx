import type { ProblemGroup } from "./types";
import Clock from "./measurement/Clock";
import UnitConv from "./measurement/UnitConv";
import TimeCalc from "./measurement/TimeCalc";
import UnitConv3 from "./measurement/UnitConv3";
import TimeCalc3 from "./measurement/TimeCalc3";
import Speed from "./measurement/Speed";
import UnitAmount from "./measurement/UnitAmount";
import Average from "./measurement/Average";

export const measurement: ProblemGroup = {
  id: "measurement",
  label: "測定",
  operators: [
    { operator: "clock", label: "時計のよみ方", grades: [1], category: "measurement", Component: Clock },
    { operator: "unit-conv", label: "単位の換算", grades: [2], category: "measurement", Component: UnitConv },
    { operator: "time-calc", label: "時刻と時間", grades: [2], category: "measurement", Component: TimeCalc },
    { operator: "unit-conv3", label: "単位の換算", grades: [3], category: "measurement", Component: UnitConv3 },
    { operator: "time-calc3", label: "時刻と時間（3年）", grades: [3], category: "measurement", Component: TimeCalc3 },
    { operator: "speed", label: "速さ・時間・距離", grades: [5], category: "measurement", Component: Speed },
    { operator: "unit-amount", label: "単位量あたり", grades: [5], category: "measurement", Component: UnitAmount },
    { operator: "average", label: "平均", grades: [5], category: "measurement", Component: Average },
  ],
};
