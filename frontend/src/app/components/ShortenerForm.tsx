'use client';

import { useState } from 'react';
import { api, getUserId, ShortenResponse, ShortenPayload } from '@/lib/api';
import { AxiosError } from 'axios';

export default function ShortenerForm() {
  const [longUrl, setLongUrl] = useState<string>('');
  const [shortCode, setShortCode] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShortCode(null);

    try {
      // We explicitly tell Axios that the return body is 'ShortenResponse'
      // and the payload is 'ShortenPayload'
      const response = await api.post<ShortenResponse, { data: ShortenResponse }, ShortenPayload>('/urls', {
        longUrl,
        userUuid: getUserId(),
      });

      setShortCode(response.data.shortCode);
      setLongUrl('');
    } catch (err: unknown) {
      // Type-safe error handling
      if (err instanceof AxiosError) {
        // Now we know it's an Axios error
        const errorMessage = err.response?.data?.error || 'Server connection failed.';
        setError(errorMessage);
      } else if (err instanceof Error) {
        // Standard JS error
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="url-input" className="text-sm font-medium text-gray-300 ml-1">
          Paste your long URL
        </label>
        <div className="relative">
          <input
            id="url-input"
            type="url"
            placeholder="https://example.com/very-long-link..."
            className="w-full p-4 bg-slate-800 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white placeholder-slate-500 transition-all"
            value={longUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLongUrl(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </span>
          ) : (
            '✨ Shorten URL'
          )}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">
          {error}
        </div>
      )}

      {shortCode && (
        <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center animate-pulse-once">
          <p className="text-emerald-400 text-sm font-medium mb-2">🚀 Your Link is Ready!</p>
          <div className="flex items-center justify-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
            <code className="text-xl text-white font-mono tracking-wide">
              http://localhost:3000/{shortCode}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(`http://localhost:3000/${shortCode}`)}
              className="p-2 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white"
              title="Copy to clipboard"
            >
              📋
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
