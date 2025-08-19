import React, { useState, useEffect } from 'react';
import { CircleNotch, UserPlus } from '@phosphor-icons/react';

// Define the shape of the data we expect to receive from the API.
interface PatientWithAppointment {
  _id: string;
  name: string;
  contact: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentStatus: 'Scheduled' | 'Completed' | 'Cancelled' | 'Pending';
}

const AppointmentsPage: React.FC<{ onOpenModal: () => void; refreshTrigger: boolean }> = ({ onOpenModal, refreshTrigger }) => {
  const [patients, setPatients] = useState<PatientWithAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all patient records from the backend API.
   * This function sends a GET request to the /api/patients endpoint
   * and populates the component's state with the returned data.
   */
  const fetchPatients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/patients');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
      setError("Failed to fetch appointments. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data on initial component mount and whenever a new patient is added
    fetchPatients();
  }, [refreshTrigger]);

  /**
   * Handles the status update for an appointment directly on the patient object.
   * This function sends a PATCH request to the backend to update the status.
   */
  const handleStatusChange = async (patientId: string, newStatus: string) => {
    // Optimistically update the UI for a faster user experience
    setPatients(prev =>
      prev.map(p =>
        p._id === patientId ? { ...p, appointmentStatus: newStatus as PatientWithAppointment['appointmentStatus'] } : p
      )
    );

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/patients/${patientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentStatus: newStatus })
      });
      if (!response.ok) {
        // If the API call fails, throw an error to trigger the catch block
        throw new Error('Failed to update status');
      }
      console.log(`Successfully updated patient ${patientId} appointment status to: ${newStatus}`);
    } catch (err) {
      console.error('Failed to update status:', err);
      // If the API call fails, revert the UI and show an error message
      setError("Failed to update status. Please refresh the page.");
      fetchPatients(); // Re-fetch to get the true state from the backend
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full">
        <CircleNotch size={48} className="animate-spin text-gray-400" />
        <p className="mt-4 text-gray-600">Loading appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500 font-medium">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden p-6 mx-auto my-8 max-w-7xl w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Today's Appointments</h2>
        <button
          onClick={onOpenModal}
          className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={20} className="mr-2" /> Add Patient
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full text-left table-auto">
          <thead className="bg-gray-100 border-b-2 border-gray-200">
            <tr>
              <th className="py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider">Patient Name</th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Contact</th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Date</th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Time</th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-medium text-gray-900">{patient.name}</td>
                <td className="py-4 px-6 text-gray-700 hidden md:table-cell">{patient.contact}</td>
                <td className="py-4 px-6 text-gray-700 hidden sm:table-cell">{patient.appointmentDate}</td>
                <td className="py-4 px-6 text-gray-700 hidden sm:table-cell">{patient.appointmentTime}</td>
                <td className="py-4 px-6">
                  <select
                    value={patient.appointmentStatus}
                    onChange={(e) => handleStatusChange(patient._id, e.target.value)}
                    className={`border-2 rounded-lg py-2 px-4 text-sm font-semibold focus:outline-none transition-colors cursor-pointer w-full
                      ${patient.appointmentStatus === 'Scheduled' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        patient.appointmentStatus === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' :
                        patient.appointmentStatus === 'Cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
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
    </div>
  );
};

export default AppointmentsPage;
