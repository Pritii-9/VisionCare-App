import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // CORRECTED PATH

const Dashboard: React.FC = () => {
  // 1. Access authentication state from the context
  const { role, logout } = useAuth();
  const [protectedData, setProtectedData] = useState<string>('Loading sensitive data...');
  const [error, setError] = useState<string | null>(null);

  // 2. Fetch data from a protected backend route after the component mounts
  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        setError(null);
        const response = await fetch('http://127.0.0.1:5000/api/protected_data', {
          // 'include' is crucial for sending the session cookie from the browser to the server
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setProtectedData(data.message); // e.g., "Welcome back, Dr. Smith!"
        } else if (response.status === 401) {
          // Handle unauthorized access (e.g., session expired)
          setError("Your session has expired. Please sign out and log in again.");
          setProtectedData("Access Denied.");
        } else {
          // Handle other server errors
          setError("The server encountered an error. Please try again later.");
          setProtectedData("Failed to load data.");
        }
      } catch (err) {
        console.error("Connection error:", err);
        setError("Could not connect to the server. Please check your connection.");
        setProtectedData("Failed to load data.");
      }
    };

    fetchProtectedData();
  }, []); // The empty array [] ensures this effect runs only once

  // 3. A sub-component to render UI specific to the user's role
  const RoleSpecificPanel = () => {
    switch (role) {
      case 'Doctor':
        return (
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Doctor's Portal</h3>
            <p className="text-gray-600 mt-1">Access patient records and diagnostic tools.</p>
            {/* Add Doctor-specific components here */}
          </div>
        );
      case 'Receptionist':
        return (
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Receptionist View</h3>
            <p className="text-gray-600 mt-1">Manage patient appointments and check-ins.</p>
            {/* Add Receptionist-specific components here */}
          </div>
        );
      case 'Scanner':
        return (
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Scanner Interface</h3>
            <p className="text-gray-600 mt-1">View and manage imaging scan queues.</p>
            {/* Add Scanner-specific components here */}
          </div>
        );
      default:
        return <p className="text-gray-500">Your role does not have a specific dashboard view.</p>;
    }
  };

  return (
    <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl text-center w-full max-w-xl">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Welcome to the Dashboard</h1>
      <p className="text-lg text-gray-600 mb-6">
        Your Role: <strong className="font-semibold text-blue-600 capitalize">{role || 'User'}</strong>
      </p>

      {/* Section for displaying data fetched from the protected API route */}
      <div className="bg-gray-50 p-4 rounded-lg my-6 border border-gray-200">
        <p className="text-gray-700 font-medium">{protectedData}</p>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      {/* Section for role-specific information and actions */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <RoleSpecificPanel />
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="mt-8 w-full py-3 px-4 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300 transform hover:-translate-y-1"
      >
        Sign Out
      </button>
    </div>
  );
};

export default Dashboard;