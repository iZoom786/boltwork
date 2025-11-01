import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, Video, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface DashboardProps {
  userEmail: string;
  onSignOut: () => void;
}

export default function Dashboard({ userEmail, onSignOut }: DashboardProps) {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  const handleDeployBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deploy-recall-bot`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ meeting_url: meetingUrl }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to deploy bot');
      }

      setStatus({
        type: 'success',
        message: `Bot deployed successfully! Bot ID: ${data.bot_id}`,
      });
      setMeetingUrl('');
    } catch (err) {
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to deploy bot',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Meeting Bot Manager</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{userEmail}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Deploy Meeting Bot</h2>
          <p className="text-slate-600 mb-8">
            Enter a meeting URL to deploy your bot with real-time transcription
          </p>

          {status && (
            <div
              className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
                status.type === 'success'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm ${
                  status.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {status.message}
              </p>
            </div>
          )}

          <form onSubmit={handleDeployBot} className="space-y-6">
            <div>
              <label htmlFor="meetingUrl" className="block text-sm font-medium text-slate-700 mb-2">
                Meeting URL
              </label>
              <input
                id="meetingUrl"
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                required
                placeholder="https://meet.google.com/abc-defg-hij"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
              />
              <p className="mt-2 text-sm text-slate-500">
                Supports Google Meet, Zoom, Microsoft Teams, and other platforms
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Deploying Bot...
                </>
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  Deploy Bot
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Bot joins the meeting automatically</li>
              <li>• Real-time transcription with low latency</li>
              <li>• English language support enabled</li>
              <li>• Full recording and transcript available after meeting</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
