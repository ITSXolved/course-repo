import { Course } from '@/lib/types';
import { CalendarDays, Clock, Users, IndianRupee } from 'lucide-react';

export default function CourseCard({ course, onClick }: { course: Course, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="glass-panel rounded-2xl p-6 cursor-pointer hover:bg-slate-800/60 transition-all duration-300 hover:scale-[1.02] flex flex-col h-full relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Users size={80} />
      </div>

      <div className="mb-4 relative z-10">
        <span className="inline-block px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-semibold rounded-full border border-cyan-500/20 mb-3">
          {course.entity}
        </span>
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
