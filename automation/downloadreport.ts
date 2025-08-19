// automation/downloadReport.ts
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const downloadPatientReport = async (patientId: string) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const downloadPath = path.resolve(__dirname, 'downloads');
  fs.mkdirSync(downloadPath, { recursive: true });

  // Enable download behavior
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath,
  });

  // Navigate to the report page
  await page.goto(`http://localhost:3000/reports/${patientId}`, {
    waitUntil: 'networkidle2',
  });

  // Click the download button
  await page.click('button:has-text("Download Report")');

  // Wait for download to complete
  await page.waitForTimeout(5000);

  await browser.close();
  console.log(`Report for patient ${patientId} downloaded to ${downloadPath}`);
};

downloadPatientReport('12345'); // Replace with actual patient ID