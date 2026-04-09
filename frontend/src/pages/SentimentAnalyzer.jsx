import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  CircularProgress,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import YouTubeIcon from "@mui/icons-material/YouTube";

// ── Helper: decode JWT payload without a library ────────────────────────────
function getUserIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Use 'sub', 'id', 'user_id', or 'email' — whichever your backend sets
    return payload.sub || payload.id || payload.user_id || payload.email || null;
  } catch {
    return null;
  }
}

export default function SentimentAnalyzer() {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [data, setData] = useState({ results: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);
  const [isValidYoutubeUrl, setIsValidYoutubeUrl] = useState(false);

  const navigate = useNavigate();

  // ── Per-user localStorage key ──────────────────────────────────────────────
  const getStorageKey = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const userId = getUserIdFromToken(token);
    return userId ? `lastAnalysis_${userId}` : null;
  };

  // ── Redirect if not logged in ──────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  // ── Load last analysis for THIS user only ──────────────────────────────────
  useEffect(() => {
    const key = getStorageKey();
    if (!key) return;

    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      setVideoUrl(parsed.videoUrl || "");
      setVideoTitle(parsed.videoTitle || "");
      setThumbnailUrl(parsed.thumbnailUrl || null);
      setData({ results: parsed.results || [] });
      setIsValidYoutubeUrl(!!parsed.videoUrl && !!getVideoId(parsed.videoUrl));
    }
  }, []);

  const getVideoId = (url) => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
    );
    return match ? match[1] : null;
  };

  const fetchVideoTitle = async (url) => {
    try {
      const res = await axios.get(
        `https://noembed.com/embed?url=${encodeURIComponent(url)}`
      );
      return res.data.title || "";
    } catch {
      return "";
    }
  };

  const handleAnalyze = async () => {
    if (!videoUrl.trim() || !isValidYoutubeUrl) return;

    const videoId = getVideoId(videoUrl);
    const thumbnail = videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : null;

    setThumbnailUrl(thumbnail);
    const title = await fetchVideoTitle(videoUrl);
    setVideoTitle(title);

    setLoading(true);
    setError("");
    setData({ results: [] });
    setVisibleCount(20);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://127.0.0.1:8000/video/analyze_video",
        { video_id: videoUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.results && Array.isArray(res.data.results)) {
        setData(res.data);

        // ── Save analysis keyed to this user ──────────────────────────────
        const key = getStorageKey();
        if (key) {
          localStorage.setItem(
            key,
            JSON.stringify({
              videoUrl,
              videoTitle: title,
              thumbnailUrl: thumbnail,
              results: res.data.results,
            })
          );
        }
      } else {
        setError("No results returned from backend.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to fetch analysis");
    } finally {
      setLoading(false);
    }
  };

  const mappedResults = data.results.map((item) => ({
    comment: item.comment,
    sentiment: item.sentiment === 1 ? "Positive" : "Negative",
  }));

  const totalComments = mappedResults.length;

  const summary = { Positive: 0, Negative: 0 };
  mappedResults.forEach((item) => summary[item.sentiment]++);

  const chartData = [
    { name: "Positive", value: summary.Positive, color: "#22c55e" },
    { name: "Negative", value: summary.Negative, color: "#f87171" },
  ];

  const loadMore = () => setVisibleCount((prev) => prev + 20);

  const isEmptyState = totalComments === 0 && !loading;

  const handleUrlChange = (e) => {
    const value = e.target.value;
    setVideoUrl(value);
    setIsValidYoutubeUrl(!!getVideoId(value));
    setData({ results: [] });
    setVideoTitle("");
    setThumbnailUrl(null);
  };

  return (
    <Box sx={{ backgroundColor: "#111827", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" color="#fff" textAlign="center" gutterBottom>
          YouTube Sentiment Analyzer
        </Typography>

        {/* Input Section */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            mb: 4,
          }}
        >
          <TextField
            placeholder="Paste YouTube video URL"
            value={videoUrl}
            onChange={handleUrlChange}
            fullWidth
            sx={{
              backgroundColor: "#1f2937",
              borderRadius: 1,
              input: { color: "#fff" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#374151" },
              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#FF0000",
              },
            }}
          />
          <Button
            onClick={handleAnalyze}
            variant="contained"
            disabled={!isValidYoutubeUrl || loading}
            sx={{
              bgcolor: isValidYoutubeUrl ? "#FF0000" : "#7c806b",
              "&:hover": { bgcolor: isValidYoutubeUrl ? "#cc0000" : "#6b7280" },
              "&.Mui-disabled": { bgcolor: "#7c806b", color: "#fff" },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Analyze"}
          </Button>
        </Box>

        {error && (
          <Typography color="#f87171" textAlign="center" mb={2}>
            {error}
          </Typography>
        )}

        {/* Empty State */}
        {isEmptyState && (
          <Box sx={{ textAlign: "center", py: 10, color: "#d1d5db" }}>
            <YouTubeIcon sx={{ fontSize: 80, color: "#FF0000", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Paste a YouTube video link above to analyze comments
            </Typography>
            <Typography variant="body2">
              Get Positive and Negative sentiment analysis for each comment.
            </Typography>
          </Box>
        )}

        {/* Analysis Result */}
        {!isEmptyState && thumbnailUrl && (
          <>
            {/* Video Info */}
            <Card sx={{ display: "flex", backgroundColor: "#1f2937", mb: 4 }}>
              <Box
                component="img"
                src={thumbnailUrl}
                alt="Thumbnail"
                sx={{ width: 200 }}
              />
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h5" color="#fff">
                  {videoTitle || "YouTube Video"}
                </Typography>
                <Typography variant="body2" color="#d1d5db" sx={{ mt: 1 }}>
                  Total Comments Analyzed: {totalComments}
                </Typography>
              </CardContent>
            </Card>

            {/* Dashboard */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
                mb: 4,
              }}
            >
              <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
                {chartData.map((item) => (
                  <Card
                    key={item.name}
                    sx={{
                      flex: 1,
                      backgroundColor: "#1f2937",
                      color: "#fff",
                      textAlign: "center",
                      py: 2,
                      borderLeft: `5px solid ${item.color}`,
                    }}
                  >
                    <CardContent>
                      <Typography variant="h5" fontWeight="bold">
                        {item.value}
                      </Typography>
                      <Typography variant="body2" color="#d1d5db">
                        {item.name} (
                        {((item.value / totalComments) * 100).toFixed(1)}%)
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>

              <Box sx={{ flex: 1, minHeight: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>

            {/* Comments */}
            <Card
              sx={{
                backgroundColor: "#1f2937",
                p: 2,
                maxHeight: 400,
                overflowY: "auto",
              }}
            >
              <Typography variant="h5" color="#fff" mb={2}>
                Comments
              </Typography>

              {mappedResults.slice(0, visibleCount).map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 2,
                    pb: 1,
                    borderBottom: "1px solid #374151",
                    color: item.sentiment === "Positive" ? "#22c55e" : "#f87171",
                  }}
                >
                  <Typography variant="body2">
                    <strong>Comment:</strong> {item.comment}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Sentiment:</strong> {item.sentiment}
                  </Typography>
                </Box>
              ))}

              {visibleCount < mappedResults.length && (
                <Button
                  onClick={loadMore}
                  sx={{
                    mt: 2,
                    width: "100%",
                    bgcolor: "#FF0000",
                    "&:hover": { bgcolor: "#cc0000" },
                  }}
                >
                  Load More
                </Button>
              )}
            </Card>
          </>
        )}
      </Container>
    </Box>
  );
}
