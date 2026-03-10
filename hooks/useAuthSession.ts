import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface UseAuthSessionResult {
  isLoading: boolean;
  session: Session | null;
}

export const useAuthSession = (): UseAuthSessionResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const initializeSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error == null) {
        setSession(data.session);
      }

      setIsLoading(false);
    };

    initializeSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    isLoading,
    session,
  };
};
