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
import {toast} from 'react-toastify';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

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

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleSubmit = async (values: LoginValues) => {
    try {
      const res = await axios.post(
        `${baseUrl}/auth/login`,
        values
      );
      toast.success('Login Successfull');
      console.log("Login response:", res.data);
      const { token, role } = res.data;
      dispatch(loginSuccess({ token, role }));

      navigate("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Login failed:", error.response?.data);
        toast.error(error.response?.data.message || "Login failed");
      } else {
        toast.error('Something went wrong');
        console.error("Unexpected error:", error);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box textAlign="center">
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
                  to="/signup"
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
