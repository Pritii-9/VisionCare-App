import React, { useState } from 'react';
import { X } from '@phosphor-icons/react';

// Define the shape of the props
interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientAdded: () => void;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({ isOpen, onClose, onPatientAdded }) => {
  // Form state for patient and appointment details
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

  // Resets all form fields to their initial empty state
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
    setError(null);
  };

  /**
   * Simulates a backend API call to add a new patient and appointment.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Basic validation
    if (!fullName || !dob || !gender || !contactNumber || !appointmentDate || !appointmentTime) {
      setError("Please fill out all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate a POST request to add a patient and an appointment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // We'll update the mock data directly here, as this component
      // will be responsible for creating the new data.
      let newPatientId = `patient-${Math.random().toString(36).substring(2, 9)}`;
      let newAppointmentId = `app-${Math.random().toString(36).substring(2, 9)}`;

      // A mock data store is not accessible from here as a separate file.
      // In a real app, this would be an API call. For this example,
      // we'll assume the onPatientAdded callback handles the data update.

      console.log("✅ Patient and appointment submitted successfully.");

      // Success actions
      onPatientAdded();
      onClose();
      resetForm();
    } catch (err) {
      setError("Failed to add patient. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add New Patient</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
          <input type="date" placeholder="DOB" value={dob} onChange={(e) => setDob(e.target.value)} required className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
          <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input type="text" placeholder="Gestational Age (weeks)" value={gestationalAge} onChange={(e) => setGestationalAge(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
          <input type="number" placeholder="Birth Weight (kg)" value={birthWeight} onChange={(e) => setBirthWeight(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
          <input type="text" placeholder="Guardian Name" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
          <input type="tel" placeholder="Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
          <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
          <textarea placeholder="Medical History" value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} required className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
            <input type="time" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} required className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
          </div>
          {error && <p className="text-sm text-red-600 font-medium mt-2">{error}</p>}
          <div className="flex justify-end pt-2 space-x-2">
            <button
              type="button"
              onClick={() => { onClose(); resetForm(); }}
              className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isSubmitting ? 'Saving...' : 'Save Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientModal;
