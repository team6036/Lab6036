import { motion } from "framer-motion";
import HoursEntry from "./HoursEntry";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  selectAuthFor,
  selectHomeSortBy,
  selectHomeSortDir,
  selectLabHours,
  selectUsersAtLab,
  setHomeSortBy,
  toggleHomeSortDir,
} from "../../store/slice";
import {
  getCycleIndex,
  getWeekday,
  getWeekIndex,
  HOUR_QUOTA,
  MOCK_LAB_HOURS,
  MOCK_PEOPLE_HERE,
  WEEKS_PER_CYCLE,
} from "../../util";
import { IoChevronDownSharp } from "react-icons/io5";

export default function HomePage() {
  const dispatch = useAppDispatch();

  const auth = useAppSelector((state) => selectAuthFor(state, "user"));

  const actualLabHours = useAppSelector(selectLabHours);
  const actualUsersAtlab = useAppSelector(selectUsersAtLab);

  const labHours = auth ? actualLabHours : MOCK_LAB_HOURS;
  const peopleHere = auth ? actualUsersAtlab : MOCK_PEOPLE_HERE;

  const weekday = getWeekday();
  const weekIndex = getWeekIndex();
  const cycleIndex = getCycleIndex();

  const sortBy = useAppSelector(selectHomeSortBy);
  const sortDir = useAppSelector(selectHomeSortDir);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full h-full p-16 flex flex-row items-center justify-center gap-4"
    >
      <div
        className="h-full max-h-full grid bg-zinc-800 border border-zinc-700 rounded-xl overflow-auto no-scrollbar"
        style={{
          gridTemplateColumns: "2rem 15rem 5rem",
          gridTemplateRows: `repeat(${Math.max(
            2,
            labHours.userProfiles.length + 1,
          )}, 2rem)`,
        }}
      >
        <div className="sticky top-0 col-span-1 px-2 py-2 font-bold text-white bg-zinc-700"></div>
        <div
          className="sticky top-0 col-span-1 px-4 py-2 font-bold text-white bg-zinc-700"
          onClick={() => dispatch(setHomeSortBy("name"))}
        >
          Name
          {sortBy === "name" && (
            <motion.button
              className="absolute top-1/2 -translate-y-1/2 right-2 cursor-pointer"
              animate={{ scaleY: sortDir === "down" ? 1 : -1 }}
              onClick={() => dispatch(toggleHomeSortDir())}
            >
              <IoChevronDownSharp />
            </motion.button>
          )}
        </div>
        <div
          className="sticky top-0 col-span-1 px-4 py-2 font-bold text-white bg-zinc-700"
          onClick={() => dispatch(setHomeSortBy("hours"))}
        >
          Hours
          {sortBy === "hours" && (
            <motion.button
              className="absolute top-1/2 -translate-y-1/2 right-2 cursor-pointer"
              animate={{ scaleY: sortDir === "down" ? 1 : -1 }}
              onClick={() => dispatch(toggleHomeSortDir())}
            >
              <IoChevronDownSharp />
            </motion.button>
          )}
        </div>
        {labHours.userProfiles.length <= 0 && (
          <div className="col-span-3 px-6 py-2 text-zinc-500 text-center italic">
            No users registered
          </div>
        )}
        {[...labHours.userProfiles]
          .sort((a, b) => {
            const hoursSort =
              (b.cycles[cycleIndex]?.total ?? 0) -
              (a.cycles[cycleIndex]?.total ?? 0);
            const nameSort = a.user.localeCompare(b.user);
            const sortFlip = sortDir === "down" ? 1 : -1;
            if (sortBy === "name") return (nameSort || hoursSort) * sortFlip;
            return (hoursSort || nameSort) * sortFlip;
          })
          .map((profile, index) => (
            <HoursEntry key={profile.user} index={index} profile={profile} />
          ))}
      </div>
      <div className="h-full flex flex-col items-start justify-start gap-4">
        <div className="w-[16rem] p-8 flex flex-col items-center justify-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl">
          <h1 className="font-bold">
            {
              [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ][weekday]
            }
          </h1>
          <div className="font-bold text-white text-xl">
            Cycle {cycleIndex + 1}
          </div>
          <div>
            Week {weekIndex + 1} of {cycleIndex * WEEKS_PER_CYCLE + 1}-
            {(cycleIndex + 1) * WEEKS_PER_CYCLE}
          </div>
        </div>
        <div className="w-[16rem] p-8 flex flex-col items-center justify-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl">
          <h1 className="font-bold">Hour Quota</h1>
          <div className="font-bold text-white text-3xl">{HOUR_QUOTA}</div>
          <div>Weeks start Monday</div>
        </div>
        <div className="relative w-full h-full">
          <div
            className="absolute left-0 right-0 top-0 bottom-0 grid bg-zinc-800 border border-zinc-700 rounded-xl overflow-auto no-scrollbar"
            style={{
              gridTemplateColumns: "1fr",
              gridTemplateRows: `repeat(${Math.max(
                2,
                peopleHere.length + 1,
              )}, 2rem)`,
            }}
          >
            <div className="sticky top-0 col-span-1 px-6 py-2 font-bold text-white bg-zinc-700">
              People Here
            </div>
            {peopleHere.length <= 0 && (
              <div className="px-6 py-2 text-zinc-500 italic">
                Nobody is here
              </div>
            )}
            {peopleHere.map((user) => (
              <div key={user} className="col-span-1 px-6 py-2">
                {user}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
