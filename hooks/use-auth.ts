import { authAPI } from '@/api/service';
import { useAuthStore } from '@/store/auth-store';
import { tokenStorage } from '@/utils/tokenStorage';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { login, logout: clearAuthStore, token } = useAuthStore();

  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: async (data) => {
      const { user, token } = data.data;
      await tokenStorage.setTokens(token);
      queryClient.setQueryData(['user'], user);
    },
  });

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: async (data) => {
      const { user, token } = data.data;

      login(user, token);
      queryClient.setQueryData(['user'], user);
    },
  });

  const logout = useMutation({
    mutationFn: () => authAPI.logout({ refreshToken: token!.refreshToken }),
    onSuccess: async () => {
      clearAuthStore();
      router.replace('/(screen)/login');
    },
  });

  return {
    register: registerMutation,
    login: loginMutation,
    logout: logout,
  };
};
