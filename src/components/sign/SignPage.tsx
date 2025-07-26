import { AnimatePresence, motion } from "framer-motion";
import {
  selectAuthFor,
  selectLabHours,
  selectPassword,
  setDataLastFetch,
} from "../../store/slice";
import { selectDataFetching, setDataFetching } from "../../store/slice.loading";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { useState } from "react";
import { getSimilarity, MOCK_LAB_HOURS } from "../../util";

export interface SignPageProps {
  type: "in" | "out";
}

export default function SignPage({ type }: SignPageProps) {
  const dispatch = useAppDispatch();

  const auth = useAppSelector((state) => selectAuthFor(state, "admin"));
  const password = useAppSelector(selectPassword);

  const actualLabHours = useAppSelector(selectLabHours);

  const labHours = auth ? actualLabHours : MOCK_LAB_HOURS;

  const fetching = useAppSelector(selectDataFetching);

  const signIn = async (name: string) => {
    if (fetching) return;
    dispatch(setDataFetching(true));
    try {
      const resp = await fetch(
        `/api/signin?pwd=${password}&name=${encodeURIComponent(name)}`,
        { method: "POST" },
      );

      if (!resp.ok) throw new Error(await resp.text());

      const json = await resp.json();
      if (!json.success) throw new Error(json.reason);
      dispatch(setDataLastFetch(0));
    } catch (e) {
    } finally {
      dispatch(setDataFetching(false));
    }
  };
  const signOut = async (name: string) => {
    if (fetching) return;
    dispatch(setDataFetching(true));
    try {
      const resp = await fetch(
        `/api/signout?pwd=${password}&name=${encodeURIComponent(name)}`,
        { method: "POST" },
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

  const [name, setName] = useState("");

  const users = [...labHours.users]
    .map((user) => ({ ...user, similarity: getSimilarity(name, user.name) }))
    .filter((user) => user.name !== name)
    .filter((user) => user.similarity > 0.5)
    .sort((a, b) => {
      const similarityA = a.similarity;
      const similarityB = b.similarity;
      const similarityCompare = similarityB - similarityA;
      if (similarityCompare !== 0) return similarityCompare;
      return a.name.localeCompare(b.name);
    });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full h-full p-24 flex flex-col items-center justify-center gap-8"
    >
      <h1 className="font-bold text-6xl text-white">
        Sign {{ in: "In", out: "Out" }[type]}
      </h1>
      <p className="text-3xl">Enter your full name:</p>
      <div className="relative">
        <input
          disabled={fetching}
          className="w-full px-6 py-4 text-3xl bg-zinc-800 outline-none rounded-xl"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoCapitalize="off"
          autoComplete="off"
          spellCheck={false}
        />
        <AnimatePresence>
          {name && (
            <motion.div
              className="absolute top-full left-0 right-0 max-h-96 flex flex-col items-start justify-stretch bg-zinc-800 rounded-xl overflow-auto"
              style={{ transformOrigin: "50% 0" }}
            >
              {users.map((user, i) => (
                <button
                  key={i}
                  className="px-6 py-4 text-3xl w-full text-left"
                  onClick={() => setName(user.name)}
                >
                  {user.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <button
        disabled={fetching}
        className="px-8 py-4 text-3xl disabled:text-zinc-400 font-semibold bg-zinc-700 disabled:bg-zinc-800 rounded-xl"
        onClick={
          {
            in: async () => {
              await signIn(name);
              setName("");
            },
            out: async () => {
              await signOut(name);
              setName("");
            },
          }[type]
        }
      >
        Submit
      </button>
    </motion.div>
  );
}
