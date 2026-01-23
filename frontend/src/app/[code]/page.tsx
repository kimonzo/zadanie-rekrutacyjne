import { redirect } from "next/navigation";

export default async function RedirectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  // 1. Get the code from the URL
  const { code } = await params;

  let longUrl: string | null = null;

  try {
    // 2. Ask Symfony for the real URL
    const res = await fetch(`http://127.0.0.1:8000/api/urls/${code}`, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      longUrl = data.longUrl;
    }
  } catch (error) {
    console.error("Backend connection failed:", error);
  }

  // 3. Redirect if found
  if (longUrl) {
    redirect(longUrl);
  }

  // 4. Show 404 if not found
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        <p className="text-xl text-slate-300 mb-8">Link not found or expired.</p>
        <a href="/" className="px-6 py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-500 transition">
          Go Home
        </a>
      </div>
    </div>
  );
}
