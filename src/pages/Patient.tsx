import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import PatientDetail from './PatientDetail';
import AddPatientPage from './AddPatientPage';

// Define view states
type ViewMode = 'list' | 'detail' | 'add';

interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  appointmentStatus: 'Pending' | 'Done';
}

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
      alert("Could not update status!");
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
            {isLoading && <p className="p-4">Loading patients...</p>}
            {error && <p className="p-4 text-red-600">{error}</p>}
            {!isLoading && !error && (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Age</th>
                    <th className="py-2 px-4">Gender</th>
                    <th className="py-2 px-4">Contact</th>
                    <th className="py-2 px-4">Appointment Status</th>
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
                      <td className="py-2 px-4">{patient.age}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      );
  }
};

export default Patients;
