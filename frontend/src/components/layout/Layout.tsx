import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from './Header';
import DoctorDashboard from '@/components/dashboard/DoctorDashboard';
import ReceptionistDashboard from '@/components/dashboard/ReceptionistDashboard';
import ScannerDashboard from '@/components/dashboard/ScannerDashboard';

const Layout = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'doctor':
        return <DoctorDashboard />;
      case 'receptionist':
        return <ReceptionistDashboard />;
      case 'scanner':
        return <ScannerDashboard />;
      default:
        return <div>Invalid user role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default Layout;