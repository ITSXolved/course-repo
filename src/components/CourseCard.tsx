import { Course } from '@/lib/types';
import { CalendarDays, Clock, Users, IndianRupee } from 'lucide-react';

export default function CourseCard({ course, onClick }: { course: Course, onClick: () => void }) {
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Clean phone number (remove any non-digit characters)
    const phone = course.phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi ${course.managerName}, I would like to get to know more about the course "${course.title}".`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div 
      onClick={onClick}
      className="glass-panel rounded-2xl p-6 cursor-pointer hover:bg-slate-800/60 transition-all duration-300 hover:scale-[1.02] flex flex-col h-full relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Users size={80} />
      </div>

      <div className="mb-4 relative z-10">
        <div className="flex justify-between items-start mb-3">
          <span className="inline-block px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-semibold rounded-full border border-cyan-500/20">
            {course.entity}
          </span>
          <button 
            onClick={handleWhatsAppClick}
            className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-full border border-green-500/20 transition-colors"
            title={`Message ${course.managerName} on WhatsApp`}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </button>
        </div>
        <h3 className="heading text-2xl font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-slate-400 text-sm line-clamp-2">{course.targetAudience}</p>
      </div>

      <div className="mt-auto space-y-3 relative z-10 pt-4 border-t border-slate-700/50">
        <div className="flex items-center text-sm text-slate-300">
          <Clock className="w-4 h-4 mr-2 text-cyan-400" />
          <span>{course.duration || 'Flexible'}</span>
        </div>
        <div className="flex items-center text-sm text-slate-300">
          <CalendarDays className="w-4 h-4 mr-2 text-cyan-400" />
          <span className="truncate">{course.schedule || 'Self-paced'}</span>
        </div>
        <div className="flex items-center text-sm text-slate-300">
          <IndianRupee className="w-4 h-4 mr-2 text-cyan-400" />
          <span>{course.fee ? `${course.fee}` : 'Free / Unspecified'}</span>
        </div>
      </div>
    </div>
  );
}
