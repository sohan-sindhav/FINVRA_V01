import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait for auth state to load from localStorage only if user is null
  if (loading && user === null) {
    return <div>Loading...</div>; // Or a proper loading spinner component
  }

  // Only redirect if loading is complete and user is not found
  if (!loading && !user) {
    console.log("User not found");
    return <Navigate to="/login" />;
  }

  if (user) {
    return children;
  }

  return null;
};
export default ProtectedRoute;
