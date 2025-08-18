import React, {
  useState,
  createContext,
  useContext,
  type ReactNode,
  type FormEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';

// --- Authentication Context ---
interface AuthContextType {
  isAuthenticated: boolean;
  role: string | null;
  login: (role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
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

  const value = { isAuthenticated, role, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- Login Component ---
interface LoginProps {
  navigateTo?: (route: string) => void;
}

const Login: React.FC<LoginProps> = ({ navigateTo }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; type: string }>({
    text: '',
    type: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.role);
        navigate('/dashboard');
      } else {
        setMessage({
          text: data.error || 'An unknown error occurred.',
          type: 'error',
        });
      }
    } catch (error) {
      setMessage({
        text: 'Failed to connect to the server. Please try again later.',
        type: 'error',
      });
      console.error('Login API call failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
        Login
      </h2>
      <p className="text-center text-gray-500 mb-8 text-sm">
        Access your designated portal.
      </p>
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label
            htmlFor="id"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            User ID
          </label>
          <input
            type="text"
            id="id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
            placeholder="e.g., doc01"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
            placeholder="Enter password"
            required
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 transform hover:-translate-y-1 disabled:bg-blue-400 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {message.text && (
        <div className="mt-6 p-3 rounded-lg text-center text-sm font-medium bg-red-100 text-red-700">
          {message.text}
        </div>
      )}
      {navigateTo && (
        <div className="mt-6 text-center">
          <button
            onClick={() => navigateTo('home')}
            className="text-sm text-blue-600 hover:underline"
          >
            &larr; Back to Home
          </button>
        </div>
      )}
    </div>
  );
};

// --- Wrapper Component ---
const LoginWithAuthProvider: React.FC<LoginProps> = ({ navigateTo }) => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <Login navigateTo={navigateTo} />
      </div>
    </AuthProvider>
  );
};

export default LoginWithAuthProvider;
