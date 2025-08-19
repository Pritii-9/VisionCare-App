import React, { useState } from 'react';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientAdded: () => void;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({ isOpen, onClose, onPatientAdded }) => {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [gestationalAge, setGestationalAge] = useState('');
  const [birthWeight, setBirthWeight] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFullName('');
    setDob('');
    setGender('Male');
    setGestationalAge('');
    setBirthWeight('');
    setGuardianName('');
    setContactNumber('');
    setAddress('');
    setMedicalHistory('');
    setAppointmentDate('');
    setAppointmentTime('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/patients",
        {
          fullName,
          dob,
          gender,
          gestationalAge,
          birthWeight,
          guardianName,
          contactNumber,
          address,
          medicalHistory,
          appointmentDate,
          appointmentTime,
        },
        { withCredentials: true }
      );

      console.log("✅ Patient saved:", response.data);

      onPatientAdded(); // refresh parent list
      onClose(); // close modal
      resetForm(); // reset form
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add patient.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Add New Patient</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full border rounded px-3 py-2" />
          <input type="date" placeholder="DOB" value={dob} onChange={(e) => setDob(e.target.value)} required className="w-full border rounded px-3 py-2" />
          <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border rounded px-3 py-2">
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <input type="text" placeholder="Gestational Age (weeks)" value={gestationalAge} onChange={(e) => setGestationalAge(e.target.value)} className="w-full border rounded px-3 py-2" />
          <input type="number" placeholder="Birth Weight (kg)" value={birthWeight} onChange={(e) => setBirthWeight(e.target.value)} className="w-full border rounded px-3 py-2" />
          <input type="text" placeholder="Guardian Name" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} className="w-full border rounded px-3 py-2" />
          <input type="text" placeholder="Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="w-full border rounded px-3 py-2" />
          <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border rounded px-3 py-2" />

          {/* Appointment Date & Time */}
          <input type="date" placeholder="Appointment Date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} required className="w-full border rounded px-3 py-2" />
          <input type="time" placeholder="Appointment Time" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} required className="w-full border rounded px-3 py-2" />

          <textarea placeholder="Medical History" value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)} className="w-full border rounded px-3 py-2" />

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end pt-2">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 mr-2">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
              {isSubmitting ? 'Saving...' : 'Save Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientModal;
