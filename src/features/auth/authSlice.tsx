// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

export interface AuthState {
  token: string | null;
  role: "Admin" | "User" | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: Cookies.get("token") || null,
  role: (Cookies.get("role") as "Admin" | "User") || null,
  loading: false,
  error: null,
};

// LOGIN THUNK
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (values: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        values
      );
      const { token, role } = res.data;

      // Store in cookies
      Cookies.set("token", token, { expires: 1 });
      Cookies.set("role", role, { expires: 1 });

      return { token, role };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || "Login failed");
      }
      return rejectWithValue("Login failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.role = null;
      Cookies.remove("token");
      Cookies.remove("role");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginThunk.fulfilled,
        (
          state,
          action: PayloadAction<{ token: string; role: "Admin" | "User" }>
        ) => {
          state.token = action.payload.token;
          state.role = action.payload.role;
          state.loading = false;
        }
      )
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
