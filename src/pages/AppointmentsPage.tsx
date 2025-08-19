import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Define the shape of the data coming from your aggregation pipeline
interface AppointmentWithPatient {
  _id: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  patientName: string;
  patientContact: string;
}

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch all appointments ---
  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/appointments", { withCredentials: true });
      setAppointments(response.data);
    } catch (err) {
      setError("Failed to fetch appointments. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // --- Handle status updates ---
  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    // Optimistically update the UI for a faster user experience
    setAppointments(prev =>
      prev.map(app =>
        app._id === appointmentId ? { ...app, status: newStatus as AppointmentWithPatient['status'] } : app
      )
    );

    try {
      await axios.put(
        `http://127.0.0.1:5000/api/appointments/${appointmentId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
    } catch (err) {
      // If the API call fails, revert the change and show an error
      setError("Failed to update status. Please refresh the page.");
      fetchAppointments(); // Re-fetch to get the true state
    }
  };

  if (isLoading) return <div className="text-center p-8">Loading appointments...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="py-3 px-6 font-medium text-gray-600">Patient Name</th>
            <th className="py-3 px-6 font-medium text-gray-600">Contact</th>
            <th className="py-3 px-6 font-medium text-gray-600">Date</th>
            <th className="py-3 px-6 font-medium text-gray-600">Time</th>
            <th className="py-3 px-6 font-medium text-gray-600">Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((app) => (
            <tr key={app._id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-6">{app.patientName}</td>
              <td className="py-3 px-6">{app.patientContact}</td>
              <td className="py-3 px-6">{app.appointmentDate}</td>
              <td className="py-3 px-6">{app.appointmentTime}</td>
              <td className="py-3 px-6">
                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app._id, e.target.value)}
                  className={`border rounded-md py-1 px-2 text-sm focus:outline-none ${
                    app.status === 'Scheduled' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    app.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' :
                    'bg-gray-200 text-gray-800 border-gray-300'
                  }`}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentsPage;