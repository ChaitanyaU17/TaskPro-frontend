// src/features/comments/commentSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../store/store";

const baseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

interface Comment {
  _id: string;
  text: string;
  user: {
    email: string;
    role: string;
  };
  createdAt: string;
}

interface CommentState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
}

const initialState: CommentState = {
  comments: [],
  loading: false,
  error: null,
};

// Async thunk for adding a comment
export const addComment = createAsyncThunk(
  "comments/addComment",
  async (
    { taskId, text }: { taskId: string; text: string },
    { getState, rejectWithValue }
  ) => {
    const token = (getState() as RootState).auth.token;
    try {
      const res = await axios.post(
        `${baseUrl}/comments/${taskId}`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data; // new comment object
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add comment"
      );
    }
  }
);

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default commentSlice.reducer;
