import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext'; // Correctly import from the context file

// --- Login Component ---
const Login: React.FC = () => {
  const { login } = useAuth(); // Use the hook to get the login function
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, password }),
      });
      const data = await response.json();

      if (response.ok) {
        login(data.role); // On success, call login from context
      } else {
        setMessage({ text: data.error || 'An error occurred.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Failed to connect to the server.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Login</h2>
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
          <input type="text" id="id" value={id} onChange={(e) => setId(e.target.value)} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm" required disabled={isLoading} />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm" required disabled={isLoading} />
        </div>
        <button type="submit" className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {message.text && <div className={`mt-6 p-3 rounded-lg text-center text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : ''}`}>{message.text}</div>}
    </div>
  );
};

// --- Dashboard Component ---
const Dashboard: React.FC = () => {
  const { role, logout } = useAuth(); // Use the hook to get role and logout
  const [protectedData, setProtectedData] = useState('Loading...');

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/protected_data', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setProtectedData(data.message);
        } else {
          setProtectedData("Failed to load protected data. Please log in again.");
        }
      } catch (error) {
        setProtectedData("Could not connect to the server.");
      }
    };
    fetchProtectedData();
  }, []);

  const RoleSpecificPanel = () => {
    switch (role) {
      case 'Doctor':
        return <div><h3>Doctor Panel</h3><p>Access to patient records and diagnostics.</p></div>;
      case 'Receptionist':
        return <div><h3>Receptionist View</h3><p>Access to patient scheduling and check-in features.</p></div>;
      case 'Scanner':
        return <div><h3>Scanner Interface</h3><p>Here you can view and manage scans.</p></div>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-10 rounded-2xl shadow-2xl text-center w-full max-w-md">
      <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
      <p className="text-lg mb-4">Your role is: <strong>{role}</strong></p>
      <div className="bg-gray-100 p-4 rounded-lg my-4">
        <p className="text-gray-700">{protectedData}</p>
      </div>
      <div className="border-t pt-4 mt-4">
        <RoleSpecificPanel />
      </div>
      <button onClick={logout} className="mt-6 w-full py-3 px-4 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700">
        Sign Out
      </button>
    </div>
  );
};

// --- Conditional Renderer ---
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth(); // Use the hook to check auth state
  return isAuthenticated ? <Dashboard /> : <Login />;
};

// --- Root Component ---
const App: React.FC = () => {
  return (
    // Wrap the entire app in the imported AuthProvider
    <AuthProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <AppContent />
      </div>
    </AuthProvider>
  );
};

export default App;