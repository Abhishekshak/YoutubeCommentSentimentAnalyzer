import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Snackbar,
  Drawer,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [logoutOpen, setLogoutOpen] = useState(false);

  const token = localStorage.getItem("admin_token");

  // Redirect if not logged in
  useEffect(() => {
    if (!token) navigate("/admin/login");
  }, [token, navigate]);

  // Fetch users & videos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await axios.get(
          "http://127.0.0.1:8000/admin/users",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers(usersRes.data);

        const videosRes = await axios.get(
          "http://127.0.0.1:8000/admin/videos",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVideos(videosRes.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [token]);

  // Delete user
  const deleteUser = async (id) => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/admin/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.filter((u) => u.id !== id));
      setSuccessMsg("User deleted successfully");
    } catch (err) {
      console.log(err);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* ================= Sidebar ================= */}
      <Drawer
        variant="permanent"
        sx={{
          width: 220,
          [`& .MuiDrawer-paper`]: {
            width: 220,
            boxSizing: "border-box",
            backgroundColor: "#111",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box sx={{ p: 2, flexGrow: 1 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Admin Panel
          </Typography>

          <Button
            fullWidth
            sx={{ color: "#fff", justifyContent: "flex-start", mb: 1 }}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </Button>

          <Button
            fullWidth
            sx={{ color: "#fff", justifyContent: "flex-start", mb: 1 }}
            onClick={() => setActiveTab("users")}
          >
            Users
          </Button>

          <Button
            fullWidth
            sx={{ color: "#fff", justifyContent: "flex-start" }}
            onClick={() => setActiveTab("history")}
          >
            History
          </Button>
        </Box>

        <Divider sx={{ background: "#333" }} />

        {/* Logout Button */}
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={() => setLogoutOpen(true)}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      {/* ================= Main Content ================= */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          {activeTab === "overview" && "Overview"}
          {activeTab === "users" && "Users"}
          {activeTab === "history" && "Analyzed Videos"}
        </Typography>

        {/* Overview */}
        {activeTab === "overview" && (
          <Box sx={{ display: "flex", gap: 3 }}>
            <Paper sx={{ p: 3, flex: 1 }}>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h4">{users.length}</Typography>
            </Paper>

            <Paper sx={{ p: 3, flex: 1 }}>
              <Typography variant="h6">Videos Analyzed</Typography>
              <Typography variant="h4">{videos.length}</Typography>
            </Paper>
          </Box>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <Paper sx={{ p: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* History */}
        {activeTab === "history" && (
          <Paper sx={{ p: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Video URL</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Analyzed By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <a
                        href={video.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {video.video_url}
                      </a>
                    </TableCell>
                    <TableCell>{video.video_title}</TableCell>
                    <TableCell>{video.analyzed_by}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={2000}
        onClose={() => setSuccessMsg("")}
        message={successMsg}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to logout?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleLogout}>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
