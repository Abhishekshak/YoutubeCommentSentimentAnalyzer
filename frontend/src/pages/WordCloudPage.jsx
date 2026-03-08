import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as d3 from "d3";
import cloud from "d3-cloud";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import YouTubeIcon from "@mui/icons-material/YouTube";

export default function WordCloudPage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [words, setWords] = useState([]);
  const svgRef = useRef(null);

  // Extract YouTube video ID safely
  const getVideoId = (url) => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
    );
    return match ? match[1] : null;
  };

  const handleAnalyze = async () => {
    const videoId = getVideoId(videoUrl);
    if (!videoId) {
      setError("Invalid YouTube URL");
      setWords([]);
      return;
    }

    setError("");
    setLoading(true);
    setWords([]);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://127.0.0.1:8000/video/analyze_video",
        { video_id: videoId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const results = Array.isArray(res.data?.results) ? res.data.results : [];

      if (!results.length) {
        setError("No comments found for this video.");
        return;
      }

      // Count word frequencies
      const freq = {};
      results.forEach((item) => {
        if (!item.comment) return;
        item.comment
          .toLowerCase()
          .split(/\s+/)
          .forEach((w) => {
            if (w.length > 2) freq[w] = (freq[w] || 0) + 1;
          });
      });

      const wcData = Object.entries(freq).map(([text, value]) => ({ text, value }));
      if (!wcData.length) {
        setError("Not enough content to generate a word cloud.");
        return;
      }

      setWords(wcData);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  };

  // Draw word cloud when words change
  useEffect(() => {
    if (!words.length) return;
    const layout = cloud()
      .size([500, 500])
      .words(words.map((d) => ({ text: d.text, size: 10 + d.value * 2 })))
      .padding(5)
      .rotate(() => (Math.random() > 0.5 ? 0 : 90))
      .font("Impact")
      .fontSize((d) => d.size)
      .on("end", (drawnWords) => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // clear previous
        svg
          .attr("width", 500)
          .attr("height", 500)
          .append("g")
          .attr("transform", "translate(250,250)")
          .selectAll("text")
          .data(drawnWords)
          .enter()
          .append("text")
          .style("font-family", "Impact")
          .style("fill", () => d3.schemeCategory10[Math.floor(Math.random() * 10)])
          .style("font-size", (d) => d.size + "px")
          .attr("text-anchor", "middle")
          .attr("transform", (d) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
          .text((d) => d.text);
      });

    layout.start();
  }, [words]);

  return (
    <Box sx={{ backgroundColor: "#111827", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <YouTubeIcon sx={{ fontSize: 80, color: "#FF0000" }} />
          <Typography variant="h4" color="#fff" gutterBottom>
            YouTube Word Cloud
          </Typography>
          <Typography color="#d1d5db">
            Visualize the most frequent words in a video's comments
          </Typography>
        </Box>

        {/* Input */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 4,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <TextField
            placeholder="Paste YouTube video URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
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
            disabled={!videoUrl || loading}
            sx={{
              bgcolor: "#FF0000",
              "&:hover": { bgcolor: "#cc0000" },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Generate"}
          </Button>
        </Box>

        {/* Error */}
        {error && (
          <Typography color="#f87171" textAlign="center" mb={2}>
            {error}
          </Typography>
        )}

        {/* Word Cloud */}
        <Box
          sx={{
            mt: 4,
            minHeight: 500,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {loading && <CircularProgress size={80} thickness={4} sx={{ color: "#FF0000" }} />}
          {!loading && words.length > 0 && <svg ref={svgRef}></svg>}
          {!loading && !words.length && !error && (
            <Typography color="#d1d5db" textAlign="center">
              Enter a YouTube URL and click Generate
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
}