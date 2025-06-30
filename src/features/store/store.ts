import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../auth/authSlice';
import taskReduser from '../auth/taskSlice';
import projectReducer from '../auth/projectSlice';
import commentReducer from '../auth/commentSlice';
import AdminReducer from '../auth/adminUserSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    task: taskReduser,
    project: projectReducer,
    comments: commentReducer,
    adminUser: AdminReducer,
  },
});

// Types for hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
