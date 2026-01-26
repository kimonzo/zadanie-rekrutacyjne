'use client';

import { useState } from 'react';
import UrlForm from './components/UrlForm';
import LinkList from './components/LinkList';
import PublicFeed from './components/PublicFeed'; // Import the new component

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLinkCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="flex min-h-screen flex-col items-center py-20 px-4 bg-slate-950 text-white overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="z-10 w-full max-w-2xl flex flex-col items-center gap-8">
        <div className="text-center space-y-2 mb-4">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            MiniLink<span className="text-blue-500">.</span>
          </h1>
          <p className="text-slate-500 text-lg">
            Secure, fast, and anonymous URL shortening.
          </p>
        </div>

        {/* 1. Create Link */}
        <UrlForm onSuccess={handleLinkCreated} />

        {/* 2. Your Links */}
        <div className="w-full">
          <h2 className="text-xl font-semibold text-slate-300 mb-4 px-1">Your History</h2>
          <LinkList refreshTrigger={refreshKey} />
        </div>

        {/* Visual Separator */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent my-4"></div>

        {/* 3. Public Global Feed */}
        <PublicFeed />
      </div>
    </main>
  );
}
