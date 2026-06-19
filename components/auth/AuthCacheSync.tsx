import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { AUTH_USER_ID_QUERY_KEY } from '@/hooks/useAuthUserId';
import { isNil } from '@/utils/validators';

export const AuthCacheSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUserId = session?.user.id ?? null;
      const previousUserId = queryClient.getQueryData<string | null>(AUTH_USER_ID_QUERY_KEY);

      if (previousUserId === nextUserId) {
        return;
      }

      queryClient.setQueryData(AUTH_USER_ID_QUERY_KEY, nextUserId);

      if (isNil(previousUserId)) {
        return;
      }

      queryClient.removeQueries({ queryKey: ['assets', previousUserId] });
      queryClient.removeQueries({ queryKey: ['allocations', previousUserId] });
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [queryClient]);

  return null;
};
