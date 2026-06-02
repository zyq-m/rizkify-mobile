import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { setAuth, setUser, reset } = useAuthStore();

  const registerMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; phone: string; password: string }) => {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;

      if (authData.user) {
        const { error: dbError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: data.email,
          name: data.name,
          phone: data.phone,
        });
        if (dbError) throw dbError;
      }

      return authData;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.session);
      queryClient.setQueryData(['user'], data.user);
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;

      return authData;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.session);
      queryClient.setQueryData(['user'], data.user);
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      reset();
      queryClient.clear();
      router.replace('/(screen)/login');
    },
  });

  return {
    register: registerMutation,
    login: loginMutation,
    logout: logout,
  };
};
