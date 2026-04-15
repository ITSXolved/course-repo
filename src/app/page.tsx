import { fetchCourses } from '@/lib/sheets';
import CourseViewer from '@/components/CourseViewer';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const courses = await fetchCourses();

  return (
    <main>
      <CourseViewer initialCourses={courses} />
    </main>
  );
}
