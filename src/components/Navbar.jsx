import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout, userProfile } = useAuth();

  return (
    <nav>
      <div className="left">
        <Link to="/">Home</Link>
        {isAuthenticated && <Link to="/create-article">Create New Article</Link>}
      </div>
      <div className="right">
        {isAuthenticated ? (
          <>
            <span>Welcome, {userProfile.first_name || 'User'}!</span>
            <Link to="/profile">Profile</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
