import * as fs from 'fs';
import { chromium } from 'playwright-core';

// Common paths where Microsoft Edge or Google Chrome are installed on Windows
const COMMON_BROWSER_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];

/**
 * Automatically locate Microsoft Edge or Google Chrome executable on the Windows host.
 */
function getExecutablePath(): string {
  for (const path of COMMON_BROWSER_PATHS) {
    if (fs.existsSync(path)) {
      return path;
    }
  }
  throw new Error(
    'Gagal mendeteksi Google Chrome atau Microsoft Edge di sistem lokal Anda. ' +
    'Pastikan salah satu browser tersebut telah terinstal.'
  );
}

interface PdfPageSettings {
  size?: 'A4' | 'A5' | 'thermal-80mm' | 'thermal-58mm' | string;
  orientation?: 'portrait' | 'landscape';
  margin?: string;
}

/**
 * Render HTML to PDF Buffer using Playwright Core with local Chrome/Edge.
 */
export async function renderHtmlToPdf(html: string, pageSettings: PdfPageSettings = {}): Promise<Buffer> {
  const executablePath = getExecutablePath();
  
  console.log(`[PDF Service] Menggunakan browser: ${executablePath}`);
  
  const browser = await chromium.launch({
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    
    // Set the HTML content
    await page.setContent(html, { waitUntil: 'networkidle' });
    
    // Margins
    const marginStr = pageSettings.margin || '12mm';
    const isLandscape = pageSettings.orientation === 'landscape';
    
    let format = 'A4';
    let width: string | undefined;
    let height: string | undefined;
    
    if (pageSettings.size === 'A5') {
      format = 'A5';
    } else if (pageSettings.size === 'thermal-80mm') {
      width = '80mm';
      format = ''; // clear format to allow width/height override
    } else if (pageSettings.size === 'thermal-58mm') {
      width = '58mm';
      format = '';
    }

    const pdfBuffer = await page.pdf({
      format: format ? (format as any) : undefined,
      width,
      height,
      landscape: isLandscape,
      margin: {
        top: marginStr,
        bottom: marginStr,
        left: marginStr,
        right: marginStr,
      },
      printBackground: true,
      preferCSSPageSize: true,
    });

    return pdfBuffer;
  } catch (err: any) {
    console.error('[PDF Service] Error generating PDF:', err);
    throw new Error(`Gagal membuat dokumen PDF: ${err.message}`);
  } finally {
    await browser.close();
  }
}
