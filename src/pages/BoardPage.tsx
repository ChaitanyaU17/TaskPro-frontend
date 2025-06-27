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
  addComment,
} from "../features/auth/taskSlice";
import type { Task } from "../features/auth/taskSlice";
import { updateTaskComments } from "../features/auth/taskSlice";

const statuses: Task["status"][] = ["To Do", "In Progress", "Done"];

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

  // new state
  const [commentModalTask, setCommentModalTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState("");

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
    if (projectId) dispatch(fetchTasks(projectId));
  }, [dispatch, projectId]);

  const handleCreate = () => {
    if (!title.trim()) return;
    dispatch(createTask({ title, description, status, project: projectId }));
    setOpen(false);
    setTitle("");
    setDescription("");
    setStatus("To Do");
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
        <CircularProgress />
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
                              bgcolor: "#c4c9cc",
                              borderRadius: 2,
                              boxShadow: 1,
                              position: "relative",
                            }}
                          >
                            <Box display="flex" justifyContent="space-between">
                              <Typography fontWeight="bold">
                                {task.title}
                              </Typography>
                              <Box display="flex" gap={1}>
                                <Button
                                  size="small"
                                  onClick={() => openTaskModal(task)}
                                  sx={{
                                    minWidth: "unset",
                                    padding: "6px",
                                    "&:hover": { bgcolor: "#e0f7fa" },
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </Button>
                                <Button
                                  size="small"
                                  color="error"
                                  onClick={() => dispatch(deleteTask(task._id))}
                                  sx={{
                                    minWidth: "unset",
                                    padding: "6px",
                                    "&:hover": { bgcolor: "#ffebee" },
                                  }}
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
                                    padding: "6px",
                                    color: "gray",
                                    "&:hover": { bgcolor: "#e0f7fa" },
                                  }}
                                >
                                  <ChatBubbleOutlineIcon fontSize="small" />
                                </Button>
                              </Box>
                            </Box>

                            <Typography variant="body2" color="text.secondary">
                              {task.description || "No description"}
                            </Typography>

                            {commentModalTask?._id === task._id && (
                              <Box mt={2}>
                                <Box mb={1}>
                                  {task.comments?.map((c, idx) => (
                                    <Typography
                                      key={idx}
                                      variant="body2"
                                      sx={{
                                        mb: 0.5,
                                        pl: 1,
                                        borderLeft: "2px solid #ccc",
                                      }}
                                    >
                                      🗨️ {c.text}
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
