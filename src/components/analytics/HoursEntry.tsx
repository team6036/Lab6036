import {
  selectAnalyticsSortBy,
  selectAnalyticsSortDir,
} from "../../store/slice";
import { useAppSelector } from "../../store/store";
import type { DisplayEntry } from "../../types";
import {
  dangerScale,
  getCycleIndex,
  getCycleWeekIndex,
  HOUR_QUOTA,
  rgbToHex,
  WEEKS_PER_CYCLE,
} from "../../util";
import { FaCrown } from "react-icons/fa6";

function fix(n: number) {
  return Math.round(n * 1e3) / 1e3;
}

export interface HoursEntryProps {
  entry: DisplayEntry;
}

export default function HoursEntry({
  entry: { index, profile },
}: HoursEntryProps) {
  const cycleIndex = getCycleIndex();
  const cycleWeekIndex = getCycleWeekIndex();

  const weekHours =
    profile.cycles[cycleIndex]?.weeks[cycleWeekIndex]?.total ?? 0;
  const cycleHours = profile.cycles[cycleIndex]?.total ?? 0;

  const weekColor = rgbToHex(
    dangerScale(weekHours / (HOUR_QUOTA / WEEKS_PER_CYCLE)),
  );
  const cycleColor = rgbToHex(dangerScale(cycleHours / HOUR_QUOTA));

  const sortBy = useAppSelector(selectAnalyticsSortBy);
  const sortDir = useAppSelector(selectAnalyticsSortDir);
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
        className="col-span-1 px-2 py-2"
        style={{ color: weekColor, background: weekColor + "20" }}
      >
        {fix(weekHours)}
      </div>
      <div
        className="col-span-1 px-2 py-2"
        style={{ color: cycleColor, background: cycleColor + "20" }}
      >
        {fix(cycleHours)}
      </div>
      <div className="col-span-1 px-2 py-2">{fix(profile.total)}</div>
      {Array.from(new Array(cycleIndex + 1).keys()).map((i) => {
        const color = rgbToHex(
          dangerScale((profile.cycles[i]?.total ?? 0) / HOUR_QUOTA),
        );
        return (
          <div
            key={profile.user + "-" + i}
            className="col-span-1 px-2 py-2"
            style={{
              color,
              background: color + "20",
            }}
          >
            {fix(profile.cycles[i]?.total ?? 0)}
          </div>
        );
      })}
    </>
  );
}
