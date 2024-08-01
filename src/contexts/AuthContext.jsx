import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [userProfile, setUserProfile] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserProfile = localStorage.getItem('userProfile');
    if (storedToken && storedUserProfile) {
      setToken(storedToken);
      setUserProfile(JSON.parse(storedUserProfile));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username, password) => {
    setAuthError('');
    setAuthSuccess('');
    try {
      const response = await axios.post('https://sandbox.academiadevelopers.com/api-auth/', { username, password });
      const userToken = response.data.token;
      setToken(userToken);
      setIsAuthenticated(true);
      localStorage.setItem('token', userToken);
      await fetchProfile(userToken);
      setAuthSuccess('Token generated successfully!');
      navigate('/profile');
    } catch (err) {
      setAuthError('Login failed. Please check your credentials.');
    }
  };

  const fetchProfile = async (token) => {
    try {
      const response = await axios.get('https://sandbox.academiadevelopers.com/users/profiles/profile_data/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      const profile = response.data;
      setUserProfile(profile);
      localStorage.setItem('userProfile', JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to fetch profile from API:', error);
    }
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, token, authError, authSuccess, userProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
