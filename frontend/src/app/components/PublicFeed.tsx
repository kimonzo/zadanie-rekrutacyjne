'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface PublicLink {
  shortCode: string;
  longUrl: string;
  clickCount: number;
  createdAt: string;
}

export default function PublicFeed() {
  const [links, setLinks] = useState<PublicLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPublicLinks = async () => {
    try {
      // No auth header needed for public list
      const response = await api.get('/public');
      setLinks(response.data);
    } catch (error) {
      console.error('Failed to load public feed', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicLinks();

    // Auto-refresh every 5 seconds to see new links live
    const interval = setInterval(fetchPublicLinks, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && links.length === 0) {
    return <div className="text-center text-slate-500 py-10">Loading global feed...</div>;
  }

  return (
    <div className="w-full max-w-2xl mt-12">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        🌍 Global Feed
        <span className="text-xs font-normal text-slate-500 bg-slate-900 px-2 py-1 rounded-full border border-slate-800">
          Live
        </span>
      </h2>

      <div className="space-y-3">
        {links.length === 0 ? (
          <p className="text-slate-500 italic">No public links yet. Be the first!</p>
        ) : (
          links.map((link) => (
            <div
              key={link.shortCode}
              className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors"
            >
              <div className="overflow-hidden">
                <div className="flex items-center gap-3 mb-1">
                  {/* --- FIX IS HERE --- */}
                  {/* We use a relative path '/' so it goes to localhost:3000/CODE */}
                  <a
                    href={`/${link.shortCode}`}
                    target="_blank"
                    className="text-blue-400 hover:text-blue-300 font-mono font-medium truncate"
                  >
                    /{link.shortCode}
                  </a>
                  {/* ------------------- */}

                  <span className="text-slate-600 text-xs">• {link.clickCount} clicks</span>
                </div>
                <p className="text-slate-500 text-xs truncate max-w-md">{link.longUrl}</p>
              </div>

              <div className="text-slate-600 text-xs whitespace-nowrap">
                {new Date(link.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
