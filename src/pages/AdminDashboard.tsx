import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TextField,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllUsers,
  deleteUserById,
} from "../features/slices/adminUserSlice";
import type { RootState, AppDispatch } from "../features/store/store";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LogoutIcon from "@mui/icons-material/Logout";
import { logout } from "../features/slices/authSlice";

const baseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error } = useSelector(
    (state: RootState) => state.adminUser
  );
  const token = useSelector((state: RootState) => state.auth.token);
  const navigate = useNavigate();

  const [stats, setStats] = useState<{
    users: number;
    projects: number;
    tasks: number;
  } | null>(null);

  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");

  const handleCreateUser = async () => {
    try {
      await axios.post(
        `${baseUrl}/auth/signup`,
        {
          email: newUserEmail,
          password: newUserPassword,
          role: "User",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("User created");
      dispatch(fetchAllUsers());
      fetchStats();
      setNewUserEmail("");
      setNewUserPassword("");
    } catch (err) {
      toast.error("Failed to create user");
      console.log(err);
    }
  };

  useEffect(() => {
    dispatch(fetchAllUsers());
    fetchStats();
  }, [dispatch]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${baseUrl}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      toast.error("Failed to fetch stats");
      console.error("Stats fetch error:", err);
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      const result = await dispatch(deleteUserById(userId));
      if (deleteUserById.fulfilled.match(result)) {
        fetchStats();
        toast.success("User deleted successfully");
      } else {
        toast.error("Failed to delete user");
      }
    }
  };
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        mb={1}
        p={3}
        px={8}
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
          gutterBottom
        >
          Admin Panel
        </Typography>

        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/dashboard")}
            sx={{ mb: 2 }}
          >
            Create Project
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ borderRadius: 2, mb: 2 }}
          >
            Logout
          </Button>
        </Box>
      </Box>
      <Box maxWidth="md" mx="auto" mt={1} px={2}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Platform Statistics
          </Typography>
          {stats ? (
            <Box pl={2}>
              <Box display="flex" alignItems="center" mb={1}>
                <Box
                  sx={{
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    mr: 1.5,
                  }}
                />
                <Typography>Users: {stats.users}</Typography>
              </Box>

              <Box display="flex" alignItems="center" mb={1}>
                <Box
                  sx={{
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    bgcolor: "#d9a714",
                    mr: 1.5,
                  }}
                />
                <Typography>Projects: {stats.projects}</Typography>
              </Box>

              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    bgcolor: "#3ad422",
                    mr: 1.5,
                  }}
                />
                <Typography>Tasks: {stats.tasks}</Typography>
              </Box>
            </Box>
          ) : (
            <Typography>Loading stats...</Typography>
          )}
        </Paper>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Manage Users
          </Typography>

          <Box mb={2}>
            <Typography variant="subtitle1" gutterBottom>
              Create New User
            </Typography>
            <Box display="flex" gap={1} mb={1}>
              <TextField
                size="small"
                label="Email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
              <TextField
                size="small"
                type="password"
                label="Password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
              />
              {/* Hidden input, role is fixed to "User" */}
              <input type="hidden" value="User" />

              <Button variant="contained" onClick={handleCreateUser}>
                Create
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box textAlign="center" py={3}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users
                    .filter((u) => u.role === "User")
                    .map((u) => (
                      <TableRow key={u._id}>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.role}</TableCell>

                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDelete(u._id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </>
  );
};

export default AdminDashboard;
