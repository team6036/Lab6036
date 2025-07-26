import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
  clearAuthError,
  selectAuth,
  selectAuthLastFetch,
  selectPassword,
  setAuth,
  setAuthError,
  setAuthLastFetch,
} from "../store/slice";
import { encrypt } from "../util";
import { selectAuthFetching, setAuthFetching } from "../store/slice.loading";

export default function useTryAuth(type: "user" | "admin", debounce: number) {
  const dispatch = useAppDispatch();

  const auth = useAppSelector(selectAuth);
  const password = useAppSelector(selectPassword);
  const lastFetch = useAppSelector(selectAuthLastFetch);
  const authing = useAppSelector(selectAuthFetching);

  const tryAuth = useCallback(
    async (force = false) => {
      if (authing) return;

      console.log("auth: trying...");

      if (!force && (Date.now() - lastFetch) / 1e3 < debounce) {
        console.log(
          `auth: debounce - next allowed in ${(
            debounce -
            (Date.now() - lastFetch) / 1e3
          ).toFixed(3)}s`,
        );
        return;
      }
      dispatch(setAuthLastFetch());
      dispatch(setAuthFetching(true));

      try {
        dispatch(clearAuthError());

        console.log("auth: fetching from /api/auth...");
        const resp = await fetch(
          `/api/auth?pwd_encrypted=${encrypt(password, password)}`,
        );
        if (!resp.ok) throw new Error(await resp.text());

        console.log("auth: parsing json...");
        const json = await resp.json();
        if (!json.success) throw new Error(json.reason);

        const auth = json.auth;
        if (typeof auth !== "string") throw new TypeError();
        if (type === "user")
          if (!["user", "admin"].includes(auth)) throw new Error("password");
        if (type === "admin")
          if (!["admin"].includes(auth)) throw new Error("password");

        console.log(`auth: access granted for ${auth}!`);
        dispatch(setAuth(auth as "user" | "admin"));
      } catch (e: any) {
        console.log("auth: access denied!");
        console.error(e);
        dispatch(setAuth(null));
        dispatch(setAuthError(String(e.message)));
      }

      dispatch(setAuthFetching(false));
    },
    [type, auth, password, lastFetch, authing, dispatch],
  );

  return tryAuth;
}
