// src/features/activity/activitySlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../store/store";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export interface ActivityLog {
  _id: string;
  project: string;
  user: { email: string; role: string };
  action: string;
  details?: string;
  createdAt: string;
}

interface ActivityState {
  logs: ActivityLog[];
  loading: boolean;
  error: string | null;
}

const initialState: ActivityState = {
  logs: [],
  loading: false,
  error: null,
};

export const fetchActivityLogs = createAsyncThunk(
  "activity/fetchLogs",
  async (projectId: string, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).auth.token;
    try {
      const res = await axios.get(`${baseUrl}/activity/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
        console.error("failed to fetch activity logs: ", err)
      return rejectWithValue("Failed to fetch activity logs");
    }
  }
);

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default activitySlice.reducer;
