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
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

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
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
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
          Create Projects
        </Typography>
        <Box display="flex" gap={2}>
          {role === "Admin" && (
            <Button
              variant="contained"
              onClick={() => setOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              New Project
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ borderRadius: 2 }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Project Cards */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : projects.length === 0 ? (
        <Typography color="text.secondary">
          No projects found. Start by creating one.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project._id}>
              <Card
                elevation={3}
                sx={{
                  transition: "0.3s",
                  borderRadius: 3,
                  "&:hover": { boxShadow: 4, transform: "translateY(-4px)", background:
                    "linear-gradient(135deg,rgb(226, 242, 250) 10%,rgb(238, 231, 248) 40%,rgb(254, 248, 248) 100%)",
                  backgroundRepeat: "no-repeat",
                  backgroundAttachment: "fixed", },
                  cursor: "pointer",
                  
                }}
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.description || "No description available."}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Box flexGrow={1} />
                  <Tooltip title="Open project">
                    <IconButton sx={{ color: "primary.main" }}>
                      <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Project Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create a New Project</DialogTitle>
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
          <Button
            variant="contained"
            onClick={handleCreateProject}
            disabled={!name.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
