const featuredCourses = [
  { id: 1, title: "Advanced Web Engineering", level: "Intermediate" },
  { id: 2, title: "Applied Machine Learning", level: "Advanced" },
  { id: 3, title: "Data Visualization Studio", level: "Beginner" },
];

function CoursesPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-white">Courses</h1>
      <p className="mt-4 max-w-3xl text-slate-300">
        Browse a curriculum designed for hands-on, career-ready outcomes.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {featuredCourses.map((course) => (
          <article key={course.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-bold text-cyan-300">{course.title}</h2>
            <p className="mt-2 text-sm text-slate-400">Level: {course.level}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CoursesPage;
