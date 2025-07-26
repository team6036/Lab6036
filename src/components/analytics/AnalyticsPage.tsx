import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  selectAnalyticsSortBy,
  selectAnalyticsSortDir,
  selectAuthFor,
  selectLabHours,
  setAnalyticsSortBy,
  toggleAnalyticsSortDir,
} from "../../store/slice";
import { getCycleIndex, getCycleWeekIndex, MOCK_LAB_HOURS } from "../../util";
import HoursEntry from "./HoursEntry";
import { IoChevronDownSharp } from "react-icons/io5";

export default function AnalyticsPage() {
  const dispatch = useAppDispatch();

  const auth = useAppSelector((state) => selectAuthFor(state, "user"));

  const actualLabHours = useAppSelector(selectLabHours);

  const labHours = auth ? actualLabHours : MOCK_LAB_HOURS;

  const cycleIndex = getCycleIndex();
  const cycleWeekIndex = getCycleWeekIndex();

  const sortBy = useAppSelector(selectAnalyticsSortBy);
  const sortDir = useAppSelector(selectAnalyticsSortDir);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full h-full p-16 flex flex-row items-center justify-start gap-4"
    >
      <div
        className="h-full max-h-full grid bg-zinc-800 border border-zinc-700 rounded-xl overflow-auto no-scrollbar"
        style={{
          gridTemplateColumns:
            "2rem 15rem 7rem 7rem 7rem " +
            Array.from(new Array(cycleIndex + 1).keys())
              .map(() => "7rem")
              .join(" "),
          gridTemplateRows: `repeat(${Math.max(
            2,
            labHours.userProfiles.length + 1,
          )}, 2rem)`,
        }}
      >
        <div className="sticky top-0 col-span-1 px-2 py-2 font-bold text-white bg-zinc-700"></div>
        <div
          className="sticky top-0 col-span-1 px-4 py-2 font-bold text-white bg-zinc-700"
          onClick={() => dispatch(setAnalyticsSortBy("name"))}
        >
          Name
          {sortBy === "name" && (
            <motion.button
              className="absolute top-1/2 -translate-y-1/2 right-2 cursor-pointer"
              animate={{ scaleY: sortDir === "down" ? 1 : -1 }}
              onClick={() => dispatch(toggleAnalyticsSortDir())}
            >
              <IoChevronDownSharp />
            </motion.button>
          )}
        </div>
        <div
          className="sticky top-0 col-span-1 px-2 py-2 font-bold text-white bg-zinc-700"
          onClick={() => dispatch(setAnalyticsSortBy("hours-week"))}
        >
          Week Hours
          {sortBy === "hours-week" && (
            <motion.button
              className="absolute top-1/2 -translate-y-1/2 right-2 cursor-pointer"
              animate={{ scaleY: sortDir === "down" ? 1 : -1 }}
              onClick={() => dispatch(toggleAnalyticsSortDir())}
            >
              <IoChevronDownSharp />
            </motion.button>
          )}
        </div>
        <div
          className="sticky top-0 col-span-1 px-2 py-2 font-bold text-white bg-zinc-700"
          onClick={() => dispatch(setAnalyticsSortBy("hours-cycle"))}
        >
          Cycle Hours
          {sortBy === "hours-cycle" && (
            <motion.button
              className="absolute top-1/2 -translate-y-1/2 right-2 cursor-pointer"
              animate={{ scaleY: sortDir === "down" ? 1 : -1 }}
              onClick={() => dispatch(toggleAnalyticsSortDir())}
            >
              <IoChevronDownSharp />
            </motion.button>
          )}
        </div>
        <div
          className="sticky top-0 col-span-1 px-2 py-2 font-bold text-white bg-zinc-700"
          onClick={() => dispatch(setAnalyticsSortBy("hours-season"))}
        >
          Season Hours
          {sortBy === "hours-season" && (
            <motion.button
              className="absolute top-1/2 -translate-y-1/2 right-2 cursor-pointer"
              animate={{ scaleY: sortDir === "down" ? 1 : -1 }}
              onClick={() => dispatch(toggleAnalyticsSortDir())}
            >
              <IoChevronDownSharp />
            </motion.button>
          )}
        </div>
        {Array.from(new Array(cycleIndex + 1).keys()).map((i) => (
          <div
            key={"header" + i}
            className="sticky top-0 col-span-1 px-2 py-2 font-bold text-white bg-zinc-700"
          >
            Cycle {i + 1}
          </div>
        ))}
        {labHours.userProfiles.length <= 0 && (
          <>
            <div className="col-span-3 px-6 py-2 text-zinc-500 text-center italic">
              No users registered
            </div>
            {Array.from(new Array(cycleIndex + 1).keys()).map((i) => (
              <div key={i} className="col-span-1"></div>
            ))}
          </>
        )}
        {[...labHours.userProfiles]
          .sort((a, b) => {
            const nameSort = a.user.localeCompare(b.user);
            const hoursWeekSort =
              (b.cycles[cycleIndex]?.weeks[cycleWeekIndex]?.total ?? 0) -
              (a.cycles[cycleIndex]?.weeks[cycleWeekIndex]?.total ?? 0);
            const hoursCycleSort =
              (b.cycles[cycleIndex]?.total ?? 0) -
              (a.cycles[cycleIndex]?.total ?? 0);
            const hoursSeasonSort = b.total - a.total;
            const sortFlip = sortDir === "down" ? 1 : -1;
            if (sortBy === "name")
              return (
                (nameSort ||
                  hoursWeekSort ||
                  hoursCycleSort ||
                  hoursSeasonSort) * sortFlip
              );
            if (sortBy === "hours-week")
              return (
                (hoursWeekSort ||
                  nameSort ||
                  hoursCycleSort ||
                  hoursSeasonSort) * sortFlip
              );
            if (sortBy === "hours-cycle")
              return (
                (hoursCycleSort ||
                  nameSort ||
                  hoursWeekSort ||
                  hoursSeasonSort) * sortFlip
              );
            return (
              (hoursSeasonSort || nameSort || hoursWeekSort || hoursCycleSort) *
              sortFlip
            );
          })
          .map((profile, index) => (
            <HoursEntry key={profile.user} index={index} profile={profile} />
          ))}
      </div>
    </motion.div>
  );
}
