import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import YouTubeIcon from "@mui/icons-material/YouTube";

export default function Navbar() {
  const [username, setUsername] = useState(null);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername(null);
    setLogoutOpen(false);
    navigate("/login");
  };

  const navButton = {
    color: "#ddd",
    fontSize: "0.85rem",
    textTransform: "none",
    px: 1.5,
    "&:hover": {
      color: "#FF0000",
      backgroundColor: "transparent",
    },
  };

  const activeStyle = {
    color: "#FF0000",
    fontWeight: 500,
  };

  return (
    <>
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
            px: 3,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {/* LEFT SIDE */}
          <Box display="flex" alignItems="center" gap={3}>
            {/* Brand */}
            <Box display="flex" alignItems="center" gap={0.8}>
              <YouTubeIcon sx={{ color: "#FF0000", fontSize: 20 }} />

              <Typography
                component={Link}
                to="/"
                sx={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                YT Sentiment
              </Typography>
            </Box>

            {/* Navigation Links */}
            {username && (
              <Box display="flex" alignItems="center">
                <Button
                  component={Link}
                  to="/analyze"
                  sx={{
                    ...navButton,
                    ...(location.pathname === "/analyze" && activeStyle),
                  }}
                >
                  Video Analyzer
                </Button>

                <Button
                  component={Link}
                  to="/analyze-comment"
                  sx={{
                    ...navButton,
                    ...(location.pathname === "/analyze-comment" &&
                      activeStyle),
                  }}
                >
                  Single Comment
                </Button>
                <Button
                  component={Link}
                  to="/wordcloud"
                  sx={{
                    ...navButton,
                    ...(location.pathname === "/wordcloud" && activeStyle),
                  }}
                >
                  Word Cloud
                </Button>
                <Button
                  component={Link}
                  to="/history"
                  sx={{
                    ...navButton,
                    ...(location.pathname === "/history" && activeStyle),
                  }}
                >
                  History
                </Button>
              </Box>
            )}
          </Box>

          {/* RIGHT SIDE */}
          {username ? (
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  bgcolor: "#FF0000",
                  width: 28,
                  height: 28,
                  fontSize: 13,
                }}
              >
                {username.charAt(0).toUpperCase()}
              </Avatar>

              <Button
                onClick={() => setLogoutOpen(true)}
                sx={{
                  color: "#bbb",
                  textTransform: "none",
                  fontSize: "0.8rem",
                  "&:hover": { color: "#ff4d4d" },
                }}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Box display="flex" gap={1}>
              <Button
                component={Link}
                to="/login"
                sx={{
                  color: "#ddd",
                  fontSize: "0.8rem",
                  textTransform: "none",
                }}
              >
                Login
              </Button>

              <Button
                component={Link}
                to="/register"
                sx={{
                  color: "#FF0000",
                  border: "1px solid #FF0000",
                  fontSize: "0.8rem",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#FF0000",
                    color: "#fff",
                  },
                }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Logout Dialog */}
      <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>

        <DialogContent>
          <Typography>Are you sure you want to logout?</Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setLogoutOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleLogout}>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}