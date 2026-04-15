import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Course } from './types';

// Helper to reliably load files into Base64 for jsPDF
const getBase64FromUrl = async (url: string, prefix = false) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        let result = reader.result as string;
        if (!prefix) {
          result = result.split(',')[1]; // remove data url prefix for VFS
        }
        resolve(result);
      };
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    return null;
  }
};

export async function generateCoursePdf(course: Course) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const malayalamFontBase64 = await getBase64FromUrl('/NotoSansMalayalam-Regular.ttf', false);
  if (malayalamFontBase64) {
    doc.addFileToVFS('Malayalam.ttf', malayalamFontBase64);
    doc.addFont('Malayalam.ttf', 'Malayalam', 'normal');
    doc.addFont('Malayalam.ttf', 'Malayalam', 'bold'); // Fallback bold mapping
  }

  const defaultFont = malayalamFontBase64 ? 'Malayalam' : 'helvetica';

  const pageWidth = doc.internal.pageSize.getWidth();
  let startY = 20;

  // 1. HEADER: Try to add Ayadi Logo
  const logoData = await getBase64FromUrl('/logo.png', true);
  
  if (logoData) {
    doc.addImage(logoData, 'PNG', 15, 10, 40, 15);
  } else {
    doc.setFontSize(20);
    doc.setTextColor(34, 51, 85);
    doc.setFont(defaultFont, 'bold');
    doc.text('AYADI', 15, 18);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont(defaultFont, 'normal');
    doc.text('CLOUDVERSITY', 15, 23);
  }
  
  // Right side address
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.setFont(defaultFont, 'normal');
  const addressLines = [
    'Orbit Complex, Jafarkhan Colony, Calicut 06,',
    'mail@ayadicloudversity.com'
  ];
  doc.text(addressLines, pageWidth - 15, 15, { align: 'right' });

  startY += 15; 

  // 2. MAIN TABLE
  const tableData = [
    ['Duration:', course.duration || '-'],
    ['Who Can Join:', course.targetAudience || '-'],
    ['Course Fee:', course.fee || '-'],
    ['Class Format:', course.classFormat || '-'],
    ['Mentorship:', course.mentorship || '-'],
    ['Certificate:', course.certificate || '-'],
    ['Recordings:', course.recordings || '-'],
    ['Schedule:', course.schedule || '-'],
    ['Learning Content:', course.contentSummary || '-'],
    ['Students Per Batch:', course.studentsPerBatch || '-'],
    ['Teaching Method:', course.teachingMethod || '-'],
    ['Manager:', course.managerName || 'Subitha']
  ];

  autoTable(doc, {
    startY: startY,
    theme: 'grid',
    head: [[{ 
        content: course.title, 
        colSpan: 2, 
        styles: { halign: 'center', fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold', font: defaultFont, fontSize: 10 } 
    }]],
    body: tableData,
    styles: {
      font: defaultFont,
      fontSize: 9,
      textColor: [0, 0, 0],
      lineColor: [100, 100, 100],
      lineWidth: 0.1,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'normal' },
    },
    margin: { left: 15, right: 15 }
  });

  startY = (doc as any).lastAutoTable.finalY + 10;

  // 3. SECTIONS
  const pageHeight = doc.internal.pageSize.getHeight();

  const drawSection = (title: string, content: string) => {
    if (!content || content.trim() === '') return;
    
    if (startY > pageHeight - 30) {
      doc.addPage();
      startY = 20;
    }

    doc.setFontSize(10);
    doc.setFont(defaultFont, 'bold');
    doc.text(title.toUpperCase(), 15, startY);
    startY += 5;

    doc.setFontSize(9);
    doc.setFont(defaultFont, 'normal');

    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    lines.forEach((line) => {
      if (startY > pageHeight - 15) {
        doc.addPage();
        startY = 20;
      }
      
      const cleanLine = line.trim();
      const wrappedText = doc.splitTextToSize(cleanLine, pageWidth - 30);
      doc.text(wrappedText, 15, startY);
      
      startY += (wrappedText.length * 4.5) + 1;
    });

    startY += 8;
  };

  drawSection('MODULES', course.modules);
  drawSection('LEARNING OUTCOMES', course.learningOutcomes);
  drawSection('COURSE OUTCOMES', course.courseOutcomes);
  
  if (course.highlights) {
    drawSection('SPECIAL HIGHLIGHTS', course.highlights);
  }

  const fileName = `${course.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_details.pdf`;
  doc.save(fileName);
}
