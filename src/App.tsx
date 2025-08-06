import React from 'react';
import { Link } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800 p-4">
      <h1 className="text-4xl font-bold mb-6">VisionCare App</h1>
      <p className="text-lg mb-8">Welcome to the homepage!</p>
      <nav className="flex space-x-4">
        <Link to="/signin" className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
          Sign In
        </Link>
        <Link to="/signup" className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300">
          Sign Up
        </Link>
      </nav>
    </div>
  );
};

export default App;