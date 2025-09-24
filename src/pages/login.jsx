import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, TextField, Alert } from "@mui/material";
import logoMain from "../assets/Notoria-logo-04w.png";

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "app_token";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const envVersion = import.meta.env.VITE_VERSION;

  const TOKEN_EXPIRY_HOURS = 2; // Token valid for 2 hours

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_STRAPI_URL}/api/auth/local`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: username,
            password: password,
          }),
        }
      );
      const data = await response.json();
      if (data.jwt) {
        localStorage.setItem(TOKEN_KEY, data.jwt);
        localStorage.setItem(TOKEN_KEY + "_user", JSON.stringify(data.user));
        localStorage.setItem(
          TOKEN_KEY + "_expiry",
          Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
        );

        console.log("JWT token:", localStorage.getItem(TOKEN_KEY));
        console.log("User object:", localStorage.getItem(TOKEN_KEY + "_user"));
        console.log(
          "Token expiry:",
          localStorage.getItem(TOKEN_KEY + "_expiry")
        );

        navigate("/");
      } else {
        setError(data.error?.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Login failed");
    }
  };

  return (
    <>
      <Box className="glass-card">
        <img
          className="logoMain"
          style={{ margin: "auto", width: "70%", marginTop: "-2rem" }}
          src={logoMain}
          alt=""
        />

        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          style={{ textAlign: "center", marginTop: "1rem" }}
        >
          Login
        </Typography>
        <Typography
          variant="body1"
          component="h1"
          gutterBottom
          style={{ margin: "1rem" }}
        >
          Please enter your credentials to access the admin panel.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            id="username"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            fullWidth
            required
          />

          <TextField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            fullWidth
            required
          />

          <Button
            type="submit"
            variant="contained"
            sx={{
              mt: 2,
              width: "100%",
              textTransform: "none",
              marginTop: "2rem",
            }}
          >
            Login
          </Button>
          {error && (
            <Alert
              severity="error"
              sx={{
                mt: 1,
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                background: "none",
              }}
            >
              {error}
            </Alert>
          )}
        </Box>
        <Typography
          variant="body2"
          sx={{
            mt: 2,
            textAlign: "center",
            marginTop: "4rem",
            marginBottom: "-3rem",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          Version: {envVersion}
        </Typography>
      </Box>
    </>
  );
}

export default Login;
