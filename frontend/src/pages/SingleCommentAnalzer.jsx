import React, { useState } from "react";
import axios from "axios";

export default function SingleCommentAnalyzer() {
  const [comment, setComment] = useState("");
  const [sentiment, setSentiment] = useState("");

  const handleAnalyze = async () => {
    if (!comment) return;

    try {
      const res = await axios.post("http://localhost:8000/comment/analyze", {
        text: comment,
      });
      setSentiment(res.data.sentiment);
    } catch (err) {
      console.error(err);
      setSentiment("Error");
    }
  };

  const getSentimentStyle = () => {
    if (sentiment.toLowerCase().includes("positive"))
      return { background: "#16a34a" };
    if (sentiment.toLowerCase().includes("negative"))
      return { background: "#dc2626" };
    if (sentiment.toLowerCase().includes("neutral"))
      return { background: "#eab308", color: "#000" };

    return { background: "#6b7280" };
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Single Comment Sentiment</h2>

        <textarea
          rows={4}
          placeholder="Type your YouTube comment here..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={styles.textarea}
        />

        <button onClick={handleAnalyze} style={styles.button}>
          Analyze Comment
        </button>

        {sentiment && (
          <div style={styles.resultBox}>
            <span style={{ ...styles.badge, ...getSentimentStyle() }}>
              {sentiment}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#111827",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },

  card: {
    background: "#1f2937",
    padding: "35px",
    borderRadius: "12px",
    width: "420px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
    textAlign: "center",
  },

  title: {
    color: "#fff",
    marginBottom: "20px",
  },

  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #374151",
    background: "#111827",
    color: "#fff",
    resize: "none",
    outline: "none",
    marginBottom: "18px",
    fontSize: "14px",
  },

  button: {
    background: "#FF0000",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "0.2s",
  },

  resultBox: {
    marginTop: "20px",
  },

  badge: {
    padding: "8px 16px",
    borderRadius: "20px",
    color: "#fff",
    fontWeight: "600",
    fontSize: "14px",
  },
};