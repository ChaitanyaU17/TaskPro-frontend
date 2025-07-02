import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import taskReduser from '../slices/taskSlice';
import projectReducer from '../slices/projectSlice';
import commentReducer from '../slices/commentSlice';
import AdminReducer from '../slices/adminUserSlice';

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
