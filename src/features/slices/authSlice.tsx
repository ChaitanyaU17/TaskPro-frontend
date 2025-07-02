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
  userId: string | null;
  email: string | null;
}

const initialState: AuthState = {
  token: Cookies.get("token") || null,
  role: (Cookies.get("role") as "Admin" | "User") || null,
  loading: false,
  error: null,
  userId: Cookies.get("userId") || null,
  email: Cookies.get("email") || null,
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
      const { token, role, userId, email } = res.data;

      // Store in cookies
      Cookies.set("token", token, { expires: 1 });
      Cookies.set("role", role, { expires: 1 });
      Cookies.set("userId", userId, { expires: 1 });
      Cookies.set("email", email, { expires: 1 });

      console.log("Logged in User ID:", userId);

      return { token, role, userId, email };
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
      Cookies.remove("userId");
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
          action: PayloadAction<{ token: string; role: "Admin" | "User"; userId: string; email: string }>
        ) => {
          state.token = action.payload.token;
          state.role = action.payload.role;
          state.loading = false;
          state.userId = action.payload.userId;
          state.email = action.payload.email;
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
