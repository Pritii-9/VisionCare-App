import React from 'react';
import {
  ChartBarSquareIcon,
  UsersIcon,
  CalendarDaysIcon,
  ChatBubbleLeftEllipsisIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline'; // Importing outline-style icons

// Define the types for the props this component will receive
interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  logout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, logout }) => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-20 flex items-center px-6">
        <h1 className="text-2xl font-bold text-gray-800">VisionCare</h1>
      </div>
      <nav className="flex-1 px-4 py-2 space-y-2">
        <a href="#" onClick={() => setActivePage('Dashboard')} className={`flex items-center px-4 py-2.5 rounded-lg transition-colors ${activePage === 'Dashboard' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}>
          <ChartBarSquareIcon className="w-6 h-6 mr-3" />
          Dashboard
        </a>
        <a href="#" onClick={() => setActivePage('Patients')} className={`flex items-center px-4 py-2.5 rounded-lg transition-colors ${activePage === 'Patients' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}>
          <UsersIcon className="w-6 h-6 mr-3" />
          Patients
        </a>
        <a href="#" onClick={() => setActivePage('Appointments')} className={`flex items-center px-4 py-2.5 rounded-lg transition-colors ${activePage === 'Appointments' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}>
          <CalendarDaysIcon className="w-6 h-6 mr-3" />
          Appointments
        </a>
        <a href="#" onClick={() => setActivePage('Messages')} className={`flex items-center px-4 py-2.5 rounded-lg transition-colors ${activePage === 'Messages' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}>
          <ChatBubbleLeftEllipsisIcon className="w-6 h-6 mr-3" />
          Messages
        </a>
        <a href="#" onClick={() => setActivePage('Reports')} className={`flex items-center px-4 py-2.5 rounded-lg transition-colors ${activePage === 'Reports' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}>
          <DocumentChartBarIcon className="w-6 h-6 mr-3" />
          Reports
        </a>
      </nav>
      <div className="p-4">
        <button
          onClick={logout}
          className="w-full py-2 px-4 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;