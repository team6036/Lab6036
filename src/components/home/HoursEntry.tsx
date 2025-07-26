import { FaCrown } from "react-icons/fa6";
import { selectHomeSortBy, selectHomeSortDir } from "../../store/slice";
import { useAppSelector } from "../../store/store";
import type { DisplayEntry } from "../../types";
import { dangerScale, getCycleIndex, HOUR_QUOTA, rgbToHex } from "../../util";

function fix(n: number) {
  return Math.round(n * 1e1) / 1e1;
}

export interface HoursEntryProps {
  entry: DisplayEntry;
}

export default function HoursEntry({
  entry: { index, profile },
}: HoursEntryProps) {
  const cycleIndex = getCycleIndex();

  const total = profile.cycles[cycleIndex]?.total ?? 0;

  const color = rgbToHex(dangerScale(total / HOUR_QUOTA));

  const sortBy = useAppSelector(selectHomeSortBy);
  const sortDir = useAppSelector(selectHomeSortDir);
  const crown = sortBy !== "name" && sortDir === "down" && index < 3;

  return (
    <>
      <div
        className={`col-span-1 px-2 py-2 ${
          crown
            ? ["text-yellow-500", "text-gray-400", "text-orange-700"][index]
            : "text-zinc-500"
        }`}
      >
        {!crown && index + 1}
        {crown && <FaCrown />}
      </div>
      <div className="col-span-1 px-4 py-2">{profile.user}</div>
      <div
        className="col-span-1 px-4 py-2"
        style={{ color, background: color + "20" }}
      >
        {fix(total)}
      </div>
    </>
  );
}
