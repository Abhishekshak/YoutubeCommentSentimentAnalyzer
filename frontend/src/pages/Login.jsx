import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Snackbar,
} from "@mui/material";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false); // ✅ Snackbar state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:8000/auth/login", { email, password });

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("username", res.data.username);

      setSuccess(true); // show success snackbar

      // redirect after 1s so user can see the snackbar
      setTimeout(() => navigate("/analyze"), 1000);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Login failed");
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
          Login
        </Typography>

        {message && (
          <Alert
            severity="error"
            sx={{ mb: 2, backgroundColor: "#f87171", color: "#fff" }}
          >
            {message}
          </Alert>
        )}

        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              "& .MuiFilledInput-underline:before": { borderBottomColor: "#374151" },
              "& .MuiFilledInput-underline:after": { borderBottomColor: "#FF0000" },
            }}
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            variant="filled"
            sx={{
              mb: 3,
              "& .MuiFilledInput-root": {
                backgroundColor: "#111827",
                color: "#fff",
              },
              "& .MuiInputLabel-root": { color: "#d1d5db" },
              "& .MuiFilledInput-underline:before": { borderBottomColor: "#374151" },
              "& .MuiFilledInput-underline:after": { borderBottomColor: "#FF0000" },
            }}
          />

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
            Login
          </Button>
        </form>

        <Typography
          variant="body2"
          sx={{ color: "#d1d5db", textAlign: "center" }}
        >
          Don’t have an account?{" "}
          <Link to="/register" style={{ color: "#FF0000", textDecoration: "none" }}>
            Register
          </Link>
        </Typography>
      </Paper>

      {/* Snackbar for successful login */}
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
