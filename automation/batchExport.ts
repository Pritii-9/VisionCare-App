// automation/batchExport.t
import { generatePatientPDF } from './generatePDF';

const patientIds = ['12345', '67890', '54321']; // Replace with real IDs

const runBatchExport = async () => {
  for (const id of patientIds) {
    try {
      await generatePatientPDF(id);
    } catch (err) {
      console.error(`Failed to export report for patient ${id}:`, err);
    }
  }
};

runBatchExport();