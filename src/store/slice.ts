import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import type { LabHours, LogEntries, ParsedLogEntries } from "../types";
import { MOCK_LAB_HOURS } from "../util";

interface AppState {
  auth: {
    lastFetch: number;

    auth: null | "user" | "admin";
    password: string;
    authError: null | "password" | string;
  };
  data: {
    lastFetch: number;

    entries: LogEntries;
    parsedEntries: ParsedLogEntries;
    labHours: LabHours;
    usersAtLab: string[];
  };
  view: {
    homeSortBy: "name" | "hours";
    homeSortDir: "down" | "up";

    analyticsSortBy: "name" | "hours-week" | "hours-cycle" | "hours-season";
    analyticsSortDir: "down" | "up";
  };
}

const initialState: AppState = {
  auth: {
    lastFetch: 0,

    auth: null,
    password: "",
    authError: "password",
  },
  data: {
    lastFetch: 0,

    entries: [],
    parsedEntries: [],
    labHours: MOCK_LAB_HOURS,
    usersAtLab: [],
  },
  view: {
    homeSortBy: "name",
    homeSortDir: "down",

    analyticsSortBy: "name",
    analyticsSortDir: "down",
  },
};

const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setAuthLastFetch: (
      state,
      action: PayloadAction<undefined | null | number>,
    ) => {
      state.auth.lastFetch = action.payload ?? Date.now();
    },
    setAuth: (state, action: PayloadAction<null | "user" | "admin">) => {
      state.auth.auth = action.payload;
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.auth.password = action.payload;
    },
    setAuthError: (state, action: PayloadAction<"password" | string>) => {
      state.auth.authError = action.payload;
    },
    clearAuthError: (state) => {
      state.auth.authError = null;
    },

    setDataLastFetch: (
      state,
      action: PayloadAction<undefined | null | number>,
    ) => {
      state.data.lastFetch = action.payload ?? Date.now();
    },
    setEntries: (state, action: PayloadAction<LogEntries>) => {
      state.data.entries = action.payload;
    },
    setParsedEntries: (state, action: PayloadAction<ParsedLogEntries>) => {
      state.data.parsedEntries = action.payload;
    },
    setLabHours: (state, action: PayloadAction<LabHours>) => {
      state.data.labHours = action.payload;
    },
    setUsersAtLab: (state, action: PayloadAction<string[]>) => {
      state.data.usersAtLab = action.payload;
    },

    setHomeSortBy: (state, action: PayloadAction<"name" | "hours">) => {
      state.view.homeSortBy = action.payload;
    },
    setHomeSortDir: (state, action: PayloadAction<"up" | "down">) => {
      state.view.homeSortDir = action.payload;
    },
    toggleHomeSortDir: (state) => {
      state.view.homeSortDir = (
        {
          up: "down",
          down: "up",
        } as const
      )[state.view.homeSortDir];
    },

    setAnalyticsSortBy: (
      state,
      action: PayloadAction<
        "name" | "hours-week" | "hours-cycle" | "hours-season"
      >,
    ) => {
      state.view.analyticsSortBy = action.payload;
    },
    setAnalyticsSortDir: (state, action: PayloadAction<"up" | "down">) => {
      state.view.analyticsSortDir = action.payload;
    },
    toggleAnalyticsSortDir: (state) => {
      state.view.analyticsSortDir = (
        {
          up: "down",
          down: "up",
        } as const
      )[state.view.analyticsSortDir];
    },
  },
});

export const {
  setAuthLastFetch,
  setAuth,
  setPassword,
  setAuthError,
  clearAuthError,
  setDataLastFetch,
  setEntries,
  setParsedEntries,
  setLabHours,
  setUsersAtLab,
  setHomeSortBy,
  setHomeSortDir,
  toggleHomeSortDir,
  setAnalyticsSortBy,
  setAnalyticsSortDir,
  toggleAnalyticsSortDir,
} = slice.actions;

export const selectAuthLastFetch = (state: RootState) =>
  state.app.auth.lastFetch;
export const selectAuth = (state: RootState) => state.app.auth.auth;
export const selectAuthFor = (
  state: RootState,
  type: "user" | "admin",
): boolean => {
  if (type === "admin") return state.app.auth.auth === "admin";
  return state.app.auth.auth === "user" || selectAuthFor(state, "admin");
};
export const selectPassword = (state: RootState) => state.app.auth.password;
export const selectAuthError = (state: RootState) => state.app.auth.authError;

export const selectDataLastFetch = (state: RootState) =>
  state.app.data.lastFetch;
export const selectEntries = (state: RootState) => state.app.data.entries;
export const selectParsedEntries = (state: RootState) =>
  state.app.data.parsedEntries;
export const selectLabHours = (state: RootState) => state.app.data.labHours;
export const selectUsersAtLab = (state: RootState) => state.app.data.usersAtLab;

export const selectHomeSortBy = (state: RootState) => state.app.view.homeSortBy;
export const selectHomeSortDir = (state: RootState) =>
  state.app.view.homeSortDir;

export const selectAnalyticsSortBy = (state: RootState) =>
  state.app.view.analyticsSortBy;
export const selectAnalyticsSortDir = (state: RootState) =>
  state.app.view.analyticsSortDir;

export default slice.reducer;
