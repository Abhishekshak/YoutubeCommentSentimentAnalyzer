import React, { useState } from "react";
import axios from "axios";

function App() {
  const [videoUrl, setVideoUrl] = useState("");
  const [data, setData] = useState({ results: [] }); // match backend
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!videoUrl.trim()) return; // Don't send empty URL
    setLoading(true);
    setError("");
    setData({ results: [] });

    try {
      const response = await axios.get("http://127.0.0.1:8000/video/analyze_video", {
        params: { video_id: videoUrl },
      });

      // Check if backend returned results
      if (response.data.results && Array.isArray(response.data.results)) {
        setData(response.data);
      } else {
        setError("No results returned from backend.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch analysis. Check backend or CORS.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>YouTube Comment Sentiment Analyzer</h1>

      <input
        type="text"
        placeholder="Paste YouTube video URL"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <button
        onClick={handleAnalyze}
        disabled={loading}
        style={{ padding: "10px 20px" }}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      <div style={{ marginTop: "20px" }}>
        {!loading && data.results.length === 0 && !error && (
          <p>No comments analyzed yet.</p>
        )}

        {data.results.length > 0 && (
          data.results.map((item, index) => (
            <div
              key={index}
              style={{
                marginBottom: "15px",
                borderBottom: "1px solid #ccc",
                paddingBottom: "10px",
              }}
            >
              <p><strong>Comment:</strong> {item.comment}</p>
              <p><strong>Sentiment:</strong> {item.sentiment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
