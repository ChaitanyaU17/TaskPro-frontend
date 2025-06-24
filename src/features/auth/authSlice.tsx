import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

interface AuthState {
  token: string | null;
  role: 'Admin' | 'User' | null;
}

// ✅ Read from cookies instead of localStorage:
const initialState: AuthState = {
  token: Cookies.get('token') || null,
  role: (Cookies.get('role') as 'Admin' | 'User' | null) || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ token: string; role: 'Admin' | 'User' }>
    ) => {
      state.token = action.payload.token;
      state.role = action.payload.role;

      // ✅ Store in cookies:
      Cookies.set('token', action.payload.token, { expires: 1 }); // expires in 1 day
      Cookies.set('role', action.payload.role, { expires: 1 });
    },
    logout: (state) => {
      state.token = null;
      state.role = null;

      // ✅ Remove cookies:
      Cookies.remove('token');
      Cookies.remove('role');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
