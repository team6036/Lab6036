import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
  selectDataLastFetch,
  selectPassword,
  setLabHours,
  setDataLastFetch,
  setEntries,
  setUsersAtLab,
  selectAuthFor,
  setParsedEntries,
} from "../store/slice";
import { selectDataFetching, setDataFetching } from "../store/slice.loading";
import { computeFromEntries, decrypt, encrypt } from "../util";
import { isDatabaseData } from "../types";

export default function useTryRefresh(debounce: number) {
  const dispatch = useAppDispatch();

  const auth = useAppSelector((state) => selectAuthFor(state, "user"));
  const password = useAppSelector(selectPassword);
  const lastFetch = useAppSelector(selectDataLastFetch);
  const refreshing = useAppSelector(selectDataFetching);

  const tryRefresh = useCallback(
    async (force = false) => {
      if (!auth) return;
      if (refreshing) return;

      console.log("data: trying...");

      if (!force && (Date.now() - lastFetch) / 1e3 < debounce) {
        console.log(
          `data: debounce - next allowed in ${(
            debounce -
            (Date.now() - lastFetch) / 1e3
          ).toFixed(3)}s`,
        );
        return;
      }
      dispatch(setDataLastFetch());
      dispatch(setDataFetching(true));

      try {
        console.log("data: fetching from /api/data...");
        const resp = await fetch(
          `/api/data?pwd_encrypted=${encodeURIComponent(
            encrypt(password, password),
          )}`,
        );
        if (!resp.ok) throw new Error(await resp.text());

        console.log("data: parsing json...");
        const json = await resp.json();
        if (!json.success) throw new Error(json.reason);

        const dataEncrypted = json.data;
        if (typeof dataEncrypted !== "string") throw new TypeError();
        const data = decrypt(dataEncrypted, password);

        console.log("data: received data!");

        if (!data.startsWith("header;")) throw new Error("expected header;");
        const cleanData = data.slice("header;".length);

        const database = JSON.parse(cleanData);
        if (!isDatabaseData(database))
          throw new TypeError("expected DatabaseData");

        console.log(database);
        dispatch(setEntries(database.logEntries));

        const {
          entries: parsedEntries,
          labHours,
          usersAtLab,
        } = computeFromEntries(database.users, database.logEntries);
        console.log(parsedEntries, labHours, usersAtLab);
        dispatch(setParsedEntries(parsedEntries));
        dispatch(setLabHours(labHours));
        dispatch(setUsersAtLab(usersAtLab));
      } catch (e) {
        console.log("data: failed!");
        console.error(e);
        dispatch(setEntries([]));
        const {
          entries: parsedEntries,
          labHours,
          usersAtLab,
        } = computeFromEntries([], []);
        dispatch(setParsedEntries(parsedEntries));
        dispatch(setLabHours(labHours));
        dispatch(setUsersAtLab(usersAtLab));
      }

      dispatch(setDataFetching(false));
    },
    [auth, password, lastFetch, refreshing, dispatch],
  );

  return tryRefresh;
}
