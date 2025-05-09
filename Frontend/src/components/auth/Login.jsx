// src/components/auth/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  // Use localhost in dev, your real domain in prod
  const apiURL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://your-production-backend.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Build request body for email or username
    const requestBody = loginInput.includes("@")
      ? { email: loginInput, password }
      : { username: loginInput, password };

    try {
      const response = await fetch(`${apiURL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();

      if (!response.ok) {
        // Show any server error message, or a default
        setError(data.message || "Invalid credentials.");
        return;
      }

      // 1) Persist token
      localStorage.setItem("token", data.token);
      // 2) Optionally persist user info
      localStorage.setItem("username", data.username || "");
      // 3) Update your AuthContext
      login(data.token, data.email, data.userId, data.username);
      // 4) Redirect to home/dashboard
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-yellow-100 via-orange-200 to-red-100">
      <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-lg shadow-lg">
        <h2 className="mb-6 text-3xl font-bold text-center text-gray-800">
          Welcome Back to <span className="text-orange-500">ArtEchoes</span>
        </h2>
        <p className="mb-4 text-center text-gray-500">
          Log in to explore and share breathtaking art!
        </p>
        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            placeholder="Email or Username"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            type="submit"
            className="w-full py-2 font-bold text-white transition duration-300 bg-orange-500 rounded-lg hover:bg-orange-600"
          >
            Log In
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          <Link
            to="/forgot-password"
            className="font-semibold text-orange-500 hover:underline"
          >
            Forgot Password?
          </Link>
        </p>
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-orange-500 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
