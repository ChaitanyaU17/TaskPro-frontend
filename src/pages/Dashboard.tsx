/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  CircularProgress,
  Paper,
} from "@mui/material";
import { fetchProjects, createProject } from "../features/slices/projectSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/slices/authSlice";
import type { RootState, AppDispatch } from "../features/store/store";
import { toast } from "react-toastify";

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { projects, loading } = useSelector(
    (state: RootState) => state.project
  );
  const { role } = useSelector((state: RootState) => state.auth);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleCreateProject = async () => {
    if (!name.trim()) return;
    try {
      await dispatch(createProject({ name, description })).unwrap();
      setOpen(false);
      setName("");
      setDescription("");
      toast.success("Project created successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to create project");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Your Projects
        </Typography>
        <Box display="flex" gap={2}>
          {role === "Admin" && (
            <Button variant="contained" onClick={() => setOpen(true)}>
              New Project
            </Button>
          )}
          <Button variant="outlined" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : projects.length === 0 ? (
        <Typography>No projects found.</Typography>
      ) : (
        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
          {projects.map((project) => (
            <Box
              key={project._id}
              sx={{
                p: 2,
                mb: 1,
                border: "1px solid #ddd",
                borderRadius: 2,
                bgcolor: "grey.100",
                cursor: "pointer",
                "&:hover": { backgroundColor: "#c4c9cc" },
              }}
              onClick={() => navigate(`/projects/${project._id}`)}
            >
              <Typography variant="h6" fontWeight="bold">
                {project.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {project.description || "No description"}
              </Typography>
            </Box>
          ))}
        </Paper>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            label="Project Name"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateProject} disabled={!name.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
