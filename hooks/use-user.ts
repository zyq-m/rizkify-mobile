// src/hooks/useUser.ts
import { userAPI } from '@/api/service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useUser = () => {
  const queryClient = useQueryClient();

  // Get user profile
  const useProfile = () => {
    return useQuery({
      queryKey: ['user', 'profile'],
      queryFn: () => userAPI.getProfile().then((res) => res.data),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Update profile
  const useUpdateProfile = () => {
    return useMutation({
      mutationFn: (data: { name?: string; phone?: string; location?: string }) =>
        userAPI.updateProfile(data).then((res) => res.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      },
    });
  };

  // Change password
  const useChangePassword = () => {
    return useMutation({
      mutationFn: ({
        currentPassword,
        newPassword,
      }: {
        currentPassword: string;
        newPassword: string;
      }) => userAPI.changePassword({ currentPassword, newPassword }),
    });
  };

  // Get user's items
  const useMyItems = () => {
    return useQuery({
      queryKey: ['user', 'items'],
      queryFn: () => userAPI.getMyItems().then((res) => res.data),
    });
  };

  // Get liked items
  const useLikedItems = () => {
    return useQuery({
      queryKey: ['user', 'liked-items'],
      queryFn: () => userAPI.getLikedItems().then((res) => res.data),
    });
  };

  // Get requests
  const useMyRequests = () => {
    return useQuery({
      queryKey: ['user', 'requests', 'sent'],
      queryFn: () => userAPI.getMyRequests().then((res) => res.data),
    });
  };

  const useReceivedRequests = () => {
    return useQuery({
      queryKey: ['user', 'requests', 'received'],
      queryFn: () => userAPI.getReceivedRequests().then((res) => res.data),
    });
  };

  // Update request status
  const useUpdateRequestStatus = () => {
    return useMutation({
      mutationFn: ({ requestId, status }: { requestId: string; status: string }) =>
        userAPI.updateRequestStatus(requestId, status),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'requests'] });
        queryClient.invalidateQueries({ queryKey: ['items'] });
      },
    });
  };

  return {
    useProfile,
    useUpdateProfile,
    useChangePassword,
    useMyItems,
    useLikedItems,
    useMyRequests,
    useReceivedRequests,
    useUpdateRequestStatus,
  };
};
