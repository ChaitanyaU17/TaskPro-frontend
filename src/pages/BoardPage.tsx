/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import CommentIcon from "@mui/icons-material/Comment";
import TurnedInNotIcon from "@mui/icons-material/TurnedInNot";
import { useDispatch, useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { AppDispatch, RootState } from "../features/store/store";
import {
  fetchTasks,
  editTask,
  createTask,
  deleteTask,
  moveTaskStatus,
} from "../features/slices/taskSlice.tsx";
import type { Task } from "../features/slices/taskSlice.tsx";
import { updateTaskComments } from "../features/slices/taskSlice.tsx";
import { addComment } from "../features/slices/commentSlice.tsx";
import OnlineUsers from "./OnlineUsers";
import socket from "../socket.ts";
import ActivityLog from "./ActivityLog.tsx";
import { fetchActivityLogs } from "../features/slices/activitySlice.tsx";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import { Collapse } from "@mui/material";

const statuses: Task["status"][] = ["To Do", "In Progress", "Done"];

const BoardPage: React.FC = () => {
  const { id } = useParams();
  const projectId = id as string;
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading } = useSelector((state: RootState) => state.task);
  const userId = useSelector((state: RootState) => state.auth.userId);
  const currentUserEmail = useSelector((state: RootState) => state.auth.email);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Task["status"]>("To Do");

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<Task["status"]>("To Do");

  // comment state
  const [commentModalTask, setCommentModalTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState("");

  const [assignee, setAssignee] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [tags, setTags] = useState("");
  const [logOpen, setLogOpen] = useState(false);
  const role = useSelector((state: RootState) => state.auth.role);

  const handleAddComment = async () => {
    if (commentModalTask && newComment.trim()) {
      const result = await dispatch(
        addComment({ taskId: commentModalTask._id, text: newComment })
      );
      if (addComment.fulfilled.match(result)) {
        const newCmt = result.payload;

        setCommentModalTask((prev) =>
          prev
            ? {
                ...prev,
                comments: [...(prev.comments || []), newCmt],
              }
            : null
        );

        dispatch(
          updateTaskComments({ taskId: commentModalTask._id, comment: newCmt })
        );

        dispatch(fetchActivityLogs(projectId)); // re-fetch logs

        setNewComment("");
      }
    }
  };

  useEffect(() => {
    socket.on("activity-logged", () => {
      dispatch(fetchActivityLogs(projectId));
    });
    return () => {
      socket.off("activity-logged");
    };
  }, [projectId, dispatch]);

  useEffect(() => {
    socket.on("commentAdded", (comment) => {
      dispatch({
        type: "task/updateTaskComments",
        payload: {
          taskId: comment.task,
          comment: { text: comment.text },
        },
      });
    });

    return () => {
      socket.off("commentAdded");
    };
  }, [dispatch]);

  useEffect(() => {
    if (projectId) dispatch(fetchTasks(projectId));
  }, [dispatch, projectId]);

  const handleCreate = () => {
    if (!title.trim()) return;
    dispatch(
      createTask({
        title,
        description,
        status,
        project: projectId,
        assignee,
        deadline,
        priority,
        tags,
      })
    );
    setOpen(false);
    setTitle("");
    setDescription("");
    setStatus("To Do");
    setAssignee("");
    setDeadline("");
    setPriority("Medium");
    setTags("");
  };

  const openTaskModal = (task: Task) => {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditStatus(task.status);
  };

  const handleEditSave = () => {
    if (selectedTask) {
      dispatch(
        editTask({
          id: selectedTask._id,
          updates: {
            title: editTitle,
            description: editDescription,
            status: editStatus,
          },
        })
      );
      setSelectedTask(null);
    }
  };

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const draggedTask = tasks.find((task) => task._id === draggableId);
    if (!draggedTask || draggedTask.status === destination.droppableId) return;

    dispatch(
      moveTaskStatus({
        id: draggedTask._id,
        newStatus: destination.droppableId as Task["status"],
      })
    );

    dispatch(
      editTask({
        id: draggedTask._id,
        updates: { status: destination.droppableId as Task["status"] },
      })
    );
  };

  const groupedTasks = statuses.reduce((acc, status) => {
    acc[status] = tasks.filter(
      (task) => task.status === status && task.project === projectId
    );
    return acc;
  }, {} as Record<Task["status"], Task[]>);

  return (
    <Box p={4}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        mb={4}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          fontSize="25px"
          sx={{
            background:
              "linear-gradient(135deg, rgb(74, 161, 201) 10%, rgb(128, 74, 194) 40%, rgb(192, 112, 112) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Project Board
        </Typography>

        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpen(true)}
          >
            New Task
          </Button>

          <OnlineUsers />

          {role === "Admin" && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setLogOpen(true)}
            >
              View Activity Logs
            </Button>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box display="flex" gap={2}>
            {statuses.map((status) => (
              <Droppable droppableId={status} key={status}>
                {(provided) => (
                  <Paper
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      flex: 1,
                      p: 2,
                      minHeight: "400px",
                      background:
                        "linear-gradient(135deg,rgb(215, 237, 247) 10%,rgb(235, 221, 252) 40%,rgb(254, 248, 248) 100%)",
                      backgroundRepeat: "no-repeat",
                      backgroundAttachment: "fixed",
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      {status}
                    </Typography>

                    {groupedTasks[status]?.map((task, index) => (
                      <Draggable
                        draggableId={task._id}
                        index={index}
                        key={task._id}
                      >
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              p: 2,
                              mb: 2,
                              bgcolor: "#fff",
                              borderRadius: 1,
                              boxShadow: 1,
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                            }}
                          >
                            {/* Task: Title */}
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography fontWeight="bold">
                                {task.title}
                              </Typography>
                              <Box display="flex" gap={1}>
                                {(role === "Admin" ||
                                  task.creator === userId) && (
                                  <Button
                                    size="small"
                                    onClick={() => openTaskModal(task)}
                                    sx={{ minWidth: "unset", p: "4px" }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </Button>
                                )}

                                {role === "Admin" && (
                                  <Button
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                      dispatch(deleteTask(task._id))
                                    }
                                    sx={{ minWidth: "unset", p: "4px" }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </Button>
                                )}

                                <Button
                                  size="small"
                                  onClick={() =>
                                    setCommentModalTask(
                                      commentModalTask?._id === task._id
                                        ? null
                                        : task
                                    )
                                  }
                                  sx={{
                                    minWidth: "unset",
                                    p: "4px",
                                    color: "gray",
                                  }}
                                >
                                  <ChatBubbleOutlineIcon fontSize="small" />
                                  <Typography
                                    variant="caption"
                                    fontSize={12}
                                    p={0.5}
                                  >
                                    {task.comments?.length || ""}
                                  </Typography>
                                </Button>
                              </Box>
                            </Box>

                            {/* Description */}
                            <Typography variant="body2" color="text.secondary">
                              {task.description || "No description"}
                            </Typography>

                            {/* Assignee Email */}
                            <Box display="flex" flexWrap="wrap" gap={0.5}>
                              {task.assigneeEmail ? (
                                <Box
                                  display="flex"
                                  gap={0.5}
                                  alignItems="center"
                                >
                                  <PersonIcon fontSize="inherit" />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {task.assigneeEmail}
                                  </Typography>
                                </Box>
                              ) : null}

                              {/* Deadline */}

                              {task.deadline && (
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={0.5}
                                >
                                  <AccessTimeIcon
                                    fontSize="inherit"
                                    sx={{
                                      color: dayjs(task.deadline).isBefore(
                                        dayjs(),
                                        "day"
                                      )
                                        ? "error.main"
                                        : "text.secondary",
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    color={
                                      task.deadline &&
                                      dayjs(task.deadline).isBefore(
                                        dayjs(),
                                        "day"
                                      )
                                        ? "error"
                                        : "textSecondary"
                                    }
                                  >
                                    {new Date(task.deadline).toLocaleDateString(
                                      "en-IN",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      }
                                    )}
                                  </Typography>
                                </Box>
                              )}

                              {/* Priority */}
                              {task.priority && (
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={0.5}
                                >
                                  <SignalCellularAltIcon fontSize="inherit" />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Priority: {task.priority}
                                  </Typography>
                                </Box>
                              )}
                            </Box>

                            {/* Tags */}
                            {task.tags && task.tags.length > 0 && (
                              <Box display="flex" gap={0.5} flexWrap="wrap">
                                {task.tags.map((tag, i) => (
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    key={i}
                                    px={1}
                                    py={0.25}
                                    bgcolor="grey.100"
                                    borderRadius="8px"
                                  >
                                    <TurnedInNotIcon fontSize="inherit" />
                                    <Typography variant="caption">
                                      {tag}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}

                            {/* Comments */}
                            <Collapse in={commentModalTask?._id === task._id}>
                              <Box mt={1}>
                                <Box mb={1}>
                                  {task.comments?.length === 0 ? (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      <i>no comments</i>
                                    </Typography>
                                  ) : (
                                    task.comments?.map((c, idx) => (
                                      <Box
                                        key={idx}
                                        display="flex"
                                        gap={0.5}
                                        alignItems="center"
                                      >
                                        <CommentIcon fontSize="inherit" />
                                        <Typography variant="body2">
                                          {c.text}
                                        </Typography>
                                      </Box>
                                    ))
                                  )}
                                </Box>

                                {/* Show input only if user is Admin and User should only comment if they are assignee*/}
                                {(role === "Admin" ||
                                  task.assigneeEmail === currentUserEmail) && (
                                  <>
                                    <TextField
                                      size="small"
                                      placeholder="Add a comment..."
                                      fullWidth
                                      value={newComment}
                                      onChange={(e) =>
                                        setNewComment(e.target.value)
                                      }
                                    />
                                    <Box
                                      mt={1}
                                      display="flex"
                                      justifyContent="flex-end"
                                    >
                                      <Button
                                        variant="contained"
                                        size="small"
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim()}
                                      >
                                        Add
                                      </Button>
                                    </Box>
                                  </>
                                )}
                              </Box>
                            </Collapse>
                          </Box>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}
                  </Paper>
                )}
              </Droppable>
            ))}
          </Box>
        </DragDropContext>
      )}

      {/* Create Task Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            label="Status"
            select
            fullWidth
            margin="normal"
            value={status}
            onChange={(e) => setStatus(e.target.value as Task["status"])}
          >
            {statuses.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Assignee Email"
            fullWidth
            margin="normal"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          />

          <TextField
            label="Deadline"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          <TextField
            label="Priority"
            select
            fullWidth
            margin="normal"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Task["priority"])}
          >
            {["Low", "Medium", "High"].map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Tags (comma separated)"
            fullWidth
            margin="normal"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!title.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
          <TextField
            label="Status"
            select
            fullWidth
            margin="normal"
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value as Task["status"])}
          >
            {statuses.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTask(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {role === "Admin" && (
        <Dialog
          open={logOpen}
          onClose={() => setLogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{
              flex: 1,
              background:
                "linear-gradient(135deg,rgb(215, 237, 247) 20%,rgb(235, 221, 252) 40%,rgb(254, 248, 248) 100%)",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "fixed",
            }}>
            Activity Logs
            <IconButton
              aria-label="close"
              onClick={() => setLogOpen(false)}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent
            dividers
            sx={{
              flex: 1,
              minHeight: "400px",
              background:
                "linear-gradient(135deg,rgb(215, 237, 247) 20%,rgb(235, 221, 252) 40%,rgb(254, 248, 248) 100%)",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "fixed",
            }}
          >
            <ActivityLog projectId={projectId} />
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default BoardPage;
