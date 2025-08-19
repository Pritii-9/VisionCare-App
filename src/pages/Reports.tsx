// src/pages/Reports.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PatientReport from '../components/PatientReport';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';

// Define the type for the basic patient data fetched for the list
interface Patient {
  _id: string;
  name: string;
}

// Main component for the Reports page
const Reports: React.FC = () => {
  // State to hold the list of all patients
  const [patients, setPatients] = useState<Patient[]>([]);
  // State to track if data is loading
  const [loading, setLoading] = useState<boolean>(true);
  // State to hold the ID of the patient whose report is currently being viewed
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  // State to handle any fetch errors
  const [error, setError] = useState<string | null>(null);

  // useEffect hook to fetch the patient list on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/patients');
        setPatients(response.data);
      } catch (err) {
        console.error("Failed to fetch patients:", err);
        setError("Failed to load patient data. Please check the backend connection.");
      } finally {
        setLoading(false);
      }
    };
    // Only fetch if no patient is selected (i.e., we are on the list view)
    if (!selectedPatientId) {
      fetchPatients();
    }
  }, [selectedPatientId]); // Re-run effect if a patient is selected

  // If a patient is selected, render the detailed report component
  if (selectedPatientId) {
    return (
      <PatientReport
        patientId={selectedPatientId}
        onBack={() => setSelectedPatientId(null)} // Provide a function to go back to the list
      />
    );
  }

  // Render the patient list view
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-6 text-gray-800">Patient Reports</h3>
      {loading ? (
        <div className="text-center text-gray-500">Loading patients...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="space-y-4">
          {patients.length > 0 ? (
            patients.map((patient) => (
              <div
                key={patient._id}
                className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow-sm"
              >
                <span className="text-lg font-medium text-gray-700">{patient.name}</span>
                <button
                  onClick={() => setSelectedPatientId(patient._id)}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  View Report
                </button>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">No patients found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;