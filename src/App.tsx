import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { User } from '@supabase/supabase-js';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-pulse text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  return <Dashboard userEmail={user.email || ''} onSignOut={() => setUser(null)} />;
}

export default App;
