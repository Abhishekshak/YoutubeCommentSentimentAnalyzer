import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Snackbar,
} from "@mui/material";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    address: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false); // ✅ Snackbar state
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("http://127.0.0.1:8000/auth/register", formData);
      setSuccess(true); // Show snackbar
      setTimeout(() => {
        navigate("/login"); // Redirect after 1.5s
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
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

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2, backgroundColor: "#f87171", color: "#fff" }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { label: "Username", name: "username" },
            { label: "Address", name: "address" },
            { label: "Email", name: "email", type: "email" },
            { label: "Password", name: "password", type: "password" },
          ].map((field) => (
            <TextField
              key={field.name}
              label={field.label}
              type={field.type || "text"}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              fullWidth
              required
              variant="filled"
              sx={{
                mb: 2,
                "& .MuiFilledInput-root": {
                  backgroundColor: "#111827",
                  color: "#fff",
                },
                "& .MuiInputLabel-root": { color: "#d1d5db" },
                "& .MuiFilledInput-underline:before": {
                  borderBottomColor: "#374151",
                },
                "& .MuiFilledInput-underline:after": {
                  borderBottomColor: "#FF0000",
                },
              }}
            />
          ))}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "#FF0000",
              "&:hover": { backgroundColor: "#e60000" },
              mb: 2,
            }}
          >
            Register
          </Button>
        </form>

        <Typography
          variant="body2"
          sx={{ color: "#d1d5db", textAlign: "center" }}
        >
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#FF0000", textDecoration: "none" }}>
            Login
          </Link>
        </Typography>
      </Paper>

      {/* Snackbar for success */}
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
