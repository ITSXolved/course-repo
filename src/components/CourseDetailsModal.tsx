import { Course } from '@/lib/types';
import { X, CheckCircle, BookOpen, UserCheck, PlayCircle, Award, Target, LayoutGrid, Download } from 'lucide-react';
import { useState } from 'react';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';

export default function CourseDetailsModal({ course, onClose }: { course: Course, onClose: () => void }) {
  const [isExporting, setIsExporting] = useState(false);

  if (!course) return null;

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const templateEl = document.getElementById(`print-template-${course.id}`);
      if (!templateEl) return;
      
      // Wait for font loading if any
      await new Promise(r => setTimeout(r, 150));

      const canvas = await htmlToImage.toCanvas(templateEl, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        skipFonts: true, // Speeds up if external fonts drag
        style: { transform: 'none' } // guarantee no weird offset
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const totalImgHeightInMm = imgHeight * ratio;

      let heightLeft = totalImgHeightInMm;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalImgHeightInMm);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - totalImgHeightInMm;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalImgHeightInMm);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${course.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_details.pdf`);

    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* Hiding Wrapper: Zero size limits visibility to user, but doesn't infect child's intrinsic rendering styles */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -50 }}>
        {/* PERFECT MALAYALAM CAPATIBLE FORMAL PRINT TEMPLATE */}
        <div 
          id={`print-template-${course.id}`} 
          style={{ width: '210mm', padding: '20mm', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'sans-serif', position: 'relative' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15mm', alignItems: 'flex-start' }}>
            <img src="/logo.png" style={{ height: '22mm', objectFit: 'contain' }} alt="Ayadi Logo" />
            <div style={{ textAlign: 'right', fontSize: '11px', color: '#000', lineHeight: '1.4' }}>
              Orbit Complex, Jafarkhan Colony, Calicut 06,<br/>mail@ayadicloudversity.com
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10mm', fontSize: '11px', color: '#000' }}>
            <thead>
              <tr>
                <th colSpan={2} style={{ border: '1px solid #777', backgroundColor: '#e5e7eb', textAlign: 'center', padding: '8px', fontSize: '14px', fontWeight: 'bold' }}>{course.title}</th>
              </tr>
            </thead>
            <tbody>
              {[
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
              ].map(([label, val]) => (
                <tr key={label}>
                  <td style={{ border: '1px solid #777', padding: '5px 8px', fontWeight: 'bold', width: '35%' }}>{label}</td>
                  <td style={{ border: '1px solid #777', padding: '5px 8px' }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {[
            { title: 'MODULES', content: course.modules },
            { title: 'LEARNING OUTCOMES', content: course.learningOutcomes },
            { title: 'COURSE OUTCOMES', content: course.courseOutcomes },
            { title: 'SPECIAL HIGHLIGHTS', content: course.highlights }
          ].filter(section => !!section.content).map(section => (
            <div key={section.title} style={{ marginBottom: '8mm' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase', color: '#000' }}>{section.title}</h3>
              <div style={{ fontSize: '11px', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#111' }}>
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
        <div id="pdf-content-inner" className="bg-slate-900 border border-slate-700/50 rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl relative custom-scrollbar flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 px-4 sm:px-6 py-4 flex justify-between items-start sm:items-center gap-4">
          <div className="flex-1 pr-12">
            <span className="inline-block px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] sm:text-xs font-semibold rounded-full border border-cyan-500/20 mb-2">
              {course.entity}
            </span>
            <h2 className="heading text-xl sm:text-2xl font-bold text-white leading-tight">{course.title}</h2>
          </div>
          
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 no-print">
            <button 
              onClick={handleExportPdf}
              disabled={isExporting}
              title="Export as PDF"
              className="p-2 rounded-full bg-cyan-900/30 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 hover:bg-cyan-800/40 transition disabled:opacity-50"
            >
              <Download size={20} className={isExporting ? "animate-pulse" : ""} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body (ID used for PDF generation) */}
        <div id={`pdf-content-${course.id}`} className="p-4 sm:p-6 space-y-6 sm:space-y-8 bg-slate-900 flex-1">
          
          <div className="pdf-header-only hidden mb-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">{course.title}</h1>
            <span className="text-cyan-400 text-sm font-semibold">{course.entity}</span>
            <hr className="border-slate-800 mt-4" />
          </div>

          {/* Top Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <StatCard label="Duration" value={course.duration} icon={<CheckCircle size={14} className="sm:w-4 sm:h-4"/>} />
            <StatCard label="Fee structure" value={course.fee} icon={<CheckCircle size={14} className="sm:w-4 sm:h-4"/>} />
            <StatCard label="Live/Recorded" value={course.classFormat} icon={<PlayCircle size={14} className="sm:w-4 sm:h-4"/>} />
            <StatCard label="Students/Batch" value={course.studentsPerBatch} icon={<UserCheck size={14} className="sm:w-4 sm:h-4"/>} />
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Left Column */}
            <div className="space-y-6 sm:space-y-8">
              <Section title="Target Audience" icon={<Target className="text-cyan-400 w-5 h-5 sm:w-6 sm:h-6" />}>
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">{course.targetAudience}</p>
              </Section>
              
              <Section title="Schedule & Method" icon={<CheckCircle className="text-cyan-400 w-5 h-5 sm:w-6 sm:h-6" />}>
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base"><strong className="text-white">Schedule:</strong> {course.schedule}</p>
                <p className="text-slate-300 leading-relaxed mt-2 text-sm sm:text-base"><strong className="text-white">Method:</strong> {course.teachingMethod}</p>
                <p className="text-slate-300 leading-relaxed mt-2 text-sm sm:text-base"><strong className="text-white">Mentorship:</strong> {course.mentorship}</p>
              </Section>
              
              <Section title="Certificates & Recordings" icon={<Award className="text-cyan-400 w-5 h-5 sm:w-6 sm:h-6" />}>
                <div className="flex flex-col gap-2 text-slate-300 text-sm sm:text-base">
                  <div className="flex items-center gap-2">
                    {course.certificate.toLowerCase().includes('yes') ? <CheckCircle size={16} className="text-green-400 min-w-4"/> : <X size={16} className="text-red-400 min-w-4"/> }
                    <span>Certificate Available: {course.certificate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {course.recordings.toLowerCase().includes('yes') ? <CheckCircle size={16} className="text-green-400 min-w-4"/> : <X size={16} className="text-red-400 min-w-4"/> }
                    <span>Recordings Provided: {course.recordings}</span>
                  </div>
                </div>
              </Section>
            </div>

            {/* Right Column */}
            <div className="space-y-6 sm:space-y-8">
              <Section title="Content Summary" icon={<BookOpen className="text-cyan-400 w-5 h-5 sm:w-6 sm:h-6" />}>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">{course.contentSummary}</p>
              </Section>

              <Section title="Modules" icon={<LayoutGrid className="text-cyan-400 w-5 h-5 sm:w-6 sm:h-6" />}>
                <div className="text-slate-300 whitespace-pre-wrap bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800 font-mono text-xs sm:text-sm overflow-x-auto">
                  {course.modules}
                </div>
              </Section>
              
              <Section title="Outcomes & Highlights" icon={<Award className="text-cyan-400 w-5 h-5 sm:w-6 sm:h-6" />}>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">Learning Outcomes</h4>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{course.learningOutcomes}</p>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">Course Outcomes</h4>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{course.courseOutcomes}</p>
                  </div>
                  {course.highlights && (
                    <div className="p-3 sm:p-4 bg-cyan-950/30 border border-cyan-900/50 rounded-xl">
                      <h4 className="text-cyan-300 font-semibold mb-1 text-sm sm:text-base">Special Highlights</h4>
                      <p className="text-cyan-100/70 text-xs sm:text-sm whitespace-pre-wrap">{course.highlights}</p>
                    </div>
                  )}
                </div>
              </Section>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="glass-panel p-4 sm:p-5 rounded-xl sm:rounded-2xl break-inside-avoid">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        {icon}
        <h3 className="heading text-lg sm:text-xl font-semibold text-white">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col items-center text-center justify-center gap-1 sm:gap-2 break-inside-avoid">
      <span className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider font-semibold">{label}</span>
      <div className="flex items-center gap-1 sm:gap-2 text-slate-200 font-medium">
        {icon}
        <span className="text-xs sm:text-sm line-clamp-1">{value || 'N/A'}</span>
      </div>
    </div>
  );
}
