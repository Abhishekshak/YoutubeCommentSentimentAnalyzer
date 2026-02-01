import React from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Box,
  Grid,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import YouTubeIcon from "@mui/icons-material/YouTube";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FunctionsIcon from "@mui/icons-material/Functions"; // for model
import MemoryIcon from "@mui/icons-material/Memory"; // for ML tech

export default function Home() {
  const token = localStorage.getItem("token");

  const steps = [
    {
      title: "Login / Register",
      description: "Create an account or login to start analyzing YouTube comments.",
    },
    {
      title: "Paste Video URL",
      description: "Enter the YouTube video link you want to analyze.",
    },
    {
      title: "Analyze Sentiment",
      description: "See positive or neutral results for each comment.",
    },
    {
      title: "Review & Export",
      description: "Download or review your sentiment analysis report.",
    },
  ];

  const models = [
    {
      name: "Naive Bayes",
      description: "A probabilistic model trained on YouTube comments for accurate sentiment analysis.",
      icon: <FunctionsIcon sx={{ fontSize: 40, color: "#FF0000", mb: 1 }} />,
    },
    {
      name: "Preprocessing",
      description: "Text cleaning, stopword removal, and tokenization for precise results.",
      icon: <MemoryIcon sx={{ fontSize: 40, color: "#FF0000", mb: 1 }} />,
    },
    {
      name: "Machine Learning",
      description: "Optimized ML pipeline for fast predictions on any YouTube video.",
      icon: <CheckCircleIcon sx={{ fontSize: 40, color: "#FF0000", mb: 1 }} />,
    },
  ];

  return (
    <Box sx={{ backgroundColor: "#111827", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Card
          elevation={8}
          sx={{
            borderRadius: 3,
            textAlign: "center",
            p: 5,
            backgroundColor: "#1f2937",
            color: "#fff",
            mb: 6,
            boxShadow: "0 4px 20px rgba(255, 0, 0, 0.3)",
          }}
        >
          <CardContent>
            <YouTubeIcon sx={{ fontSize: 50, color: "#FF0000", mb: 2 }} />
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              YouTube Comments Sentiment Analyzer
            </Typography>
            <Typography
              variant="h6"
              color="#d1d5db"
              sx={{ mb: 4, maxWidth: 600, mx: "auto" }}
            >
              Analyze YouTube comments to detect positive or negative
              sentiments using Machine Learning fast, easy, and accurate.
            </Typography>

            {token ? (
              <Button
                component={Link}
                to="/analyze"
                variant="contained"
                size="large"
                sx={{
                  px: 5,
                  py: 1.5,
                  bgcolor: "#FF0000",
                  "&:hover": {
                    bgcolor: "#cc0000",
                    boxShadow: "0 0 15px #cc0000",
                    transition: "all 0.3s ease",
                  },
                }}
              >
                Go to Analyzer
              </Button>
            ) : (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="center"
                alignItems="center"
              >
                <Button
                  component={Link}
                  to="/login"
                  variant="contained"
                  size="large"
                  sx={{ px: 5, py: 1.5, borderRadius: 2 }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 5,
                    py: 1.5,
                    color: "#FF0000",
                    borderColor: "#FF0000",
                    borderRadius: 2,
                    "&:hover": {
                      backgroundColor: "#FF0000",
                      color: "#fff",
                      transition: "all 0.3s ease",
                    },
                  }}
                >
                  Register
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Horizontal Steps */}
        <Typography
          variant="h4"
          fontWeight="bold"
          color="#fff"
          textAlign="center"
          mb={4}
        >
          How It Works
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 3, sm: 2 }}
          justifyContent="center"
          alignItems="center"
          mb={8}
        >
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <Card
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: "#1f2937",
                  color: "#fff",
                  textAlign: "center",
                  flex: 1,
                  minHeight: 220,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 6px 20px rgba(255, 0, 0, 0.5)",
                  },
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 30, color: "#FF0000", mb: 1 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {step.title}
                </Typography>
                <Typography variant="body2" color="#d1d5db" sx={{ flexGrow: 1 }}>
                  {step.description}
                </Typography>
              </Card>

              {index < steps.length - 1 && (
                <ArrowForwardIosIcon
                  sx={{
                    color: "#FF0000",
                    display: { xs: "none", sm: "block" },
                    mx: 1,
                    fontSize: 30,
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </Stack>

        {/* Model / Technology Section */}
        <Typography
          variant="h4"
          fontWeight="bold"
          color="#fff"
          textAlign="center"
          mb={4}
        >
          Model & Technology
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {models.map((model, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Card
                elevation={3}
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 3,
                  backgroundColor: "#1f2937",
                  color: "#fff",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 8px 20px rgba(255, 0, 0, 0.5)",
                  },
                }}
              >
                {model.icon}
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {model.name}
                </Typography>
                <Typography variant="body2" color="#d1d5db">
                  {model.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
