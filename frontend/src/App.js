import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";

// User Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SentimentAnalyzer from "./pages/SentimentAnalyzer";
import SingleCommentAnalyzer from "./pages/SingleCommentAnalzer";
import WordCloudPage from "./pages/WordCloudPage";
import History from "./pages/History";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Routes
import PublicRoute from "./routes/PublicRoute";
import PrivateRoute from "./routes/PrivateRoute";

// This wraps all user pages with Navbar/Footer
function UserWrapper() {
  return (
    <>
      <Navbar />
      <Outlet /> {/* Render the child route here */}
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>

        {/* ----------------- User Routes ----------------- */}
        <Route element={<UserWrapper />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/analyze" element={<PrivateRoute><SentimentAnalyzer /></PrivateRoute>} />
          <Route path="/analyze-comment" element={<PrivateRoute><SingleCommentAnalyzer /></PrivateRoute>} />
          <Route path="/wordcloud" element={<PrivateRoute><WordCloudPage /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
        </Route>

        {/* ----------------- Admin Routes ---------------- */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* ----------------- Fallback ---------------- */}
        <Route path="*" element={<Home />} />

      </Routes>
    </Router>
  );
}

export default App;
