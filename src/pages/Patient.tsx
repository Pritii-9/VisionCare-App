import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Trash } from '@phosphor-icons/react';
import PatientDetail from './PatientDetail';
import AddPatientPage from './AddPatientPage';

// Define view states
type ViewMode = 'list' | 'detail' | 'add';

interface Patient {
  _id: string;
  name: string;
  age?: number; // Made optional as PatientDetail has a more detailed structure
  gender: string;
  contact: string;
  appointmentStatus: 'Pending' | 'Done';
}

// A simple modal component for delete confirmation
const ConfirmationModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void }> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
        <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
        <p className="mb-6 text-gray-700">Are you sure you want to delete this patient record? This action cannot be undone.</p>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};


const Patients: React.FC = () => {
  const [view, setView] = useState<{ mode: ViewMode; patientId: string | null }>({
    mode: 'list',
    patientId: null,
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);

  // --- Fetch patients ---
  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("http://127.0.0.1:5000/api/patients");
      if (!res.ok) throw new Error("Failed to fetch patients");
      const data = await res.json();
      setPatients(data);
      setFilteredPatients(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // --- Apply search filter ---
  useEffect(() => {
    const filtered = patients.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  // --- Update status in backend ---
  const updateStatus = async (id: string, newStatus: 'Pending' | 'Done') => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/patients/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentStatus: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      // Update local state immediately (optimistic update)
      setPatients((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, appointmentStatus: newStatus } : p
        )
      );
    } catch (err) {
      console.error(err);
      setError("Could not update status!");
    }
  };

  // --- Handle patient deletion ---
  const handleDelete = async (patientId: string) => {
    setPatientToDelete(null); // Clear the patient to delete
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/patients/${patientId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete patient.');
      
      console.log('Patient deleted successfully.');
      fetchPatients(); // Re-fetch the list to show the updated state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };

  // --- View Router ---
  switch (view.mode) {
    case "detail":
      return (
        <PatientDetail
          patientId={view.patientId!}
          onBackToList={() => setView({ mode: "list", patientId: null })}
        />
      );
    case "add":
      return (
        <AddPatientPage
          onBackToList={() => setView({ mode: "list", patientId: null })}
          onPatientAdded={fetchPatients}
        />
      );
    default: // list view
      return (
        <>
          <div className="flex items-center justify-between mb-6">
            {/* Search input */}
            <input
              type="text"
              placeholder="Search patients..."
              className="border rounded-lg px-4 py-2 w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Add patient button */}
            <button
              onClick={() => setView({ mode: "add", patientId: null })}
              className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Patient
            </button>
          </div>

          {/* Patients table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {isLoading && <p className="p-4 text-center">Loading patients...</p>}
            {error && <p className="p-4 text-red-600 text-center">{error}</p>}
            {!isLoading && !error && (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Gender</th>
                    <th className="py-2 px-4">Contact</th>
                    <th className="py-2 px-4">Appointment Status</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr
                      key={patient._id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td
                        className="py-2 px-4 cursor-pointer"
                        onClick={() =>
                          setView({ mode: "detail", patientId: patient._id })
                        }
                      >
                        {patient.name}
                      </td>
                      <td className="py-2 px-4">{patient.gender}</td>
                      <td className="py-2 px-4">{patient.contact}</td>
                      <td className="py-2 px-4">
                        <select
                          value={patient.appointmentStatus}
                          onChange={(e) =>
                            updateStatus(
                              patient._id,
                              e.target.value as "Pending" | "Done"
                            )
                          }
                          className={`px-3 py-1 rounded-lg font-semibold text-sm
                            ${
                              patient.appointmentStatus === "Pending"
                                ? "bg-yellow-200 text-yellow-800"
                                : "bg-green-200 text-green-800"
                            }
                          `}
                        >
                          <option value="Pending">⏳ Pending</option>
                          <option value="Done">✅ Done</option>
                        </select>
                      </td>
                      <td className="py-2 px-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents navigating to detail view
                            setPatientToDelete(patient._id);
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <ConfirmationModal
            isOpen={patientToDelete !== null}
            onClose={() => setPatientToDelete(null)}
            onConfirm={() => handleDelete(patientToDelete!)}
          />
        </>
      );
  }
};

export default Patients;
