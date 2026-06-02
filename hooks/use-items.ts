import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toCamelCase } from '@/utils/map';
import { ItemResponse, TrendingItemRes, ItemRequestStatus, ReqItemResponse } from '@/api/service';

export type SortItem = 'latest' | 'nearest' | 'expiring';

export const useItems = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const useItems = (filters?: {
    categoryId?: string;
    name?: string;
    sortBy?: SortItem;
    maxDistance?: string;
    lat?: string;
    lng?: string;
    search?: string;
  }) => {
    return useQuery({
      queryKey: ['items', filters],
      queryFn: async () => {
        let query = supabase
          .from('items')
          .select('*, images:item_images(*), user:users(*), category:categories(*), likedBy:liked_items(*), requests:item_requests(*)');

        if (filters?.categoryId) {
          query = query.eq('category_id', filters.categoryId);
        }
        if (filters?.search) {
          query = query.ilike('name', `%${filters.search}%`);
        }

        let sortColumn = 'created_at';
        let ascending = false;
        if (filters?.sortBy === 'expiring') {
          sortColumn = 'expiry';
          ascending = true;
        }

        query = query.order(sortColumn, { ascending });

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map((item: any) => ({
          ...toCamelCase(item),
          isLiked: user ? item.likedBy?.some((l: any) => l.user_id === user.id) ?? false : false,
          distance: 0,
          distanceText: '',
        })) as unknown as ItemResponse[];
      },
    });
  };

  const useTrending = () => {
    return useQuery({
      queryKey: ['items', 'trending'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('items')
          .select('*, images:item_images(*), user:users(*), category:categories(*), likedBy:liked_items(*), requests:item_requests(*)')
          .order('created_at', { ascending: false })
          .limit(10);
        if (error) throw error;

        return (data || []).map((item: any) => ({
          ...toCamelCase(item),
          isLiked: true,
          likeCount: item.likedBy?.length ?? 0,
          pendingRequest: item.requests?.filter((r: any) => r.status === 'PENDING').length ?? 0,
          trendingRank: 0,
          distance: 0,
          distanceText: '',
        })) as unknown as TrendingItemRes[];
      },
    });
  };

  const useItem = (id: string) => {
    return useQuery({
      queryKey: ['items', id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('items')
          .select('*, images:item_images(*), user:users(*), category:categories(*), likedBy:liked_items(*), requests:item_requests(*, requester:users(*))')
          .eq('id', id)
          .single();
        if (error) throw error;

        return {
          ...toCamelCase(data),
          isLiked: user ? data.likedBy?.some((l: any) => l.user_id === user.id) ?? false : false,
          distance: 0,
          distanceText: '',
        } as unknown as ItemResponse;
      },
      enabled: !!id,
    });
  };

  const useCreateItem = () => {
    return useMutation({
      mutationFn: async ({ data, images }: { data: Record<string, any>; images: { uri: string; name?: string | null; type?: string | null }[] }) => {
        if (!user?.id) throw new Error('Not authenticated');

        const { data: item, error: itemError } = await supabase
          .from('items')
          .insert({ ...data, user_id: user.id })
          .select()
          .single();
        if (itemError) throw itemError;

        if (images.length > 0) {
          const imageRecords = [];
          for (const image of images) {
            const ext = image.uri.split('.').pop() || 'jpg';
            const fileName = `${item.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            const response = await fetch(image.uri);
            const blob = await response.blob();

            const { error: uploadError } = await supabase.storage
              .from('items')
              .upload(fileName, blob);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('items')
              .getPublicUrl(fileName);

            imageRecords.push({ image_url: publicUrl, item_id: item.id });
          }

          if (imageRecords.length > 0) {
            const { error: imgError } = await supabase
              .from('item_images')
              .insert(imageRecords);
            if (imgError) throw imgError;
          }
        }

        return item;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['items'] });
        queryClient.invalidateQueries({ queryKey: ['user', 'items'] });
      },
    });
  };

  const useUpdateItem = () => {
    return useMutation({
      mutationFn: async ({
        id,
        data,
        images,
        existingImages,
        imagesToDelete,
      }: {
        id: string;
        data: Record<string, any>;
        images: { uri: string; name?: string | null; type?: string | null }[];
        existingImages?: string[];
        imagesToDelete?: string[];
      }) => {
        const { error: itemError } = await supabase
          .from('items')
          .update(data)
          .eq('id', id);
        if (itemError) throw itemError;

        // Delete removed images
        if (imagesToDelete?.length) {
          for (const imgUrl of imagesToDelete) {
            const path = imgUrl.split('/').slice(-2).join('/');
            await supabase.storage.from('items').remove([path]);
            const { error: delError } = await supabase
              .from('item_images')
              .delete()
              .eq('image_url', imgUrl);
            if (delError) throw delError;
          }
        }

        // Upload new images
        if (images.length > 0) {
          const imageRecords = [];
          for (const image of images) {
            const ext = image.uri.split('.').pop() || 'jpg';
            const fileName = `${id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            const response = await fetch(image.uri);
            const blob = await response.blob();

            const { error: uploadError } = await supabase.storage
              .from('items')
              .upload(fileName, blob);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('items')
              .getPublicUrl(fileName);

            imageRecords.push({ image_url: publicUrl, item_id: id });
          }

          if (imageRecords.length > 0) {
            const { error: imgError } = await supabase
              .from('item_images')
              .insert(imageRecords);
            if (imgError) throw imgError;
          }
        }
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['items'] });
        queryClient.invalidateQueries({ queryKey: ['items', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['user', 'items'] });
      },
    });
  };

  const useLikeItem = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        if (!user?.id) throw new Error('Not authenticated');
        const existing = await supabase
          .from('liked_items')
          .select('id')
          .eq('user_id', user.id)
          .eq('item_id', id)
          .maybeSingle();

        if (existing.data) {
          const { error } = await supabase
            .from('liked_items')
            .delete()
            .eq('id', existing.data.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('liked_items')
            .insert({ user_id: user.id, item_id: id });
          if (error) throw error;
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['items'] });
        queryClient.invalidateQueries({ queryKey: ['user', 'liked-items'] });
      },
    });
  };

  const useDeleteItemImage = () => {
    return useMutation({
      mutationFn: async ({ itemId, imageId }: { itemId: string; imageId: string }) => {
        const { error } = await supabase
          .from('item_images')
          .delete()
          .eq('id', imageId);
        if (error) throw error;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['items', variables.itemId] });
        queryClient.invalidateQueries({ queryKey: ['user', 'items'] });
      },
    });
  };

  const useCreateRequest = () => {
    return useMutation({
      mutationFn: async (data: { itemId: string; message?: string; quantity?: number }) => {
        if (!user?.id) throw new Error('Not authenticated');
        const item = await supabase
          .from('items')
          .select('user_id')
          .eq('id', data.itemId)
          .single();
        if (item.error) throw item.error;

        const { error } = await supabase.from('item_requests').insert({
          item_id: data.itemId,
          requester_id: user.id,
          provider_id: item.data.user_id,
          message: data.message || null,
          quantity: data.quantity || 1,
        });
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['items', 'requests'] });
        queryClient.invalidateQueries({ queryKey: ['items'] });
        queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      },
    });
  };

  const useRequestItem = () => {
    return useQuery({
      queryKey: ['items', 'requests'],
      queryFn: async () => {
        if (!user?.id) throw new Error('Not authenticated');
        const { data, error } = await supabase
          .from('item_requests')
          .select('*, item:items(*, images:item_images(*)), requester:users(*)')
          .eq('requester_id', user.id);
        if (error) throw error;
        return toCamelCase<ReqItemResponse[]>(data || []);
      },
      enabled: !!user?.id,
    });
  };

  const useUpdateRequest = () => {
    return useMutation({
      mutationFn: async (data: { id: string; status: ItemRequestStatus }) => {
        const { error } = await supabase
          .from('item_requests')
          .update({ status: data.status })
          .eq('id', data.id);
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['reqItem'] });
      },
    });
  };

  return {
    useTrending,
    useItems,
    useItem,
    useCreateItem,
    useUpdateItem,
    useLikeItem,
    useDeleteItemImage,
    useCreateRequest,
    useRequestItem,
    useUpdateRequest,
  };
};
