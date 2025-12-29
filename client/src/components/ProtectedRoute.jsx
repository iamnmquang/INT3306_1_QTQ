import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const token = localStorage.getItem("accessToken");

    if (!isLoggedIn || !token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
