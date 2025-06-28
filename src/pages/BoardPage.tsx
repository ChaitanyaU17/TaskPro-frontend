import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useDispatch, useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { AppDispatch, RootState } from "../features/store/store";
import {
  fetchTasks,
  editTask,
  createTask,
  deleteTask,
  moveTaskStatus,
} from "../features/auth/taskSlice";
import type { Task } from "../features/auth/taskSlice";
import { updateTaskComments } from "../features/auth/taskSlice";
import { addComment } from "../features/auth/commentSlice";

const statuses: Task["status"][] = ["To Do", "In Progress", "Done"];

const socket = io("http://localhost:5000");

const BoardPage: React.FC = () => {
  const { id } = useParams();
  const projectId = id as string;
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading } = useSelector((state: RootState) => state.task);

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

        setNewComment("");
      }
    }
  };

  useEffect(() => {
    socket.on("commentAdded", (comment) => {
      // Check if the comment belongs to a task on this board
      dispatch({
        type: "task/updateTaskComments",
        payload: {
          taskId: comment.task,
          comment: { text: comment.text }, // You can include email if needed
        },
      });
    });

    return () => {
      socket.off("commentAdded");
    };
  }, []);

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
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Project Board
      </Typography>

      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        + New Task
      </Button>

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
                      bgcolor: "grey.100",
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
                              bgcolor: "#f5f5f5",
                              borderRadius: 2,
                              boxShadow: 1,
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                            }}
                          >
                            {/* Header: Title + Buttons */}
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography fontWeight="bold">
                                {task.title}
                              </Typography>
                              <Box display="flex" gap={1}>
                                <Button
                                  size="small"
                                  onClick={() => openTaskModal(task)}
                                  sx={{ minWidth: "unset", p: "4px" }}
                                >
                                  <EditIcon fontSize="small" />
                                </Button>
                                <Button
                                  size="small"
                                  color="error"
                                  onClick={() => dispatch(deleteTask(task._id))}
                                  sx={{ minWidth: "unset", p: "4px" }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </Button>
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
                                </Button>
                              </Box>
                            </Box>

                            {/* Description */}
                            <Typography variant="body2" color="text.secondary">
                              {task.description || "No description"}
                            </Typography>

                            {/* Metadata Section */}
                            <Box display="flex" flexWrap="wrap" gap={1}>
                              {task.assigneeEmail && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  👤 {task.assigneeEmail}
                                </Typography>
                              )}
                              {task.deadline && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  📅{" "}
                                  {new Date(task.deadline).toLocaleDateString(
                                    "en-IN",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </Typography>
                              )}

                              {task.priority && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  ⚡ Priority: {task.priority}
                                </Typography>
                              )}
                            </Box>

                            {/* Tags */}
                            {task.tags && task.tags.length > 0 && (
                              <Box display="flex" gap={0.5} flexWrap="wrap">
                                {task.tags.map((tag, i) => (
                                  <Box
                                    key={i}
                                    px={1}
                                    py={0.25}
                                    bgcolor="#e0e0e0"
                                    borderRadius="8px"
                                  >
                                    <Typography variant="caption">
                                      #{tag}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}

                            {/* Comments (if open) */}
                            {commentModalTask?._id === task._id && (
                              <Box mt={1}>
                                <Box mb={1}>
                                  {task.comments?.map((c, idx) => (
                                    <Typography key={idx} variant="body2">
                                      🗨️ <strong>{c.user?.email}</strong>:{" "}
                                      {c.text}
                                    </Typography>
                                  ))}
                                </Box>

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
                              </Box>
                            )}
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
    </Box>
  );
};

export default BoardPage;
