import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientAdded: () => void;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({ isOpen, onClose, onPatientAdded }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, age: Number(age), gender }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add patient.');
      }
      
      onPatientAdded(); // Trigger re-fetch in the parent component
      onClose(); // Close the modal on success
      // Reset form
      setName('');
      setAge('');
      setGender('Male');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Add New Patient</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
            <input type="number" id="age" value={age} onChange={(e) => setAge(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
            <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
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