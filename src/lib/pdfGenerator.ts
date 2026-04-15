import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Course } from './types';

// Helper to reliably load image as Base64 for jsPDF
const getBase64ImageFromUrl = async (url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
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

  const pageWidth = doc.internal.pageSize.getWidth();
  let startY = 20;

  // 1. HEADER: Try to add Ayadi Logo
  const logoData = await getBase64ImageFromUrl('/logo.png');
  
  if (logoData) {
    // Determine reasonable dimensions maintaining aspect ratio, usually height ~15mm
    doc.addImage(logoData, 'PNG', 15, 10, 40, 15);
  } else {
    // Fallback styled text
    doc.setFontSize(20);
    doc.setTextColor(34, 51, 85); // Navy
    doc.setFont('helvetica', 'bold');
    doc.text('AYADI', 15, 18);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('CLOUDVERSITY', 15, 23);
  }
  
  // Right side address
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  const addressLines = [
    'Orbit Complex, Jafarkhan Colony, Calicut 06,',
    'mail@ayadicloudversity.com'
  ];
  doc.text(addressLines, pageWidth - 15, 15, { align: 'right' });

  startY += 15; // move below header

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
    ['Manager:', course.managerName || 'Subitha'] // Fallback to provided image baseline
  ];

  autoTable(doc, {
    startY: startY,
    theme: 'grid',
    head: [[{ 
        content: course.title, 
        colSpan: 2, 
        styles: { halign: 'center', fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold', font: 'helvetica', fontSize: 10 } 
    }]],
    body: tableData,
    styles: {
      font: 'helvetica',
      fontSize: 9,
      textColor: [0, 0, 0],
      lineColor: [100, 100, 100], // darker border to match formal aesthetic
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
    
    // Header spacing
    if (startY > pageHeight - 30) {
      doc.addPage();
      startY = 20;
    }

    // Draw Section Header
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), 15, startY);
    startY += 5;

    // Draw Content line by line to approximate numbered formatting
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Split logic: breaks at newlines, then attempts to list items natively
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    lines.forEach((line) => {
      if (startY > pageHeight - 15) {
        doc.addPage();
        startY = 20;
      }
      
      const cleanLine = line.trim();
      const wrappedText = doc.splitTextToSize(cleanLine, pageWidth - 30);
      doc.text(wrappedText, 15, startY);
      
      // Move Y down by line count (roughly 4.5mm per line of standard font)
      startY += (wrappedText.length * 4.5) + 1;
    });

    startY += 8; // Spacer between sections
  };

  drawSection('MODULES', course.modules);
  drawSection('LEARNING OUTCOMES', course.learningOutcomes);
  drawSection('COURSE OUTCOMES', course.courseOutcomes);
  
  if (course.highlights) {
    drawSection('SPECIAL HIGHLIGHTS', course.highlights);
  }

  // Export
  const fileName = `${course.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_details.pdf`;
  doc.save(fileName);
}
