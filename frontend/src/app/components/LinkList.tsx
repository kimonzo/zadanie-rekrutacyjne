'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, getAuthToken, UrlEntry } from '@/lib/api';

export default function LinkList({ refreshTrigger }: { refreshTrigger: number }) {
  const [links, setLinks] = useState<UrlEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const fetchLinks = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await api.get<UrlEntry[]>('/urls', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLinks(response.data);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Failed to fetch links', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const token = await getAuthToken();
      setLinks(prev => prev.filter(link => link.id !== id));

      await api.delete(`/urls/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Delete failed', error);
      alert('Failed to delete link.');
      fetchLinks();
    }
  };

  useEffect(() => {
    fetchLinks();
    const interval = setInterval(fetchLinks, 2000);
    return () => clearInterval(interval);
  }, [refreshTrigger, fetchLinks]);

  if (loading && links.length === 0) return <div className="text-center text-slate-500 mt-8">Loading history...</div>;
  if (links.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="bg-blue-500 w-1.5 h-6 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
        Your Recent Links
      </h2>

      <div className="grid gap-3">
        {links.map((link) => (
          <div key={link.id} className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl flex items-center justify-between group hover:border-slate-700 hover:bg-slate-900/60 transition-all duration-200">
            <div className="overflow-hidden flex-1 min-w-0 mr-4">
              <div className="flex items-center gap-3 mb-1.5">
                <a
                  href={`/${link.shortCode}`}
                  target="_blank"
                  className="text-emerald-400 font-mono font-bold text-lg tracking-tight hover:underline transition-colors"
                >
                  {origin ? `${origin}/${link.shortCode}` : `/${link.shortCode}`}
                </a>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                  {link.clickCount} Clicks
                </span>
              </div>
              <p className="text-slate-500 text-xs truncate">{link.longUrl}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(`${origin}/${link.shortCode}`)}
                className="p-2.5 text-slate-500 hover:text-white hover:bg-blue-600 rounded-xl transition-all bg-slate-800/50"
                title="Copy link"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
              </button>

              <button
                onClick={() => handleDelete(link.id)}
                className="p-2.5 text-slate-500 hover:text-white hover:bg-red-600 rounded-xl transition-all bg-slate-800/50"
                title="Delete link"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
