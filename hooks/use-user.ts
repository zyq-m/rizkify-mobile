import { MyItemRes, ReqItemResponse } from '@/api/service';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { toCamelCase } from '@/utils/map';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const useProfile = () => {
    return useQuery({
      queryKey: ['user', 'profile'],
      queryFn: async () => {
        if (!user?.id) throw new Error('Not authenticated');
        const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single();
        if (error) throw error;

        const rawLocation = data.location;
        const location = typeof rawLocation === 'string' ? JSON.parse(rawLocation) : rawLocation;

        return { ...toCamelCase(data), location: toCamelCase(location) };
      },
      enabled: !!user?.id,
      staleTime: 5 * 60 * 1000,
    });
  };

  const useUpdateProfile = () => {
    return useMutation({
      mutationFn: async (data: { name?: string; phone?: string; location?: any }) => {
        if (!user?.id) throw new Error('Not authenticated');
        const { error } = await supabase.from('users').update(data).eq('id', user.id);
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      },
    });
  };

  const useChangePassword = () => {
    return useMutation({
      mutationFn: async ({
        currentPassword,
        newPassword,
      }: {
        currentPassword: string;
        newPassword: string;
      }) => {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user?.email || '',
          password: currentPassword,
        });
        if (signInError) throw new Error('Current password is incorrect');

        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      },
    });
  };

  const useMyItems = () => {
    return useQuery({
      queryKey: ['user', 'items'],
      queryFn: async () => {
        if (!user?.id) throw new Error('Not authenticated');
        const { data, error } = await supabase
          .from('items')
          .select(
            '*, images:item_images(*), category:categories(*), likedItems:liked_items(count), pendingRequests:item_requests(count)'
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;

        return (data || []).map((item: any) => {
          const rawLocation = item.location;
          const location = typeof rawLocation === 'string' ? JSON.parse(rawLocation) : rawLocation;

          return {
            ...toCamelCase(item),
            location: toCamelCase(location),
            likeCount: item.likedItems?.[0]?.count ?? 0,
            pendingRequestCount: item.pendingRequests?.[0]?.count ?? 0,
          };
        }) as MyItemRes[];
      },
      enabled: !!user?.id,
    });
  };

  const useLikedItems = () => {
    return useQuery({
      queryKey: ['user', 'liked-items'],
      queryFn: async () => {
        if (!user?.id) throw new Error('Not authenticated');
        const { data, error } = await supabase
          .from('liked_items')
          .select('*, item:items(*, images:item_images(*), category:categories(*))')
          .eq('user_id', user.id);
        if (error) throw error;
        return toCamelCase(data || []);
      },
      enabled: !!user?.id,
    });
  };

  const useMyRequests = () => {
    return useQuery({
      queryKey: ['user', 'requests', 'sent'],
      queryFn: async () => {
        if (!user?.id) throw new Error('Not authenticated');
        const { data, error } = await supabase
          .from('item_requests')
          .select(
            '*, item:items(*, images:item_images(*)), provider:users!item_requests_provider_id_fkey(*)'
          )
          .eq('requester_id', user.id);
        if (error) throw error;
        return toCamelCase<ReqItemResponse[]>(data || []);
      },
      enabled: !!user?.id,
    });
  };

  const useReceivedRequests = () => {
    return useQuery({
      queryKey: ['user', 'requests', 'received'],
      queryFn: async () => {
        if (!user?.id) throw new Error('Not authenticated');
        const { data, error } = await supabase
          .from('item_requests')
          .select(
            '*, item:items(*, images:item_images(*)), requester:users!item_requests_requester_id_fkey(*)'
          )
          .eq('provider_id', user.id);
        if (error) throw error;
        return toCamelCase<ReqItemResponse[]>(data || []);
      },
      enabled: !!user?.id,
    });
  };

  const useUserStats = () => {
    return useQuery({
      queryKey: ['user', 'stats', user?.id],
      queryFn: async () => {
        if (!user?.id) return { itemsShared: 0, itemsReceived: 0, totalImpact: 0 };

        const [sharedResult, receivedResult] = await Promise.all([
          supabase.from('items').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase
            .from('item_requests')
            .select('*', { count: 'exact', head: true })
            .eq('requester_id', user.id)
            .eq('status', 'COMPLETED'),
        ]);

        const itemsShared = sharedResult.count ?? 0;
        const itemsReceived = receivedResult.count ?? 0;
        return { itemsShared, itemsReceived, totalImpact: itemsShared + itemsReceived };
      },
      enabled: !!user?.id,
    });
  };

  const useUpdateRequestStatus = () => {
    return useMutation({
      mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
        const { error } = await supabase
          .from('item_requests')
          .update({ status: status as any })
          .eq('id', requestId);
        if (error) throw error;
      },
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
    useUserStats,
  };
};
