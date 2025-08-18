import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import AddPatientModal from '../components/AddPatientModel';

// Define the structure of a Patient object for TypeScript
interface Patient {
  _id: string; // Assuming MongoDB-style ID, or change to 'id: number' for SQL
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  lastVisit: string;
  status: 'Active' | 'Inactive';
}

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to fetch patients from the API
  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/patients', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch patients.');
      const data: Patient[] = await response.json();
      setPatients(data);
      setFilteredPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Effect to filter patients whenever the search term changes
  useEffect(() => {
    const results = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(results);
  }, [searchTerm, patients]);

  if (isLoading) return <div className="text-center p-8">Loading patients...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white rounded-full py-2 px-4 pl-10 border border-gray-300 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Patient
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-3 px-6 font-medium text-gray-600">Name</th>
              <th className="py-3 px-6 font-medium text-gray-600">Age</th>
              <th className="py-3 px-6 font-medium text-gray-600">Gender</th>
              <th className="py-3 px-6 font-medium text-gray-600">Last Visit</th>
              <th className="py-3 px-6 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient._id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-6">{patient.name}</td>
                <td className="py-3 px-6">{patient.age}</td>
                <td className="py-3 px-6">{patient.gender}</td>
                <td className="py-3 px-6">{patient.lastVisit}</td>
                <td className="py-3 px-6">
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    patient.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    {patient.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPatientAdded={fetchPatients} // Re-fetch patients after a new one is added
      />
    </>
  );
};

export default Patients;