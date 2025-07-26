import { motion } from "framer-motion";
import {
  selectAuthFor,
  selectEntries,
  selectLabHours,
  selectParsedEntries,
  selectPassword,
  setDataLastFetch,
} from "../../store/slice";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { encrypt, getSimilarity, MOCK_LAB_HOURS } from "../../util";
import { selectDataFetching, setDataFetching } from "../../store/slice.loading";
import UserEntry from "./UserEntry";
import type { Users } from "../../types";
import { IoWarningSharp } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";

export default function AdminPage() {
  const dispatch = useAppDispatch();

  const auth = useAppSelector((state) => selectAuthFor(state, "admin"));
  const password = useAppSelector(selectPassword);

  const entries = useAppSelector(selectEntries);
  const parsedEntries = useAppSelector(selectParsedEntries);

  const actualLabHours = useAppSelector(selectLabHours);

  const labHours = auth ? actualLabHours : MOCK_LAB_HOURS;

  const users = [...labHours.users].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const fetching = useAppSelector(selectDataFetching);

  const changeUsers = async (newUsers: Users) => {
    if (fetching) return;
    dispatch(setDataFetching(true));
    try {
      const resp = await fetch(
        `/api/data?pwd_encrypted=${encodeURIComponent(
          encrypt(password, password),
        )}`,
        {
          method: "POST",
          body:
            "header;" +
            JSON.stringify({ users: newUsers, logEntries: entries }),
        },
      );

      if (!resp.ok) throw new Error(await resp.text());

      const json = await resp.json();
      if (!json.success) throw new Error(json.reason);
      dispatch(setDataLastFetch(0));
    } catch (e) {
      console.error(e);
    } finally {
      dispatch(setDataFetching(false));
    }
  };

  const addUsers = async () => {
    const usersString = prompt("Add user(s) by typing in here:");
    if (!usersString) return;
    const names = usersString.split(/\s+/);
    const addedUsers: string[] = [];
    for (let i = 0; i < names.length; i += 2)
      addedUsers.push(((names[i] ?? "") + " " + (names[i + 1] ?? "")).trim());
    const newUsers = [
      ...users,
      ...addedUsers.map((name) => ({ name, nicknames: [] })),
    ];
    changeUsers(newUsers);
  };

  // 2rem = 32px
  const ref = useRef<HTMLDivElement>(null);
  const [visibleStart, setVisibleStart] = useState(0);
  const [visibleEnd, setVisibleEnd] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const onChange = () => {
      const top = element.scrollTop;
      const height = element.getBoundingClientRect().height;
      setVisibleStart(Math.floor(top / 32) - 10);
      setVisibleEnd(Math.ceil((top + height) / 32) + 10);
    };
    onChange();
    const observer = new ResizeObserver(onChange);
    observer.observe(element);
    element.addEventListener("scroll", onChange);
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", onChange);
    };
  }, [ref]);

  const [logFilter, setLogFilter] = useState("");
  const filteredEntries =
    logFilter === ""
      ? parsedEntries
      : parsedEntries
          .map((log) => {
            const s1 = log.matchedUser
              ? getSimilarity(log.matchedUser, logFilter)
              : getSimilarity(
                  `Unknown: ${JSON.stringify(log.user)}`,
                  logFilter,
                );
            const s2 = log.error
              ? getSimilarity("Error: " + log.error, logFilter)
              : 0;
            const s3 = getSimilarity(log.type, logFilter);
            return { ...log, filterSimilarity: Math.max(s1, s2, s3) };
          })
          .filter((log) => log.filterSimilarity >= 0.5);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full h-full p-16 flex flex-col items-stretch justify-start gap-4"
    >
      <div className="max-h-full flex flex-row items-start justify-center">
        <div
          className="w-full max-w-[35rem] grid max-h-full overflow-auto no-scrollbar"
          style={{
            gridTemplateColumns: "2rem 1fr 1fr 1fr",
            gridTemplateRows: `2rem 1rem repeat(${users.length}, 2rem) 4rem`,
          }}
        >
          <h1 className="col-span-4 font-bold text-white text-xl">Users</h1>
          <div className="col-span-1 font-semibold text-white"></div>
          <div className="col-span-1 font-semibold text-white">Name</div>
          <div className="col-span-1 font-semibold text-white">Nickname(s)</div>
          <div className="col-span-1 font-semibold text-white"></div>
          {users.map((user) => (
            <UserEntry
              key={user.name}
              user={user}
              onChange={(newUser) => {
                const newUsers = users.map((u) =>
                  u.name === user.name ? newUser : u,
                );
                changeUsers(newUsers);
              }}
              onRemove={() => {
                const newUsers = users.filter((u) => u.name !== user.name);
                changeUsers(newUsers);
              }}
            />
          ))}
          <div className="col-span-4 pt-4">
            <button
              disabled={fetching}
              className="self-start px-8 py-2 text-white disabled:text-zinc-500 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 rounded-md transition-colors cursor-pointer disabled:cursor-auto"
              onClick={addUsers}
            >
              Add user(s)
            </button>
          </div>
        </div>
        <div
          ref={ref}
          className="w-full max-w-[35rem] grid max-h-full overflow-auto no-scrollbar -mx-2 px-2"
          style={{
            gridTemplateColumns: "1fr",
            gridTemplateRows: `2rem repeat(${filteredEntries.length}, 2rem)`,
          }}
        >
          <h1 className="col-span-1 font-bold text-white text-xl bg-zinc-900 flex flex-row items-center justify-start sticky top-0 z-10 -mx-2 px-2">
            <span className="flex-1">Logs</span>
            <input
              className="bg-zinc-800 font-normal text-xs px-2 py-1 outline-none placeholder:text-zinc-500 placeholder:italic"
              placeholder="Filter..."
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
            />
          </h1>
          {filteredEntries.map(
            ({ time, type, user, matchedUser, error }, i) =>
              i >= visibleStart &&
              i <= visibleEnd && (
                <div
                  key={i}
                  className={`col-span-1 flex flex-row items-center justify-start gap-2 ${
                    error ? "bg-red-500/25" : ""
                  } -mx-2 px-2`}
                  style={{ gridRow: `${i + 2}` }}
                >
                  <div className="font-mono min-w-40">
                    {String(time.date.month).padStart(2, "0")}/
                    {String(time.date.day).padStart(2, "0")}/{time.date.year}{" "}
                    {String(time.hour).padStart(2, "0")}:
                    {String(time.minute).padStart(2, "0")}:
                    {String(time.second).padStart(2, "0")}
                  </div>
                  <div className="font-mono min-w-8">{type.toUpperCase()}</div>
                  <div className="flex-1">
                    {matchedUser ?? `Unknown: ${JSON.stringify(user)}`}
                  </div>
                  {error && (
                    <div className="group relative text-red-500">
                      <IoWarningSharp />
                      <div
                        className="absolute right-0 bottom-full min-w-32 p-2 bg-red-500/50 text-white rounded-md scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all"
                        style={{ transformOrigin: "bottom right" }}
                      >
                        {error}
                      </div>
                    </div>
                  )}
                </div>
              ),
          )}
        </div>
      </div>
    </motion.div>
  );
}
