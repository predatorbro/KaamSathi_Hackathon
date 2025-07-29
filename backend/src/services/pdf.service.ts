// src/services/pdf.service.ts
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

export class PdfService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async generateResumePdf(resumeData: any): Promise<Buffer> {
        const templatePath = path.join(__dirname, '../templates/resume.hbs');
        const templateSource = await fs.readFile(templatePath, 'utf-8');
        const template = handlebars.compile(templateSource);
        const html = template(resumeData);

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        await page.setContent(html);
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
        });

        await browser.close();
        return Buffer.from(pdfBuffer);
    }
}