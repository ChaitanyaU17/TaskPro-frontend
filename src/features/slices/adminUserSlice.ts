import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { RootState } from '../store/store';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export interface AdminUser {
  _id: string;
  email: string;
  role: string;
}

interface AdminUserState {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminUserState = {
  users: [],
  loading: false,
  error: null,
};

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (_, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).auth.token;
    try {
      const res = await axios.get(`${baseUrl}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      console.error("Error while fetching users: ", err)
      return rejectWithValue('Failed to fetch users');
    }
  }
);

export const deleteUserById = createAsyncThunk(
  'admin/deleteUser',
  async (userId: string, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).auth.token;
    try {
      await axios.delete(`${baseUrl}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return userId;
    } catch (err) {
      console.error('Error deleting user', err);
      return rejectWithValue('Failed to delete user');
    }
  }
);

const adminUserSlice = createSlice({
  name: 'adminUsers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteUserById.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      });
  },
});

export default adminUserSlice.reducer;
