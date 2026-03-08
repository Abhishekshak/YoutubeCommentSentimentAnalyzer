import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Box, TextField, Button, Typography, Paper, Alert, Snackbar } from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";

export default function Login() {
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState(""); // for invalid credentials or other messages
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleLogin = async (values, { setSubmitting, setFieldError }) => {
    setGeneralError(""); // reset general error
    try {
      const res = await axios.post("http://127.0.0.1:8000/auth/login", values);

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("username", res.data.username);

      setSuccess(true);
      setTimeout(() => navigate("/analyze"), 1000);
    } catch (err) {
      const msg = err.response?.data?.detail || "Login failed";

      // If the error is specific to a field, map it there
      if (msg.toLowerCase().includes("email")) {
        setFieldError("email", msg);
      } else if (msg.toLowerCase().includes("password")) {
        setFieldError("password", msg);
      } else {
        // Otherwise, show it as general error (like Invalid credentials)
        setGeneralError(msg);
      }
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#111827",
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          borderRadius: 2,
          backgroundColor: "#1f2937",
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, color: "#fff", textAlign: "center" }}>
          Login
        </Typography>

        {generalError && (
          <Alert severity="error" sx={{ mb: 2, backgroundColor: "#f87171", color: "#fff" }}>
            {generalError}
          </Alert>
        )}

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          {({ errors, touched, getFieldProps, isSubmitting }) => (
            <Form>
              <TextField
                label="Email"
                type="email"
                {...getFieldProps("email")}
                fullWidth
                variant="filled"
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                sx={{
                  mb: 2,
                  "& .MuiFilledInput-root": { backgroundColor: "#111827", color: "#fff" },
                  "& .MuiInputLabel-root": { color: "#d1d5db" },
                  "& .MuiFilledInput-underline:before": { borderBottomColor: "#374151" },
                  "& .MuiFilledInput-underline:after": { borderBottomColor: "#FF0000" },
                }}
              />

              <TextField
                label="Password"
                type="password"
                {...getFieldProps("password")}
                fullWidth
                variant="filled"
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                sx={{
                  mb: 3,
                  "& .MuiFilledInput-root": { backgroundColor: "#111827", color: "#fff" },
                  "& .MuiInputLabel-root": { color: "#d1d5db" },
                  "& .MuiFilledInput-underline:before": { borderBottomColor: "#374151" },
                  "& .MuiFilledInput-underline:after": { borderBottomColor: "#FF0000" },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitting}
                sx={{
                  backgroundColor: "#FF0000",
                  "&:hover": { backgroundColor: "#e60000" },
                  mb: 2,
                }}
              >
                Login
              </Button>
            </Form>
          )}
        </Formik>

        <Typography variant="body2" sx={{ color: "#d1d5db", textAlign: "center" }}>
          Don’t have an account?{" "}
          <Link to="/register" style={{ color: "#FF0000", textDecoration: "none" }}>
            Register
          </Link>
        </Typography>
      </Paper>

      <Snackbar
        open={success}
        autoHideDuration={1500}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message="Logged in successfully!"
      />
    </Box>
  );
}
