import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { isNil } from '@/utils/validators';

export const AUTH_USER_ID_QUERY_KEY = ['auth', 'userId'];

export const useAuthUserId = () => {
  return useQuery<string | null, Error>({
    queryKey: AUTH_USER_ID_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();

      if (isNil(error) === false) {
        throw error;
      }

      return data.session?.user.id ?? null;
    },
  });
};
