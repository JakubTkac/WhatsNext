export default function Loading() {
  return (
    <main className="flex min-h-screen animate-pulse flex-col px-5 py-6 sm:px-8 lg:px-12">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <div className="h-6 w-28 rounded-full bg-slate-200" />
        <div className="h-7 w-24 rounded-full bg-slate-200" />
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center py-16 sm:py-24">
        <div className="h-4 w-48 rounded-full bg-emerald-200" />
        <div className="mt-5 h-12 max-w-2xl rounded-xl bg-slate-200 sm:h-16" />
        <div className="mt-3 h-12 w-3/4 max-w-xl rounded-xl bg-slate-200 sm:h-16" />
        <div className="mt-7 h-5 w-full max-w-xl rounded-full bg-slate-200" />
        <div className="mt-3 h-5 w-4/5 max-w-lg rounded-full bg-slate-200" />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((card) => (
            <div
              key={card}
              className="h-44 rounded-2xl border border-slate-200 bg-white/70 p-6"
            >
              <div className="h-3 w-32 rounded-full bg-slate-200" />
              <div className="mt-8 h-6 w-40 rounded-full bg-slate-200" />
              <div className="mt-4 h-4 w-full rounded-full bg-slate-100" />
              <div className="mt-2 h-4 w-3/4 rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
