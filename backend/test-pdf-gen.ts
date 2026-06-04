import { PdfService } from './src/wellness-reports/pdf.service';
import * as fs from 'fs';
import * as path from 'path';

async function testPdf() {
  const pdfService = new PdfService();
  const data = {
    practice: {
      name: 'Test Practice',
      logo_url: 'https://via.placeholder.com/150',
    },
    patient: {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      dob: '1980-01-01',
    },
    protocol: {
      name: 'BPC-157 Protocol',
    },
    content: {
      summary: '<p>John is a good candidate for BPC-157 therapy.</p>',
      recommendations: ['Take 250mcg twice daily', 'Monitor for 4 weeks'],
      detailed_analysis: '<p>Patient shows signs of chronic inflammation.</p>',
    },
    theme: {
      primaryColor: '#e74c3c',
    },
  };

  try {
    console.log('Generating PDF...');
    const buffer = await pdfService.generateWellnessReportPdf(data);
    const outputPath = path.join(__dirname, 'test-report.pdf');
    fs.writeFileSync(outputPath, buffer);
    console.log(`PDF generated successfully: ${outputPath}`);
  } catch (error) {
    console.error('PDF generation failed:', error);
  }
}

testPdf();
