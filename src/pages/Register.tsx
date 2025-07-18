import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  // MenuItem,
  // Select,
  // InputLabel,
  // FormControl,
} from "@mui/material";
import { Formik, Form, Field, type FieldInputProps } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { toast } from "react-toastify";
import { InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

interface RegisterValues {
  email: string;
  password: string;
  role: "Admin";
}

const initialValues: RegisterValues = {
  email: "",
  password: "",
  role: "Admin",
};

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "At least 6 characters").required("Required"),
});

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values: RegisterValues) => {
    try {
      const res = await axios.post(`${baseUrl}/auth/signup`, values);
      toast.success("Registration Successfull");
      console.log("Register success:", res.data);
      navigate("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data);
      } else {
        toast.error("Something went wrong");
        console.error("Unexpected error", error);
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
            <Typography variant="h4" fontWeight="bold" color="primary">
              TaskPro
            </Typography>
          </Box>

          <Typography variant="h5" gutterBottom fontWeight="bold">
            Admin Registration
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
                                onClick={() => setShowPassword((prev) => !prev)}
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
                disabled={isSubmitting}
                fullWidth
              >
                Register as Admin
              </Button>

              <Box textAlign="center" mt={2}>
                <Typography
                  variant="body2"
                  component={Link}
                  to="/login"
                  sx={{
                    textDecoration: "none",
                    color: "primary.main",
                    fontWeight: 500,
                  }}
                >
                  Already have an account? Go to Login
                </Typography>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default Register;
