import React from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../features/store/store";
import { loginSuccess } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { Link } from "react-router-dom";

// ------------------------------
// TypeScript types
interface LoginValues {
  email: string;
  password: string;
}

const initialValues: LoginValues = {
  email: "",
  password: "",
};

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "At least 6 characters").required("Required"),
});

// ------------------------------
// Component
const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleSubmit = async (values: LoginValues) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        values
      );

      // Assuming your backend returns { token, role }
      const { token, role } = res.data;

      // ✅ store in Redux + localStorage via slice action
      dispatch(loginSuccess({ token, role }));

      // ✅ redirect to dashboard or home
      navigate("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Login failed:", error.response?.data);
        alert(error.response?.data.message || "Login failed");
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box textAlign="center">
          {/* Logo + Text in one line */}
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={1}
          >
            <AssignmentIcon color="primary" sx={{ mr: 1 }} />
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold" }}
              color="primary"
            >
              TaskPro
            </Typography>
          </Box>

          {/* Subheading */}
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Login
          </Typography>
        </Box>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <Box mb={2}>
                <Field
                  as={TextField}
                  name="email"
                  label="Email"
                  fullWidth
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
              </Box>
              <Box mb={2}>
                <Field
                  as={TextField}
                  name="password"
                  type="password"
                  label="Password"
                  fullWidth
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                />
              </Box>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isSubmitting}
                fullWidth
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>

              <Box textAlign="center" mt={2}>
                <Typography
                  variant="body2"
                  component={Link}
                  to="/register"
                  sx={{
                    textDecoration: "none",
                    color: "primary.main",
                    fontWeight: 500,
                  }}
                >
                  Don’t have an account? Register here
                </Typography>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default LoginPage;
