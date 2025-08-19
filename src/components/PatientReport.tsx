// src/components/PatientReport.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DocumentArrowDownIcon, ChevronLeftIcon } from '@heroicons/react/24/solid';

// Define the props for this component
interface PatientReportProps {
  patientId: string;
  onBack: () => void;
}

// Define the type for the detailed patient report data
interface PatientReportData {
  name: string;
  dateOfBirth: string;
  gender: string;
  examinationDate: string;
  visualAcuity: string;
  intraocularPressure: string;
  diseaseSeverity: string;
  diagnosticResults: string;
  recommendations: string;
}

const PatientReport: React.FC<PatientReportProps> = ({ patientId, onBack }) => {
  // State to hold the detailed report data
  const [report, setReport] = useState<PatientReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect hook to fetch the specific patient's report
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/patients/${patientId}`);
        setReport(response.data);
      } catch (err) {
        console.error("Error fetching patient report:", err);
        setError("Failed to fetch patient report.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [patientId]); // Re-run if the patient ID changes

  // Helper function to determine the color for the severity badge
  const getSeverityColor = (severity?: string): string => {
  if (!severity) return 'bg-gray-400'; // fallback color
  switch (severity.toLowerCase()) {
    case 'mild':
      return 'bg-green-500';
    case 'moderate':
      return 'bg-yellow-500';
    case 'severe':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
};

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading report...</div>;
  }

  if (error || !report) {
    return <div className="p-8 text-center text-red-500">{error || "Report not found."}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center px-4 py-2 mb-6 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
      >
        <ChevronLeftIcon className="w-5 h-5 mr-2" />
        Back to Reports List
      </button>

      {/* Main Report Card */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Patient Report</h1>
        <p className="text-gray-600 mb-8">Comprehensive analysis of patient's eye health</p>

        {/* Patient Information */}
        <div className="border-b pb-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Patient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8 text-gray-700">
            <div>
              <p className="text-sm font-medium">Patient Name</p>
              <p className="text-lg font-bold">{report.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Date of Birth</p>
              <p className="text-lg font-bold">{report.dateOfBirth}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Gender</p>
              <p className="text-lg font-bold">{report.gender}</p>
            </div>
          </div>
        </div>

        {/* Examination Details */}
        <div className="border-b pb-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Examination Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-gray-700">
            <div>
              <p className="text-sm font-medium">Examination Date</p>
              <p className="text-lg font-bold">{report.examinationDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Visual Acuity</p>
              <p className="text-lg font-bold">{report.visualAcuity}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Intraocular Pressure</p>
              <p className="text-lg font-bold">{report.intraocularPressure}</p>
            </div>
          </div>
        </div>

        {/* Diagnostic Results */}
        <div className="border-b pb-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Diagnostic Results</h2>
          <div className="mb-4">
            <p className="text-sm font-medium">Disease Severity</p>
            <span
              className={`inline-block px-4 py-1 mt-2 text-white font-bold rounded-lg ${getSeverityColor(
                report.diseaseSeverity
              )}`}
            >
              {report.diseaseSeverity}
            </span>
          </div>
          <p className="text-gray-700">{report.diagnosticResults}</p>
        </div>

        {/* Recommendations */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recommendations</h2>
          <p className="text-gray-700">{report.recommendations}</p>
        </div>

        <button className="flex items-center px-6 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
          Download Report
        </button>
      </div>
    </div>
  );
};

export default PatientReport;