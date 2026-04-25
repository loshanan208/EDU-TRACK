function PlaceholderPage({ title, description }) {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-slate-600">{description}</p>
    </section>
  );
}

export default PlaceholderPage;
