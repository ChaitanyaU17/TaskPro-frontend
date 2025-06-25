import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../auth/authSlice';
import taskReduser from '../auth/taskSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    task: taskReduser,
  },
});

// Types for hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
