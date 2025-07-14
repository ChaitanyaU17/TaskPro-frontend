import React from "react";
import {
  Box,
  Typography,
  Grid,
  Divider,
  IconButton,
  Stack,
} from "@mui/material";
import {
  Facebook,
  LinkedIn,
  Twitter,
  YouTube,
  Instagram,
  Language,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import AssignmentIcon from "@mui/icons-material/Assignment";

const Footer: React.FC = () => {
  return (
    <Box sx={{ bgcolor: "primary.dark", color: "#fff", px: 4, pt: 6, pb: 3 }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 2}}>
          <Box sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center">
              {/* Logo */}
              <AssignmentIcon sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                TaskPro
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="white" fontWeight="bold">
            <Link
              to="/login"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              Log In
            </Link>
          </Typography>
        </Grid>

        <Grid size={{ xs: 6, md: 2}}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            About TaskPro
          </Typography>
          <Typography variant="body2" width={300}>
            What’s behind the boards.
          </Typography>
        </Grid>

        <Grid size={{ xs: 6, md: 2}}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Apps
          </Typography>
          <Typography variant="body2" width={300}>
            Download the TaskPro App for your Desktop or Mobile devices.
          </Typography>
        </Grid>

        {/* Contact */}
        <Grid size={{ xs: 6, md: 2}}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Contact us
          </Typography>
          <Typography variant="body2" width={300}>
            Need anything? Get in touch and we can help.
          </Typography>
        </Grid>
      </Grid>

      {/* Divider */}
      <Divider sx={{ my: 4, bgcolor: "#fff", opacity: 0.8 }} />

      {/* Bottom Row */}
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid size={{ xs: 6, md: 2}}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
          >
            <Language fontSize="small" />
            <Typography variant="body2">English</Typography>
            {/* <ExpandMore fontSize="small" /> */}
            <Typography variant="body2" sx={{ ml: 2 }}>
              Privacy Policy
            </Typography>
            <Typography variant="body2">Terms</Typography>
            <Typography variant="body2">Copyright © 2025 TaskPro</Typography>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: "auto" }} >
          <Stack
            direction="row"
            spacing={2}
            justifyContent="flex-end"
            mt={{ xs: 2, md: 0 }}
          >
            <IconButton
              color="inherit"
              component="a"
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener"
            >
              <Instagram />
            </IconButton>

            <IconButton
              color="inherit"
              component="a"
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener"
            >
              <Facebook />
            </IconButton>

            <IconButton
              color="inherit"
              component="a"
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener"
            >
              <LinkedIn />
            </IconButton>

            <IconButton
              color="inherit"
              component="a"
              href="https://www.twitter.com"
              target="_blank"
              rel="noopener"
            >
              <Twitter />
            </IconButton>

            <IconButton
              color="inherit"
              component="a"
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener"
            >
              <YouTube />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Footer;
