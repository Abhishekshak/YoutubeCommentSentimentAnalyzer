import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Button,
  Link,
} from "@mui/material";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios
      .get("http://localhost:8000/video/history", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setHistory(res.data.history || []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        setLoading(false);
      });
  }, []);

  const toggleExpand = (idx) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (!history.length) {
    return (
      <Box mt={5} textAlign="center">
        <Typography>No history found.</Typography>
      </Box>
    );
  }

  return (
    <Box mt={3} px={2}>
      <Typography variant="h6" mb={2}>
        Your Sentiment Analysis History
      </Typography>

      {history.map((item, idx) => {
        const positive = item.result.filter((r) => r.sentiment === 1).length;
        const negative = item.result.filter((r) => r.sentiment === 0).length;
        const showComments = expanded[idx];

        return (
          <Paper key={idx} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Video: {item.video_title || "Untitled Video"}
            </Typography>

            <Link
              href={`https://www.youtube.com/watch?v=${item.video_url}`}
              target="_blank"
              rel="noopener"
              underline="hover"
              sx={{ fontSize: "0.75rem", display: "block", mb: 0.5 }}
            >
              Open on YouTube
            </Link>

            <Typography variant="caption" color="text.secondary">
              Analyzed on: {new Date(item.created_at).toLocaleString()}
            </Typography>

            <Typography variant="body2" mt={1} mb={1}>
              Positive: {positive} | Negative: {negative} | Total:{" "}
              {item.result.length}
            </Typography>

            <Divider sx={{ my: 1 }} />

            {showComments &&
              item.result.map((r, i) => (
                <Box key={i} mb={0.5}>
                  <Typography variant="body2">
                    <strong>{r.comment}</strong> —{" "}
                    {r.sentiment === 1 ? "Positive" : "Negative"}
                  </Typography>
                </Box>
              ))}

            <Box mt={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => toggleExpand(idx)}
              >
                {showComments ? "Hide Comments" : "View Comments"}
              </Button>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}
