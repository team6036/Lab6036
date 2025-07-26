import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

interface LoadingState {
  auth: {
    fetching: boolean;
  };
  data: {
    fetching: boolean;
  };
}

const initialState: LoadingState = {
  auth: {
    fetching: false,
  },
  data: {
    fetching: false,
  },
};

const slice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setAuthFetching: (state, action: PayloadAction<boolean>) => {
      state.auth.fetching = action.payload;
    },
    setDataFetching: (state, action: PayloadAction<boolean>) => {
      state.data.fetching = action.payload;
    },
  },
});

export const { setAuthFetching, setDataFetching } = slice.actions;

export const selectAuthFetching = (state: RootState) =>
  state.loading.auth.fetching;
export const selectDataFetching = (state: RootState) =>
  state.loading.data.fetching;

export default slice.reducer;
