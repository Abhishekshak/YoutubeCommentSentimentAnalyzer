// routes/PublicRoute.jsx
import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  if (token) {
    // Already logged in → redirect to analyze
    return <Navigate to="/analyze" replace />;
  }
  return children;
}
