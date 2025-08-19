import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// Define the detailed structure of a Patient for TypeScript
interface PatientDetailData {
  _id: string;
  name: string;
  age: number;
  gender: string;
  // Add all other fields you need
  phone?: string;
  email?: string;
  address?: string;
  // ... etc.
}

interface PatientDetailProps {
  patientId: string;
  onBackToList: () => void; // Function to go back to the list view
}

const PatientDetail: React.FC<PatientDetailProps> = ({ patientId, onBackToList }) => {
  const [patient, setPatient] = useState<PatientDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/patients/${patientId}`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch patient details.');
        const data: PatientDetailData = await response.json();
        setPatient(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  if (isLoading) return <div className="text-center p-8">Loading patient details...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (!patient) return <div className="text-center p-8">Patient not found.</div>;

  // This is a simplified form. You can expand it with more fields and an "Edit" mode.
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <button onClick={onBackToList} className="flex items-center text-sm text-blue-600 hover:underline mb-4">
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Patient List
      </button>

      <div className="flex items-center mb-6">
        <img className="h-20 w-20 rounded-full mr-6" src={`https://placehold.co/100x100?text=${patient.name.charAt(0)}`} alt="Patient" />
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{patient.name}</h2>
          <p className="text-gray-500">Patient ID: {patient._id}</p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Personal Information</h3>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-600">Full Name</label>
            <input type="text" id="name" defaultValue={patient.name} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500" readOnly/>
          </div>
           <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-600">Age</label>
            <input type="number" id="age" defaultValue={patient.age} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500" readOnly/>
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-600">Gender</label>
            <input type="text" id="gender" defaultValue={patient.gender} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500" readOnly/>
          </div>
           {/* Add more fields here (Phone, Email, Address, etc.) */}
        </form>
      </div>
    </div>
  );
};

export default PatientDetail;