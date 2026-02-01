import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import YouTubeIcon from "@mui/icons-material/YouTube";

export default function Navbar() {
  const [username, setUsername] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername);
    setAnchorEl(null); // close menu on route change
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername(null);
    navigate("/login");
  };

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        backgroundColor: "#181818",
        height: 50,
        justifyContent: "center",
      }}
    >
      <Toolbar
        sx={{
          minHeight: 50,
          px: 2,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* Brand */}
        <Box display="flex" alignItems="center" gap={0.75}>
          <YouTubeIcon
            sx={{
              color: "#FF0000",
              fontSize: 18,
              animation: "spin 4s linear infinite",
            }}
          />
          <Typography
            component={Link}
            to="/"
            sx={{
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "#fff",
              textDecoration: "none",
              lineHeight: 1,
            }}
          >
            YT Sentiment
          </Typography>
        </Box>

        {/* Right side */}
        {username ? (
          <>
            <IconButton
              size="small"
              sx={{ padding: 0 }}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <Avatar
                sx={{
                  bgcolor: "#FF0000",
                  width: 28,
                  height: 28,
                  fontSize: 12,
                }}
              >
                {username.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem disabled>Welcome, {username}</MenuItem>
              <MenuItem onClick={() => navigate("/analyze")}>Analyzer</MenuItem>
              <MenuItem onClick={() => navigate("/history")}>History</MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: "red" }}>
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Button
              component={Link}
              to="/login"
              size="small"
              sx={{
                fontSize: "0.75rem",
                minWidth: 50,
                lineHeight: 1,
                padding: "4px 8px",
              }}
            >
              Login
            </Button>

            <Button
              component={Link}
              to="/register"
              size="small"
              sx={{
                fontSize: "0.75rem",
                minWidth: 55,
                lineHeight: 1,
                padding: "4px 8px",
                color: "#FF0000",
                border: "1px solid #FF0000",
                "&:hover": { backgroundColor: "#FF0000", color: "#fff" },
              }}
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </AppBar>
  );
}
