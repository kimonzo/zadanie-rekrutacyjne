'use client';

import { useState } from 'react';
import { api, getAuthToken, ShortenResponse } from '@/lib/api';
import { AxiosError } from 'axios';

// Define the Props interface here
interface Props {
  onLinkCreated?: () => void;
}

export default function ShortenerForm({ onLinkCreated }: Props) {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShortUrl(null);

    try {
      const token = await getAuthToken();
      const response = await api.post<ShortenResponse>(
        '/urls',
        { longUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const domain = typeof window !== 'undefined' ? window.location.origin : '';
      setShortUrl(`${domain}/${response.data.shortCode}`);

      // Trigger the refresh of the list below
      if (onLinkCreated) {
        onLinkCreated();
      }

    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>;
      setError(axiosError.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // ... (The rest of the JSX return is the same as before)
  return (
    <div className="w-full bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
          <input
            type="url"
            required
            placeholder="https://example.com/very-long-url..."
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            className="relative w-full bg-slate-950 text-white placeholder:text-slate-500 border border-slate-800 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-lg"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Shortening...
            </span>
          ) : (
            'Shorten URL'
          )}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center text-sm font-medium animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      {shortUrl && (
        <div className="mt-8 p-6 bg-slate-950 border border-green-500/30 rounded-xl relative overflow-hidden group animate-in zoom-in-95 duration-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-emerald-600"></div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Success! Here is your link:
          </p>
          <div className="flex items-center justify-between gap-4 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 font-mono text-lg truncate hover:underline"
            >
              {shortUrl}
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(shortUrl)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
