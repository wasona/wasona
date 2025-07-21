import { exec } from "child_process";
import path from "path";

import fs from "fs/promises";
import puppeteer from "puppeteer";

async function generatePDFs() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  try {
    const outputDir = "dist/pdfs";
    await fs.mkdir(outputDir, { recursive: true });

    const server = exec("npx serve dist -p 3000");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const page = await browser.newPage();

    const pdfOptions = {
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
      displayHeaderFooter: false,
      preferCSSPageSize: true,
    };

    const variants = [
      { route: "/en/pdf", filename: "Wasona-EN.pdf" },
      { route: "/de/pdf", filename: "Wasona-DE.pdf" },
      { route: "/ru/pdf", filename: "Wasona-RU.pdf" },
    ];

    for (const variant of variants) {
      console.log(`Generating PDF from ${variant.route}...`);
      await page.goto(`http://localhost:3000${variant.route}`, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      await page.waitForTimeout(2000);

      await page.pdf({
        ...pdfOptions,
        path: path.join(outputDir, variant.filename),
      });

      console.log(`PDF generated: ${variant.filename}`);
    }

    console.log("PDF generation complete!");

    server.kill();
  } catch (error) {
    console.error("Error generating PDFs:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

generatePDFs();
