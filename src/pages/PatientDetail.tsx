import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Trash, CloudArrowUp } from '@phosphor-icons/react';

// Define the detailed structure of a Patient for TypeScript
interface PatientDetailData {
  _id: string;
  name: string;
  dob: string;
  gender: string;
  gestationalAge: string;
  birthWeight: string;
  guardianName: string;
  contactNumber: string;
  address: string;
  medicalHistory: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentStatus: string;
  images: string[]; // Updated field for multiple image URLs
}

interface PatientDetailProps {
  patientId: string;
  onBackToList: () => void; // Function to go back to the list view
  userRole: string | null; // Pass the user role as a prop
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


const PatientDetail: React.FC<PatientDetailProps> = ({ patientId, onBackToList, userRole }) => {
  const [patient, setPatient] = useState<PatientDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetches patient details from the backend API
  const fetchPatient = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/patients/${patientId}`);
      if (!response.ok) throw new Error('Failed to fetch patient details.');
      const data: PatientDetailData = await response.json();
      setPatient(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [patientId]);

  // Handles the deletion of a patient
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/patients/${patientId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete patient.');
      
      console.log('Patient deleted successfully.');
      onBackToList(); // Navigate back to the patient list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Handles the image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  // Handles the image upload
  const handleImageUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setError('Please select one or more images to upload.');
      return;
    }

    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    for (const file of Array.from(selectedFiles)) {
      formData.append('files[]', file);
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/patients/${patientId}/images/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload images.');
      }

      console.log('Images uploaded successfully.');
      await fetchPatient(); // Refresh patient data to show the new images
      setSelectedFiles(null); // Clear the selected files
    } catch (err) {
      console.error('Image upload error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };


  if (isLoading) return <div className="text-center p-8">Loading patient details...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (!patient) return <div className="text-center p-8">Patient not found.</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto my-8">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBackToList} className="flex items-center text-sm text-blue-600 hover:underline">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Patient List
        </button>
        {/* 🟢 Now, only Doctors and Receptionists can delete a patient */}
        {(userRole === 'Doctor' || userRole === 'Receptionist') && (
          <button onClick={() => setShowDeleteModal(true)} className="flex items-center text-sm text-red-600 hover:text-red-800 transition-colors">
            <Trash className="w-4 h-4 mr-2" />
            Delete Patient
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start mb-6 border-b pb-6">
        <div className="relative w-32 h-32 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 text-gray-500 text-6xl font-bold shrink-0">
          {patient.images && patient.images.length > 0 ? (
            <img className="object-cover w-full h-full" src={patient.images[0]} alt="Patient" />
          ) : (
            <span>{patient.name.charAt(0)}</span>
          )}
        </div>
        <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
          <h2 className="text-3xl font-bold text-gray-800">{patient.name}</h2>
          <p className="text-gray-500">Patient ID: {patient._id}</p>
        </div>
      </div>
      
      {/* 🟢 Image Gallery Section (visible to all) */}
      {patient.images && patient.images.length > 0 && (
        <div className="mb-8 border-b pb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Patient Photos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {patient.images.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden shadow-sm">
                <img src={image} alt={`Patient photo ${index + 1}`} className="object-cover w-full h-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🟢 Image Upload Section (visible only to Scanner) */}
      {userRole === 'Scanner' && (
        <div className="mb-8 border-b pb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Upload New Photos</h3>
          <div className="flex items-center space-x-4">
            <label htmlFor="image-upload" className="block text-sm font-medium text-gray-600">Choose Image(s):</label>
            <input
              type="file"
              id="image-upload"
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors cursor-pointer"
            />
            <button
              onClick={handleImageUpload}
              disabled={!selectedFiles || selectedFiles.length === 0 || isUploading}
              className="flex items-center px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isUploading ? (
                <>
                  <CloudArrowUp className="w-5 h-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CloudArrowUp className="w-5 h-5 mr-2" />
                  Upload Image
                </>
              )}
            </button>
          </div>
          {error && <p className="text-sm text-red-600 font-medium mt-2">{error}</p>}
        </div>
      )}

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Personal Information</h3>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-600">Full Name</label>
            <input type="text" id="name" defaultValue={patient.name} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500" readOnly/>
          </div>
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-600">Date of Birth</label>
            <input type="text" id="dob" defaultValue={patient.dob} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500" readOnly/>
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-600">Gender</label>
            <input type="text" id="gender" defaultValue={patient.gender} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500" readOnly/>
          </div>
          <div>
            <label htmlFor="gestationalAge" className="block text-sm font-medium text-gray-600">Gestational Age</label>
            <input type="text" id="gestationalAge" defaultValue={patient.gestationalAge} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500" readOnly/>
          </div>
          <div>
            <label htmlFor="birthWeight" className="block text-sm font-medium text-gray-600">Birth Weight</label>
            <input type="text" id="birthWeight" defaultValue={patient.birthWeight} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500" readOnly/>
          </div>
          <div>
            <label htmlFor="guardianName" className="block text-sm font-medium text-gray-600">Guardian Name</label>
            <input type="text" id="guardianName" defaultValue={patient.guardianName} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500" readOnly/>
          </div>
          <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-600">Contact Number</label>
            <input type="text" id="contactNumber" defaultValue={patient.contactNumber} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500" readOnly/>
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-600">Address</label>
            <input type="text" id="address" defaultValue={patient.address} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500" readOnly/>
          </div>
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-600">Medical History</label>
            <textarea id="medicalHistory" defaultValue={patient.medicalHistory} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500" readOnly/>
          </div>
        </form>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default PatientDetail;
