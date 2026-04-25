import React from "react";

/**
 * Static data representing the courses to be displayed.
 * In a real-world app, this might come from an API or database.
 */
const featuredCourses = [
  { id: 1, title: "Advanced Web Engineering", level: "Intermediate" },
  { id: 2, title: "Applied Machine Learning", level: "Advanced" },
  { id: 3, title: "Data Visualization Studio", level: "Beginner" },
];

function CoursesPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Page Header */}
      <h1 className="text-3xl font-black text-white">Courses</h1>
      <p className="mt-4 max-w-3xl text-slate-300">
        Browse a curriculum designed for hands-on, career-ready outcomes.
      </p>

      {/* Grid Container:
        - Defaults to 1 column on mobile.
        - Switches to 3 columns on medium screens (md:grid-cols-3).
      */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Map through the featuredCourses array to dynamically generate 
          course cards. We use course.id as the 'key' for React's reconciliation.
        */}
        {featuredCourses.map((course) => (
          <article 
            key={course.id} 
            className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 transition-transform hover:scale-[1.02]"
          >
            <h2 className="text-lg font-bold text-cyan-300">{course.title}</h2>
            <p className="mt-2 text-sm text-slate-400">
              Level: <span className="text-slate-200">{course.level}</span>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CoursesPage;