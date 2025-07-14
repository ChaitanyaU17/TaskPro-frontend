import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../store/store";
import type { AuthState } from "./authSlice";

const baseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "To Do" | "In Progress" | "Done";
  project: string;
  comments?: { text: string; user?: { email: string; role: string } }[];
  createdAt: string;
  assignee?: string;
  assigneeEmail?: string;
  deadline?: string;
  priority?: "Low" | "Medium" | "High";
  tags?: string[];
  creator: string;
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

export const fetchTasks = createAsyncThunk(
  "task/fetchTasks",
  async (
    {
      projectId,
      title,
      tag,
      assignee,
      priority,
    }: {
      projectId: string;
      title?: string;
      tag?: string;
      assignee?: string;
      priority?: string;
    },
    { getState, rejectWithValue }
  ) => {
    const token = (getState() as RootState).auth.token;

    const params = new URLSearchParams();
    params.append("project", projectId);
    if (title) params.append("title", title);
    if (tag) params.append("tag", tag);
    if (assignee) params.append("assignee", assignee);
    if (priority) params.append("priority", priority);
    try {
      const res = await axios.get(`${baseUrl}/task?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log("Fetched tasks:", res.data);
      return res.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(
          err.response?.data?.message || "Failed to fetch tasks"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

type NewTaskData = {
  title: string;
  description?: string;
  status: string;
  project: string;
  deadline?: string;
  priority?: "Low" | "Medium" | "High";
  tags?: string[];
  assignee?: string;
};

// create task
export const createTask = createAsyncThunk(
  "task/createTask",
  async (
    {
      title,
      description,
      status,
      project,
      assignee,
      deadline,
      priority,
      tags,
    }: {
      title: string;
      description?: string;
      status: string;
      project: string;
      assignee?: string;
      deadline?: string;
      priority?: "Low" | "Medium" | "High";
      tags?: string;
    },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    const role = state.auth.role;

    const taskData: NewTaskData = {
      title,
      description,
      status,
      project,
      deadline,
      priority,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
    };

    if (role === "Admin" && assignee?.trim()) {
      taskData.assignee = assignee;
    }

    try {
      const res = await axios.post(`${baseUrl}/task`, taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(
          err.response?.data?.message || "Failed to create task"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

// update a task
export const editTask = createAsyncThunk(
  "task/editTask",
  async (
    { id, updates }: { id: string; updates: Partial<Task> },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.token;
      const res = await axios.put(`${baseUrl}/task/${id}`, updates, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(
          err.response?.data?.message || "Failed to edit tasks"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

export const deleteTask = createAsyncThunk(
  "task/deleteTask",
  async (id: string, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).auth.token;
    try {
      await axios.delete(`${baseUrl}/task/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(
          err.response?.data?.message || "Failed to delete tasks"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

// fetch comments
export const fetchComments = createAsyncThunk(
  "task/fetchComments",
  async (taskId: string, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).auth.token;
    try {
      const res = await axios.get(`${baseUrl}/comments/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { taskId, comments: res.data };
    } catch (err) {
      console.error("Error fetching comments:", err);
      return rejectWithValue("Failed to fetch comments");
    }
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    moveTaskStatus: (
      state,
      action: PayloadAction<{ id: string; newStatus: Task["status"] }>
    ) => {
      const task = state.tasks.find((t) => t._id === action.payload.id);
      if (task) task.status = action.payload.newStatus;
    },
    updateTaskComments: (
      state,
      action: PayloadAction<{ taskId: string; comment: { text: string } }>
    ) => {
      const task = state.tasks.find((t) => t._id === action.payload.taskId);
      if (task) {
        if (!task.comments) task.comments = [];
        task.comments.push(action.payload.comment);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.tasks = action.payload;
        state.loading = false;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.tasks.unshift(action.payload);
      })

      .addCase(editTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.loading = false;
        const updatedTask = action.payload;
        const index = state.tasks.findIndex((t) => t._id === updatedTask._id);

        if (index !== -1) {
          state.tasks[index] = {
            ...state.tasks[index],
            ...updatedTask,
            comments: state.tasks[index].comments || [], 
            assigneeEmail:
              updatedTask.assigneeEmail || state.tasks[index].assigneeEmail, // 
          };
        }
      })

      .addCase(editTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
      });
  },
});

export const { moveTaskStatus, updateTaskComments } = taskSlice.actions;

export default taskSlice.reducer;
