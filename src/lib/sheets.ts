import Papa from 'papaparse';
import { Course } from './types';

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1vKs0B2Z4VbhlEcpiM8xcYN6Y_9xaJIP22w5LH-MNPtU/export?format=csv";

export async function fetchCourses(): Promise<Course[]> {
  try {
    const response = await fetch(SHEET_CSV_URL, {
      next: { revalidate: 60 }, // Revalidate every minute
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.statusText}`);
    }

    const csvData = await response.text();

    const parsed = Papa.parse<any>(csvData, {
      header: true,
      skipEmptyLines: true,
    });

    const courses: Course[] = parsed.data
      .filter((row: any) => row['Course Title'] && row['Course Title'].trim() !== '')
      .map((row: any, index: number) => ({
        id: `course-${index}-${Date.now()}`,
        timestamp: row['Timestamp'] || '',
        managerName: row['Course Manager Name'] || '',
        phone: row['Phone'] || '',
        entity: row['Courses running under'] || 'General',
        title: row['Course Title']?.trim() || 'Untitled Course',
        duration: row['Duration'] || '',
        targetAudience: row['Who Can Join / Target Audience'] || '',
        fee: row['Course Fee'] || '',
        studentsPerBatch: row['Students Per Batch'] || '',
        classFormat: row['Class Format'] || '',
        schedule: row['Schedule'] || '',
        teachingMethod: row['Teaching Method'] || '',
        mentorship: row['Mentorship Details'] || '',
        recordings: row['Recordings Availability'] || '',
        certificate: row['Certificate Availability'] || '',
        contentSummary: row['Learning Content Summary'] || '',
        modules: row['Modules List'] || '',
        learningOutcomes: row['Learning Outcomes'] || '',
        courseOutcomes: row['Course Outcomes'] || '',
        highlights: row['Special Highlights'] || '',
      }));

    return courses;
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}
