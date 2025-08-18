import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/sidebar'; // Corrected casing for consistency
import Patients from '../pages/Patient'; // Import the new Patients page

// --- Helper Components ---

const UserProfile = () => (
    <div className="flex items-center">
        <div className="relative">
            <input type="text" placeholder="Search" className="bg-gray-200 rounded-full py-2 px-4 pl-10 text-sm focus:outline-none"/>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
            </div>
        </div>
        <img className="h-10 w-10 rounded-full ml-4" src="https://placehold.co/100x100/F3F4F6/333333?text=U" alt="User" />
    </div>
);

// --- Content Router Component ---
// This component decides which page to display based on the activePage state.
const MainContent: React.FC<{ activePage: string }> = ({ activePage }) => {
  switch (activePage) {
    case 'Patients':
      return <Patients />;
    case 'Dashboard':
      return <DashboardContent />;
    // Add cases for 'Appointments', 'Messages', 'Reports' here in the future
    // For example: case 'Appointments': return <AppointmentsPage />;
    default:
      // Fallback to the main dashboard content
      return <DashboardContent />;
  }
};

// --- Main Dashboard Component ---

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [activePage, setActivePage] = useState('Patients'); // Default page is now 'Patients'

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* --- Sidebar --- */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        logout={logout}
      />

      {/* --- Main Content Area --- */}
      <main className="flex-1 flex flex-col">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-3xl font-bold text-gray-800">{activePage}</h2>
          <UserProfile />
        </header>
        
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Use the MainContent component to render the correct page */}
          <MainContent activePage={activePage} />
        </div>
      </main>
    </div>
  );
};

// --- Component for the main dashboard overview ---
const DashboardContent: React.FC = () => {
    const { role } = useAuth();
    // You can keep data fetching here if needed for the main dashboard page
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Dashboard Overview</h3>
            <p className="text-gray-700">
                Welcome to your dashboard. Your role is: <strong className="font-semibold text-blue-600 capitalize">{role || 'User'}</strong>
            </p>
            <p className="mt-2 text-gray-600">Select a page from the sidebar to manage patients, appointments, and more.</p>
        </div>
    );
}

export default Dashboard;