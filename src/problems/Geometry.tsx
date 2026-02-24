import type { ProblemGroup } from "./types";
import CircleRD from "./geometry/CircleRD";
import Area from "./geometry/Area";
import Angle from "./geometry/Angle";
import AreaUnit from "./geometry/AreaUnit";
import AreaFormula from "./geometry/AreaFormula";
import Volume from "./geometry/Volume";
import Circumference from "./geometry/Circumference";
import CircleArea from "./geometry/CircleArea";
import PrismVolume from "./geometry/PrismVolume";
import Scale from "./geometry/Scale";
import Sector from "./geometry/Sector";
import SolidVolume from "./geometry/SolidVolume";
import PolygonAngle from "./geometry/PolygonAngle";
import TriangleAngle from "./geometry/TriangleAngle";
import ParallelAngle from "./geometry/ParallelAngle";
import Parallelogram from "./geometry/Parallelogram";
import Similarity from "./geometry/Similarity";
import CircleAngle from "./geometry/CircleAngle";
import Pythagorean from "./geometry/Pythagorean";

export const geometry: ProblemGroup = {
  id: "geometry",
  label: "図形",
  operators: [
    { operator: "circle-rd", label: "円の半径と直径", grades: [3], category: "geometry", Component: CircleRD },
    { operator: "area", label: "面積", grades: [4], category: "geometry", Component: Area },
    { operator: "angle", label: "角度", grades: [4], category: "geometry", Component: Angle },
    { operator: "area-unit", label: "面積の単位換算", grades: [4], category: "geometry", Component: AreaUnit },
    { operator: "area-formula", label: "面積の公式", grades: [5], category: "geometry", Component: AreaFormula },
    { operator: "volume", label: "体積", grades: [5], category: "geometry", Component: Volume },
    { operator: "circumference", label: "円周", grades: [5], category: "geometry", Component: Circumference },
    { operator: "circle-area", label: "円の面積", grades: [6], category: "geometry", Component: CircleArea },
    { operator: "prism-volume", label: "角柱・円柱の体積", grades: [6], category: "geometry", Component: PrismVolume },
    { operator: "scale", label: "縮尺", grades: [6], category: "geometry", Component: Scale },
    { operator: "sector", label: "おうぎ形", grades: [7], category: "geometry", Component: Sector },
    { operator: "solid-volume", label: "立体の体積・表面積", grades: [7], category: "geometry", Component: SolidVolume },
    { operator: "polygon-angle", label: "多角形の角", grades: [8], category: "geometry", Component: PolygonAngle },
    { operator: "triangle-angle", label: "三角形の角度", grades: [8], category: "geometry", Component: TriangleAngle },
    { operator: "parallel-angle", label: "平行線と角", grades: [8], category: "geometry", Component: ParallelAngle },
    { operator: "parallelogram", label: "平行四辺形", grades: [8], category: "geometry", Component: Parallelogram },
    { operator: "similarity", label: "相似", grades: [9], category: "geometry", Component: Similarity },
    { operator: "circle-angle", label: "円周角", grades: [9], category: "geometry", Component: CircleAngle },
    { operator: "pythagorean", label: "三平方の定理", grades: [9], category: "geometry", Component: Pythagorean },
  ],
};
