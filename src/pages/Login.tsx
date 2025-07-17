import React, { useEffect, useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import { Formik, Form, Field, type FieldInputProps } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "../features/slices/authSlice";
import type { AppDispatch, RootState } from "../features/store/store";
import { useNavigate } from "react-router-dom";
import AssignmentIcon from "@mui/icons-material/Assignment";
// import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

// const baseUrl = import.meta.env.VITE_API_BASE_URL";

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
  const authState = useSelector((state: RootState) => state.auth);
  const { token, role } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (token) {
      if (role === "Admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [token, role, navigate]);

  const handleSubmit = async (values: LoginValues) => {
    const result = await dispatch(loginThunk(values));
    if (loginThunk.fulfilled.match(result)) {
      const role = result.payload.role;
      if (role === "Admin") {
        toast.success("Login Successfull");
        navigate("/admin");
      } else {
        toast.success("Login Successfull");
        navigate("/dashboard");
      }
    } else {
      toast.error("Login failed");
      console.log(result.payload);
    }
  };

  return (
    <>
      <Box display="flex" justifyContent="flex-start" p={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/")}
        >
          <ArrowBackIosIcon fontSize="small" />
          Home
        </Button>
      </Box>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
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
                  <Field name="password">
                    {({ field }: { field: FieldInputProps<string> }) => (
                      <TextField
                        {...field}
                        type={showPassword ? "text" : "password"}
                        label="Password"
                        fullWidth
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() =>
                                    setShowPassword((prev) => !prev)
                                  }
                                  edge="end"
                                >
                                  {showPassword ? (
                                    <Visibility />
                                  ) : (
                                    <VisibilityOff />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  </Field>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isSubmitting || authState.loading}
                  fullWidth
                >
                  {authState.loading ? "Logging in..." : "Login"}
                </Button>

                {/* <Box textAlign="center" mt={2}>
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
              </Box> */}

                {authState.error && (
                  <Box mt={2} color="error.main">
                    <Typography color="error" align="center">
                      {authState.error}
                    </Typography>
                  </Box>
                )}
              </Form>
            )}
          </Formik>
        </Paper>
      </Container>
    </>
  );
};

export default LoginPage;
