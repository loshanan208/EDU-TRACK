const posts = [
  {
    id: 1,
    title: "How to stay consistent in semester-long projects",
    excerpt: "A practical framework for planning milestones and avoiding burnout.",
  },
  {
    id: 2,
    title: "5 active learning strategies that improve retention",
    excerpt: "Simple habits that turn lectures into long-term understanding.",
  },
];

function BlogPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-white">Blog</h1>
      <p className="mt-4 max-w-3xl text-slate-300">
        Insights, study strategies, and stories from the EDUTrack community.
      </p>

      <div className="mt-8 space-y-4">
        {posts.map((post) => (
          <article key={post.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-bold text-cyan-300">{post.title}</h2>
            <p className="mt-2 text-sm text-slate-300">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default BlogPage;
