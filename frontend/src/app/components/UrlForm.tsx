'use client';

import { useState } from 'react';
import { api, getAuthToken } from '@/lib/api';

interface UrlFormProps {
  onSuccess: () => void;
}

export default function UrlForm({ onSuccess }: UrlFormProps) {
  const [longUrl, setLongUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiresIn, setExpiresIn] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await getAuthToken();
      await api.post('/urls',
        {
          longUrl,
          alias: alias || null,
          expiresIn: expiresIn || null,
          isPublic
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Clear form on success
      setLongUrl('');
      setAlias('');
      setExpiresIn('');
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
      <div className="space-y-4">
        {/* Long URL Input */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Destination URL</label>
          <input
            type="url"
            required
            placeholder="https://example.com/very-long-link"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Custom Alias */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Custom Alias (Optional)</label>
            <input
              type="text"
              placeholder="my-cool-link"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
            />
          </div>

          {/* Expiration Select */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Expiration</label>
            <select
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
            >
              <option value="">Never</option>
              <option value="1h">1 Hour</option>
              <option value="1d">1 Day</option>
              <option value="1w">1 Week</option>
            </select>
          </div>
        </div>

        {/* Visibility Toggle */}
        <div className="flex items-center gap-3 py-2">
          <input
            type="checkbox"
            id="public-toggle"
            className="w-5 h-5 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          <label htmlFor="public-toggle" className="text-sm font-medium text-slate-300">
            Make this link public (visible in global feed)
          </label>
        </div>

        {error && <p className="text-red-400 text-sm font-medium">⚠️ {error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
        >
          {loading ? 'Shortening...' : 'Shorten URL'}
        </button>
      </div>
    </form>
  );
}
