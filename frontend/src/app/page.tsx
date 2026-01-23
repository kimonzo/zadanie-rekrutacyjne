import ShortenerForm from "./components/ShortenerForm";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-950">

      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-6 tracking-tight">
            MiniLink
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-light max-w-lg mx-auto leading-relaxed">
            Paste your long link below to get a short, shareable URL instantly.
          </p>
        </div>

        {/* This loads the form component you created earlier */}
        <ShortenerForm />

        <div className="mt-16 text-center">
          <p className="text-slate-600 text-sm font-mono">
            Powered by Symfony 7 & Next.js 15
          </p>
        </div>
      </div>
    </main>
  );
}
