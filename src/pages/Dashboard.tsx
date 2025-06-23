import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button,
  Dialog, DialogTitle, DialogContent, TextField, DialogActions,
  IconButton, Tooltip, CircularProgress, Table, TableHead, TableRow,
  TableCell, TableBody, Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface Project {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // mock array
  useEffect(() => {
    setTimeout(() => {
      setProjects([
        { id: '1', title: 'Website Redesign', description: 'Revamp landing page.', createdAt: '2025-06-22' },
        { id: '2', title: 'Mobile App', description: 'Build v2.0 mobile app.', createdAt: '2025-06-22' },
        { id: '3', title: 'Marketing Campaign', description: 'Launch Q3 ads.', createdAt: '2025-06-22' },
      ]);
      setLoading(false);
    }, 1200);
  }, []);

  const handleCreateProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDescription,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProjects([...projects, newProject]);
    setOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Your Projects</Typography>
        <Button
          variant="contained"
          sx={{bgcolor: 'primary.main', color: 'white'}}
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          New Project
        </Button>
      </Box>

      {/* Loading circle */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress color="primary" size={50} />
        </Box>
      ) : (
        <Paper elevation={3} sx={{ borderRadius: '10px', overflow: 'hidden' }}>
          <Table sx={{borderRadius: '30px'}}>
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created At</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id} hover>
                  <TableCell>{project.title}</TableCell>
                  <TableCell>{project.description || 'No description'}</TableCell>
                  <TableCell>{project.createdAt}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Project Title"
            fullWidth
            margin="normal"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateProject}
            disabled={!newTitle.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
