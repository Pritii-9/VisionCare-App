import React, { useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface AddPatientPageProps {
  onBackToList: () => void;
  onPatientAdded: () => void;
}

const AddPatientPage: React.FC<AddPatientPageProps> = ({ onBackToList, onPatientAdded }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: 'Male',
    gestationalAge: '',
    birthWeight: '',
    guardianName: '',
    contactNumber: '',
    address: '',
    medicalHistory: '',
    appointmentDate: '',
    appointmentTime: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('http://127.0.0.1:5000/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // No cookies needed for this endpoint; avoid extra CORS constraints
        credentials: 'omit',
        body: JSON.stringify({
          ...formData,
          // Optionally coerce number-like fields
          gestationalAge: formData.gestationalAge ? Number(formData.gestationalAge) : null,
          birthWeight: formData.birthWeight ? Number(formData.birthWeight) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to add patient (HTTP ${res.status}).`);
      }

      onPatientAdded();
      onBackToList();
    } catch (err: any) {
      setError(err.message || 'Failed to add patient.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center">
            <button type="button" onClick={onBackToList} className="flex items-center text-sm text-blue-600 hover:underline mr-4">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to List
            </button>
            <h2 className="text-2xl font-bold text-gray-800">Register New Patient</h2>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isSubmitting ? 'Saving...' : 'Save Patient'}
          </button>
        </div>

        {/* Personal Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">Full Name</label>
            <input name="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 block w-full border rounded-md py-2 px-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} required className="mt-1 block w-full border rounded-md py-2 px-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full border rounded-md py-2 px-3">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        {/* Birth & Vitals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">Gestational Age (weeks)</label>
            <input type="number" name="gestationalAge" value={formData.gestationalAge} onChange={handleChange} className="mt-1 block w-full border rounded-md py-2 px-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Birth Weight (grams)</label>
            <input type="number" name="birthWeight" value={formData.birthWeight} onChange={handleChange} className="mt-1 block w-full border rounded-md py-2 px-3" />
          </div>
        </div>

        {/* Guardian & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">Parent / Guardian Name</label>
            <input name="guardianName" value={formData.guardianName} onChange={handleChange} className="mt-1 block w-full border rounded-md py-2 px-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Contact Number</label>
            <input name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="mt-1 block w-full border rounded-md py-2 px-3" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600">Address</label>
            <input name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full border rounded-md py-2 px-3" />
          </div>
        </div>

        {/* Medical History */}
        <div>
          <label className="block text-sm font-medium text-gray-600">Medical History</label>
          <textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} rows={4} className="mt-1 block w-full border rounded-md py-2 px-3"></textarea>
        </div>
        {/*Appointment details*/}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">Appointment Date</label>
            <input
              type="date"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full border rounded-md py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Appointment Time</label>
            <input
              type="time"
              name="appointmentTime"
              value={formData.appointmentTime}
              onChange={handleChange}
              required
              className="mt-1 block w-full border rounded-md py-2 px-3"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mt-4 text-center">{error}</p>}
      </form>
    </div>
  );
};

export default AddPatientPage;
