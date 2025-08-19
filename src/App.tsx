import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext'; // Correctly import from the context file
import { CircleNotch } from '@phosphor-icons/react';

// --- Login Component ---
const Login: React.FC = () => {
  // We'll create a mock login function since we don't have a real backend.
  const { login } = useAuth();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock login logic
      if (id === 'doctor' && password === 'password') {
        login('Doctor');
      } else if (id === 'receptionist' && password === 'password') {
        login('Receptionist');
      } else if (id === 'scanner' && password === 'password') {
        login('Scanner');
      } else {
        setMessage({ text: 'Invalid ID or password.', type: 'error' });
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
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchProtectedData = async () => {
      setIsLoadingData(true);
      try {
        // Simulate a network call
        await new Promise(resolve => setTimeout(resolve, 500));
        setProtectedData(`Welcome! This is protected data for the ${role} role.`);
      } catch (error) {
        setProtectedData("Failed to load protected data. Please log in again.");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchProtectedData();
  }, [role]);

  const RoleSpecificPanel = () => {
    switch (role) {
      case 'Doctor':
        return <div className="p-4 bg-gray-50 rounded-lg"><h3 className="font-semibold text-gray-800">Doctor Panel</h3><p className="text-sm text-gray-600">Access to patient records and diagnostics.</p></div>;
      case 'Receptionist':
        return <div className="p-4 bg-gray-50 rounded-lg"><h3 className="font-semibold text-gray-800">Receptionist View</h3><p className="text-sm text-gray-600">Access to patient scheduling and check-in features.</p></div>;
      case 'Scanner':
        return <div className="p-4 bg-gray-50 rounded-lg"><h3 className="font-semibold text-gray-800">Scanner Interface</h3><p className="text-sm text-gray-600">Here you can view and manage scans.</p></div>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-10 rounded-2xl shadow-2xl text-center w-full max-w-md">
      <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
      <p className="text-lg mb-4 text-gray-700">Your role is: <strong className="text-blue-600">{role}</strong></p>
      <div className="bg-gray-100 p-4 rounded-lg my-4">
        {isLoadingData ? (
          <div className="flex justify-center items-center">
            <CircleNotch size={24} className="animate-spin text-gray-400" />
            <p className="ml-2 text-sm text-gray-600">Loading protected data...</p>
          </div>
        ) : (
          <p className="text-gray-700">{protectedData}</p>
        )}
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
  // In a real application, you would also need a context file (e.g., AuthContext.jsx)
  // that defines the AuthProvider and useAuth hook.
  
  // As a self-contained component, we will define a simple mock AuthProvider.
  const AuthContext = React.createContext({
    isAuthenticated: false,
    role: null,
    login: (role: string) => {},
    logout: () => {},
  });

  const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState<string | null>(null);

    const login = (userRole: string) => {
      setIsAuthenticated(true);
      setRole(userRole);
    };

    const logout = () => {
      setIsAuthenticated(false);
      setRole(null);
    };

    return (
      <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };
  
  // Now, render the main application content wrapped in the provider.
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <AppContent />
      </div>
    </AuthProvider>
  );
};

export default App;
