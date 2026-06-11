import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import "./App.css";

function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  return (
    <>
      <nav className="navbar">
        <h2>AI Phishing Detector</h2>

        <div>
          {!token && <Link to="/register">Register</Link>}
          {!token && <Link to="/login">Login</Link>}
          {token && <Link to="/dashboard">Dashboard</Link>}
          {token && <button onClick={logoutUser}>Logout</button>}
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={<Navigate to={token ? "/dashboard" : "/login"} />}
        />

        <Route
          path="/register"
          element={!token ? <Register /> : <Navigate to="/dashboard" />}
        />

        <Route
          path="/login"
          element={!token ? <Login /> : <Navigate to="/dashboard" />}
        />

        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />
      </Routes>
    </>
  );
}

export default App;