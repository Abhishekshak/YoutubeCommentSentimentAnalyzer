import { useNavigate, Link } from "react-router-dom";
import { Box, TextField, Button, Typography, Paper, Snackbar } from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useState } from "react";

export default function Register() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  // Yup validation schema
  const validationSchema = Yup.object({
    username: Yup.string()
      .matches(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      )
      .min(3, "Username must be at least 3 characters")
      .max(15, "Username cannot exceed 15 characters")
      .required("Username is required"),
    address: Yup.string().required("Address is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      await axios.post("http://127.0.0.1:8000/auth/register", values);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const msg = err.response?.data?.detail || "Registration failed";
      if (msg.toLowerCase().includes("email")) {
        setFieldError("email", msg);
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
        <Typography
          variant="h5"
          sx={{ mb: 2, color: "#fff", textAlign: "center" }}
        >
          Register
        </Typography>

        <Formik
          initialValues={{ username: "", address: "", email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, getFieldProps, isSubmitting }) => (
            <Form>
              {["username", "address", "email", "password"].map((field) => (
                <TextField
                  key={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                  {...getFieldProps(field)} // <-- Formik handles value + onChange + onBlur
                  fullWidth
                  variant="filled"
                  error={touched[field] && Boolean(errors[field])}
                  helperText={touched[field] && errors[field]}
                  sx={{
                    mb: 2,
                    "& .MuiFilledInput-root": {
                      backgroundColor: "#111827",
                      color: "#fff",
                    },
                    "& .MuiInputLabel-root": { color: "#d1d5db" },
                    "& .MuiFilledInput-underline:before": { borderBottomColor: "#374151" },
                    "& .MuiFilledInput-underline:after": { borderBottomColor: "#FF0000" },
                  }}
                />
              ))}

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
                Register
              </Button>
            </Form>
          )}
        </Formik>

        <Typography variant="body2" sx={{ color: "#d1d5db", textAlign: "center" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#FF0000", textDecoration: "none" }}>
            Login
          </Link>
        </Typography>
      </Paper>

      <Snackbar
        open={success}
        autoHideDuration={2000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message="Registered successfully!"
      />
    </Box>
  );
}
