import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, TextField, Alert } from "@mui/material";
import logoMain from "../assets/Notoria-logo-04w.png";

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "app_token";
const TOKEN_EXPIRY_MINUTES = 30; // Token valid for 30 minutes

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const envVersion = import.meta.env.VITE_VERSION;

  const handleSubmit = (e) => {
    e.preventDefault();
    const envUsername = import.meta.env.VITE_USERNAME;
    const envPassword = import.meta.env.VITE_PASSWORD;
    console.log("VITE_USERNAME:", envUsername);
    console.log("VITE_PASSWORD:", envPassword);
    console.log("Input Username:", username);
    console.log("Input Password:", password);

    if (username === envUsername && password === envPassword) {
      // Generate token and expiry
      const token = Math.random().toString(36).substr(2);
      const expiry = Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(TOKEN_KEY + "_expiry", expiry);
      navigate("/");
    } else {
      setError("Invalid credentials");
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
