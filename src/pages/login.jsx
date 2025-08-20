
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'app_token';
const TOKEN_EXPIRY_MINUTES = 30; // Token valid for 30 minutes

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
  const envUsername = import.meta.env.VITE_USERNAME;
  const envPassword = import.meta.env.VITE_PASSWORD;
  console.log('VITE_USERNAME:', envUsername);
  console.log('VITE_PASSWORD:', envPassword);
  console.log('Input Username:', username);
  console.log('Input Password:', password);
    if (username === envUsername && password === envPassword) {
      // Generate token and expiry
      const token = Math.random().toString(36).substr(2);
      const expiry = Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(TOKEN_KEY + '_expiry', expiry);
      navigate('/');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
