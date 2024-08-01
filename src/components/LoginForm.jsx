import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, authError, authSuccess } = useAuth(); // Agregar authSuccess
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(username, password);
    if (!authError) {
      navigate('/');
    }
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit}>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {authError && <div style={{ color: 'red' }}>{authError}</div>}
      {authSuccess && <div style={{ color: 'green' }}>{authSuccess}</div>} {/* Mostrar mensaje de éxito */}
    </div>
  );
};

export default LoginForm;
