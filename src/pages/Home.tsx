// src/pages/Home.tsx

import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Container,
  Stack,
  Link as MuiLink,
  TextField,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import Footer from "./Footer";
import { Link as RouterLink } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <>
    {/* navbar */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Container>
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            <Box display="flex" alignItems="center">
              <AssignmentIcon color="primary" sx={{ mr: 1 }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: 'primary.main' }}
               
              >
                TaskPro
              </Typography>
            </Box>

            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 4 }}>
              <MuiLink href="#" underline="hover" color="text.primary">
                Features
              </MuiLink>
              <MuiLink href="#" underline="hover" color="text.primary">
                Solutions
              </MuiLink>
              <MuiLink href="#" underline="hover" color="text.primary">
                Plans
              </MuiLink>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button component={RouterLink} to="/login" variant="text">
                Login
              </Button>
              <Button component={RouterLink} to="/signup" variant="contained">
                Get Started
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* headline */}
      <Box sx={{  py: 10 }}>
        <Container>
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems="center"
            spacing={6}
          >
            <Box flex={1}>
              <Typography
                variant="h3"
                sx={{ fontWeight: "bold", mb: 2 }}
                gutterBottom
              >
                Manage your tasks & collaborate with your team
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ fontSize: "1rem", mb: 3 }}
              >
                Stay on top of your work. Visualize progress. Work together in
                real time.
              </Typography>

              <Box
                component="form"
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <TextField
                  type="email"
                  placeholder="Enter your email"
                  variant="outlined"
                  size="medium"
                />
                <Button variant="contained" size="large" component={RouterLink} to="/signup">
                  Sign Up Free
                </Button>
              </Box>
            </Box>

            {/* Right side: image */}
            <Box flex={1}>
              <img
                src="https://mytodoboards.vercel.app/img/frello-home-section1.png"
                alt="Collaboration hero illustration"
                style={{
                  width: "100%",
                  maxHeight: 300,
                  objectFit: "contain",
                }}
              />
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* BELOW HERO */}
      <Box textAlign="center" sx={{ py: 8}}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
          Capture, organize, and tackle your todos from anywhere
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ fontSize: "1rem", mb: 4 }}
        >
          Escape the clutter and chaos — unleash your productivity with TaskPro.
        </Typography>
      </Box>

      <Footer />
    </>
  );
};

export default Home;
