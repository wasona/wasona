// @ts-check
import { spawn } from "child_process";
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

  /** @type {import("child_process").ChildProcessWithoutNullStreams} */
  let server;
  /** @type {number | undefined} */
  let serverPid;

  try {
    const outputDir = "dist/pdfs";
    await fs.mkdir(outputDir, { recursive: true });

    server = spawn("npx", ["serve", "dist", "-p", "3000"], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    serverPid = server.pid;
    console.log(`Started server with PID: ${serverPid}`);

    await new Promise((resolve, reject) => {
      let serverReady = false;

      const timeout = setTimeout(() => {
        if (!serverReady) {
          reject(new Error("Server failed to start within 30 seconds"));
        }
      }, 30000);

      server.stdout?.on("data", (data) => {
        const output = data.toString();
        console.log("Server output:", output);
        if (output.includes("Local:") || output.includes("localhost:3000")) {
          serverReady = true;
          clearTimeout(timeout);
          console.log("Server is ready!");
          resolve(undefined);
        }
      });

      server.stderr?.on("data", (data) => {
        console.error("Server error:", data.toString());
      });

      server.on("error", (error) => {
        clearTimeout(timeout);
        reject(new Error(`Failed to start server: ${error.message}`));
      });

      server.on("exit", (code) => {
        if (!serverReady) {
          clearTimeout(timeout);
          reject(
            new Error(`Server exited with code ${code} before being ready`)
          );
        }
      });
    });

    const page = await browser.newPage();

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

      await page.pdf({
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
    if (serverPid) {
      process.kill(serverPid, "SIGTERM");
    }
    await browser.close();
    console.log("Cleanup complete!");
  }
}

generatePDFs();
