import { selectAuthError, selectPassword, setPassword } from "../store/slice";
import { useAppDispatch, useAppSelector } from "../store/store";
import { motion } from "framer-motion";
import Spinner from "./Spinner";
import { useEffect, useState } from "react";
import { selectAuthFetching } from "../store/slice.loading";
import useTryAuth from "../hooks/useTryAuth";

export interface AuthComponentProps {
  type: "user" | "admin";
  debounce: number;
}

export default function AuthComponent({ type, debounce }: AuthComponentProps) {
  const dispatch = useAppDispatch();

  const password = useAppSelector(selectPassword);

  const authing = useAppSelector(selectAuthFetching);

  const authError = useAppSelector(selectAuthError);
  const [authErrorPassword, setAuthErrorPassword] = useState("");
  useEffect(() => {
    if (authError !== "password") return;
    setAuthErrorPassword(password);
  }, [type, authError]);

  const tryAuth = useTryAuth(type, debounce);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute left-0 right-0 top-0 bottom-0 flex flex-col flex-center items-center justify-center gap-4 bg-black/25 backdrop-blur-xs z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="min-w-[30rem] min-h-[15rem] py-8 px-16 flex flex-col flex-center items-center justify-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl drop-shadow-xl drop-shadow-black/50"
      >
        {authing && <Spinner key="spinner" scale={20} />}
        {!authing && (authError == null || authError === "password") && (
          <>
            <h1 className="text-white text-lg font-bold">Enter Password</h1>
            <p className="mb-2">
              A password is required to access Team 6036's lab hour sheet
            </p>
            <input
              className="self-stretch px-4 py-2 bg-zinc-900 outline-none rounded-md placeholder:text-zinc-600 placeholder:italic"
              placeholder="Password..."
              value={password}
              onChange={(e) => dispatch(setPassword(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Return") tryAuth(true);
              }}
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button
              disabled={password.length <= 0}
              className="px-6 py-2 font-semibold text-white disabled:text-zinc-500 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 rounded-md transition-colors cursor-pointer"
              onClick={() => tryAuth(true)}
            >
              Submit
            </button>
            {authErrorPassword && (
              <p className="mt-2 text-red-500 -mb-8">
                The password was not correct!
              </p>
            )}
          </>
        )}
        {!authing && authError != null && authError !== "password" && (
          <>
            <h1 className="text-white text-lg font-bold">
              Authorization Error
            </h1>
            <p className="mb-2">
              An error occured while authorizing you for Team 6036's lab hour
              sheet
            </p>
            <pre className="mb-2 font-mono text-red-500">
              {authError || "Unknown Error"}
            </pre>
            <button
              className="px-6 py-2 font-semibold text-white disabled:text-zinc-500 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 rounded-md transition-colors cursor-pointer"
              onClick={() => tryAuth(true)}
            >
              Retry
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
