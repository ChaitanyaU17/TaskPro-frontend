import React from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import AssignmentIcon from "@mui/icons-material/Assignment";

interface RegisterValues {
  email: string;
  password: string;
  role: "Admin" | "User";
}

const initialValues: RegisterValues = {
  email: "",
  password: "",
  role: "" as "Admin" | "User",
};

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "At least 6 characters").required("Required"),
  role: Yup.string()
    .oneOf(["Admin", "User"], "Select a valid role")
    .required("Role is required"),
});

const Register: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values: RegisterValues) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        values
      );
      console.log("Register success:", res.data);
      navigate("/login"); 
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data);
      } else {
        console.error("Unexpected error", error);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box textAlign="center">
          <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
            <AssignmentIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: "bold" }} color="primary">
              TaskPro
            </Typography>
          </Box>

          <Typography variant="h5" gutterBottom fontWeight="bold">
            Register
          </Typography>
        </Box>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, values, setFieldValue }) => (
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

              <Box mb={2}>
                <FormControl fullWidth>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    name="role"
                    label="Role"
                    value={values.role}
                    onChange={(e) =>
                      setFieldValue("role", e.target.value as "Admin" | "User")
                    }
                    error={touched.role && Boolean(errors.role)}
                  >
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="User">User</MenuItem>
                  </Select>
                  {touched.role && errors.role && (
                    <Typography variant="caption" color="error">
                      {errors.role}
                    </Typography>
                  )}
                </FormControl>
              </Box>

              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isSubmitting}
                fullWidth
              >
                Register
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
