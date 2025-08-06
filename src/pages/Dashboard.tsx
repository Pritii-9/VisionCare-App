import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';

const Dashboard: React.FC = () => {
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const [protectedData, setProtectedData] = useState('');

  // Effect to fetch data from a protected backend route
  useEffect(() => {
    if (isAuthenticated) {
      const fetchProtectedData = async () => {
        try {
          const res = await axios.get('/api/protected_data');
          setProtectedData(res.data.message);
        } catch (error) {
          console.error("Failed to fetch protected data:", error);
          setProtectedData("Failed to load protected data.");
        }
      };
      fetchProtectedData();
    } else {
      // If not authenticated, redirect to the sign-in page
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    // You should also call your backend logout endpoint here
    try {
      await axios.get('/api/logout'); // Assuming you create a logout endpoint
      logout();
      navigate('/signin');
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if the backend call fails, log out on the frontend
      logout();
      navigate('/signin');
    }
  };

  // If not authenticated, the useEffect hook will handle the redirect.
  if (!isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, authenticated user!</p>
      <p>Your role is: **{role}**</p>

      <p>{protectedData}</p>

      {/* Conditional rendering based on role */}
      {role === 'admin' && (
        <div style={{ border: '1px solid black', padding: '10px', marginTop: '20px' }}>
          <h3>Admin Panel</h3>
          <p>This content is only visible to administrators.</p>
          {/* Add admin-specific features here */}
        </div>
      )}

      {role === 'receptionist' && (
        <div style={{ border: '1px solid black', padding: '10px', marginTop: '20px' }}>
          <h3>Receptionist View</h3>
          <p>You have access to patient scheduling and check-in features.</p>
          {/* Add receptionist-specific features here */}
        </div>
      )}

      {role === 'scanner' && (
        <div style={{ border: '1px solid black', padding: '10px', marginTop: '20px' }}>
          <h3>Scanner Interface</h3>
          <p>Here you can view and manage scans.</p>
          {/* Add scanner-specific features here */}
        </div>
      )}

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>
        Sign Out
      </button>
    </div>
  );
};

export default Dashboard;