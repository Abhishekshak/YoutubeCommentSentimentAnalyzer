import React from "react";
import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#181818", // matches navbar
        color: "#e5e7eb",
        textAlign: "center",
        py: 2,
        px: 2,
        width: "100%",
        fontSize: "0.8rem",
        boxShadow: "0 -2px 5px rgba(0,0,0,0.2)",

      }}
    >
      <Typography variant="body2">
        &copy; {new Date().getFullYear()} YouTube Sentiment Analyzer. All rights reserved.
      </Typography>
    </Box>
  );
}
