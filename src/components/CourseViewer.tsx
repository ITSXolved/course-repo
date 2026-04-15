"use client";

import { useState, useMemo } from 'react';
import { Course } from '@/lib/types';
import CourseCard from './CourseCard';
import CourseDetailsModal from './CourseDetailsModal';
import { Search, Filter, BookOpen } from 'lucide-react';

export default function CourseViewer({ initialCourses }: { initialCourses: Course[] }) {
  const [courses] = useState<Course[]>(initialCourses);
  const [selectedEntity, setSelectedEntity] = useState<string>('All');
  const [selectedCourseTitle, setSelectedCourseTitle] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);

  const entities = useMemo(() => {
    const list = Array.from(new Set(courses.map(c => c.entity).filter(Boolean)));
    return ['All', ...list];
  }, [courses]);

  const courseTitlesForEntity = useMemo(() => {
    let filteredList = courses;
    if (selectedEntity !== 'All') {
      filteredList = filteredList.filter(c => c.entity === selectedEntity);
    }
    const list = Array.from(new Set(filteredList.map(c => c.title).filter(Boolean)));
    return ['All', ...list];
  }, [courses, selectedEntity]);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchEntity = selectedEntity === 'All' || course.entity === selectedEntity;
      const matchTitle = selectedCourseTitle === 'All' || course.title === selectedCourseTitle;
      
      const searchLower = searchQuery.toLowerCase();
      const matchSearch = searchLower === '' || (
        course.title.toLowerCase().includes(searchLower) ||
        course.targetAudience.toLowerCase().includes(searchLower) ||
        course.modules.toLowerCase().includes(searchLower) ||
        course.highlights.toLowerCase().includes(searchLower) ||
        course.entity.toLowerCase().includes(searchLower)
      );

      return matchEntity && matchTitle && matchSearch;
    });
  }, [courses, selectedEntity, selectedCourseTitle, searchQuery]);

  // If user changes entity to something that doesn't include the current selected track, reset course Title
  if (selectedEntity !== 'All' && selectedCourseTitle !== 'All' && !courseTitlesForEntity.includes(selectedCourseTitle)) {
    setSelectedCourseTitle('All');
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="heading text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-4 pb-2">
          Course Catalog
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Discover a wide range of rigorous courses tailored for every learner. Use the filters below to find exactly what you're looking for.
        </p>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 mb-10">
        
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-900/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
            placeholder="Search courses, modules, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative min-w-[200px]">
            <select
              className="block w-full pl-10 pr-8 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-900/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-sm appearance-none transition-all"
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
            >
              {entities.map(entity => (
                <option key={entity} value={entity}>{entity === 'All' ? 'All Entities' : entity}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div className="relative min-w-[200px]">
            <select
              className="block w-full pl-10 pr-8 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-900/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 sm:text-sm appearance-none transition-all"
              value={selectedCourseTitle}
              onChange={(e) => setSelectedCourseTitle(e.target.value)}
            >
              {courseTitlesForEntity.map(title => (
                <option key={title} value={title}>{title === 'All' ? 'All Courses' : title}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BookOpen className="h-4 w-4 text-slate-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800">
            <BookOpen className="mx-auto h-12 w-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-300">No courses found</h3>
            <p className="mt-1 text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} onClick={() => setActiveCourse(course)} />
            ))}
          </div>
        )}
      </div>

      <div className="text-center mt-12 text-slate-600 text-sm">
        Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
      </div>

      {/* Modal View */}
      {activeCourse && (
        <CourseDetailsModal 
          course={activeCourse} 
          onClose={() => setActiveCourse(null)} 
        />
      )}
    </div>
  );
}
