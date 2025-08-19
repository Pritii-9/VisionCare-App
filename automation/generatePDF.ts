// automation/generatePDF.ts
import puppeteer from 'puppeteer';
import path from 'path';

export const generatePatientPDF = async (patientId: string) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`http://localhost:3000/reports/${patientId}`, {
    waitUntil: 'networkidle2',
  });

  const pdfPath = path.resolve(__dirname, 'pdfs', `report-${patientId}.pdf`);
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
  });

  await browser.close();
  console.log(`PDF generated at ${pdfPath}`);
};

generatePatientPDF('12345'); // Replace with actual patient ID