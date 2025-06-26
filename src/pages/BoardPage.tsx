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
                    sx={{ flex: 1, p: 2, minHeight: "400px", bgcolor: "grey.100" }}
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
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography
                                fontWeight="bold"
                                sx={{ flexGrow: 1 }}
                              >
                                {task.title}
                              </Typography>
                              <Box display="flex" gap={1}>
                                <IconButton
                                  onClick={() => openTaskModal(task)}
                                  sx={{
                                    bgcolor: "transparent",
                                    "&:hover": {
                                      bgcolor: "primary.light",
                                    },
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  onClick={() => dispatch(deleteTask(task._id))}
                                  sx={{
                                    bgcolor: "transparent",
                                    "&:hover": {
                                      bgcolor: "error.light",
                                    },
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              mt={1}
                            >
                              {task.description || "No description"}
                            </Typography>
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
