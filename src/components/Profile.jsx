import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { userProfile } = useAuth();

  return (
    <div className="container">
      <h1 style={{ color: '#bb86fc' }}>Profile</h1>
      <div className="card">
        <p><strong>User ID:</strong> {userProfile.user__id}</p>
        <p><strong>Username:</strong> {userProfile.username}</p>
        <p><strong>First Name:</strong> {userProfile.first_name}</p>
        <p><strong>Last Name:</strong> {userProfile.last_name}</p>
        <p><strong>Email:</strong> {userProfile.email}</p>
        {userProfile.bio && <p><strong>Bio:</strong> {userProfile.bio}</p>}
      </div>
    </div>
  );
};

export default Profile;
