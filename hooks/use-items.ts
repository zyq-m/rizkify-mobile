import { ItemRequestStatus, ItemResponse, ReqItemResponse, TrendingItemRes } from '@/api/service';
import { useUser } from '@/hooks/use-user';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { calculateDistance, formatDistance } from '@/utils/distance';
import { toCamelCase } from '@/utils/map';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { decode } from 'base64-arraybuffer';
import { ImagePickerAsset } from 'expo-image-picker';

export type SortItem = 'latest' | 'nearest' | 'expiring';

export const useItems = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { useProfile } = useUser();
  const { data: profile } = useProfile();

  const userCoords =
    profile?.location?.latitude != null
      ? { latitude: profile.location.latitude, longitude: profile.location.longitude }
      : null;

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
          .select(
            '*, images:item_images(*), user:users(*), category:categories(*), likedBy:liked_items(*), requests:item_requests(*)'
          );

        if (filters?.categoryId) {
          query = query.eq('category_id', filters.categoryId);
        }
        if (filters?.search) {
          query = query.ilike('name', `%${filters.search}%`);
        }

        query = query.gt('expiry', new Date().toISOString());

        let sortColumn = 'created_at';
        let ascending = false;
        if (filters?.sortBy === 'expiring') {
          sortColumn = 'expiry';
          ascending = true;
        }

        query = query.order(sortColumn, { ascending });

        const { data, error } = await query;
        if (error) throw error;

        const refLat = filters?.lat ? parseFloat(filters.lat) : userCoords?.latitude;
        const refLng = filters?.lng ? parseFloat(filters.lng) : userCoords?.longitude;
        const maxDist = filters?.maxDistance ? parseFloat(filters.maxDistance) : Infinity;
        const hasReference = refLat != null && refLng != null;

        let results = (data || []).map((item: any) => {
          const rawLocation = item.location;
          const location = typeof rawLocation === 'string' ? JSON.parse(rawLocation) : rawLocation;
          const itemCoords =
            location?.latitude != null
              ? { latitude: location.latitude, longitude: location.longitude }
              : null;
          const distance =
            hasReference && itemCoords
              ? calculateDistance({ latitude: refLat, longitude: refLng }, itemCoords)
              : Infinity;
          const distanceText = distance !== Infinity ? formatDistance(distance) : '';
          return {
            ...toCamelCase(item),
            location: toCamelCase(location),
            isLiked: user
              ? (item.likedBy?.some((l: any) => l.user_id === user.id) ?? false)
              : false,
            distance,
            distanceText,
          };
        }) as unknown as ItemResponse[];

        if (hasReference && maxDist !== Infinity) {
          results = results.filter((item: any) => item.distance <= maxDist);
        }

        if (filters?.sortBy === 'nearest') {
          results.sort((a: any, b: any) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        }

        return results;
      },
    });
  };

  const useTrending = () => {
    return useQuery({
      queryKey: ['items', 'trending'],
      queryFn: async () => {
        const refLat = userCoords?.latitude;
        const refLng = userCoords?.longitude;
        const maxDist = profile?.location?.range ?? Infinity;
        const hasReference = refLat != null && refLng != null;

        const { data, error } = await supabase
          .from('items')
          .select(
            '*, images:item_images(*), user:users(*), category:categories(*), likedBy:liked_items(*), requests:item_requests(*)'
          )
          .gt('expiry', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(50);
        if (error) throw error;

        return (data || [])
          .map((item: any) => {
            const rawLocation = item.location;
            const location =
              typeof rawLocation === 'string' ? JSON.parse(rawLocation) : rawLocation;
            const itemCoords =
              location?.latitude != null
                ? { latitude: location.latitude, longitude: location.longitude }
                : null;
            const distance =
              hasReference && itemCoords
                ? calculateDistance({ latitude: refLat, longitude: refLng }, itemCoords)
                : Infinity;
            const distanceText = distance !== Infinity ? formatDistance(distance) : '';
            return {
              ...toCamelCase(item),
              location: toCamelCase(location),
              isLiked: true,
              likeCount: item.likedBy?.length ?? 0,
              pendingRequest: item.requests?.filter((r: any) => r.status === 'PENDING').length ?? 0,
              trendingRank: 0,
              distance,
              distanceText,
            };
          })
          .filter((item: any) => item.distance <= maxDist)
          .slice(0, 10) as unknown as TrendingItemRes[];
      },
    });
  };

  const useItem = (id: string) => {
    return useQuery({
      queryKey: ['items', id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('items')
          .select(
            '*, images:item_images(*), user:users(*), category:categories(*), likedBy:liked_items(*), requests:item_requests(*, requester:users!item_requests_requester_id_fkey(*))'
          )
          .eq('id', id)
          .single();

        if (error) throw error;

        const rawLocation = data.location;
        const location = typeof rawLocation === 'string' ? JSON.parse(rawLocation) : rawLocation;
        const itemCoords =
          location?.latitude != null
            ? { latitude: location.latitude, longitude: location.longitude }
            : null;
        const distance =
          userCoords && itemCoords ? calculateDistance(userCoords, itemCoords) : Infinity;
        const distanceText = distance !== Infinity ? formatDistance(distance) : '';

        return {
          ...toCamelCase(data),
          location: toCamelCase(location),
          isLiked: user ? (data.likedBy?.some((l: any) => l.user_id === user.id) ?? false) : false,
          distance,
          distanceText,
        } as unknown as ItemResponse;
      },
      enabled: !!id,
    });
  };

  const useCreateItem = () => {
    return useMutation({
      mutationFn: async ({
        data,
        images,
      }: {
        data: Record<string, any>;
        images: ImagePickerAsset[];
      }) => {
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
            const ext = image.mimeType?.split('/').pop();
            const fileName = `${item.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

            const { error: uploadError } = await supabase.storage
              .from('items')
              .upload(fileName, decode(image.base64!), {
                contentType: image.mimeType,
                upsert: false,
              });
            if (uploadError) throw uploadError;

            const { data: urlData } = await supabase.storage.from('items').getPublicUrl(fileName);

            imageRecords.push({ image_url: urlData.publicUrl, item_id: item.id });
          }

          if (imageRecords.length > 0) {
            const { error: imgError } = await supabase.from('item_images').insert(imageRecords);
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
        images: ImagePickerAsset[];
        existingImages?: string[];
        imagesToDelete?: string[];
      }) => {
        const { error: itemError } = await supabase.from('items').update(data).eq('id', id);
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
            const ext = image.mimeType?.split('/').pop();
            const fileName = `${id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

            const { error: uploadError } = await supabase.storage
              .from('items')
              .upload(fileName, decode(image.base64!), {
                contentType: image.mimeType,
                upsert: false,
              });
            if (uploadError) throw uploadError;

            const { data: urlData } = await supabase.storage.from('items').getPublicUrl(fileName);

            imageRecords.push({ image_url: urlData.publicUrl, item_id: id });
          }

          if (imageRecords.length > 0) {
            const { error: imgError } = await supabase.from('item_images').insert(imageRecords);
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
          const { error } = await supabase.from('liked_items').delete().eq('id', existing.data.id);
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
        const { error } = await supabase.from('item_images').delete().eq('id', imageId);
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
        const item = await supabase.from('items').select('user_id').eq('id', data.itemId).single();
        if (item.error) throw item.error;

        const { data: request, error } = await supabase
          .from('item_requests')
          .insert({
            item_id: data.itemId,
            requester_id: user.id,
            provider_id: item.data.user_id,
            message: data.message || null,
            quantity: data.quantity || 1,
          })
          .select()
          .single();
        if (error) throw error;
        return request;
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
          .select(
            '*, item:items(*, images:item_images(*)), requester:users!item_requests_requester_id_fkey(*), provider:users!item_requests_provider_id_fkey(*)'
          )
          .eq('requester_id', user.id);
        if (error) {
          console.log(error);
          throw error;
        }
        return toCamelCase<ReqItemResponse[]>(data || []);
      },
      enabled: !!user?.id,
    });
  };

  const useUpdateRequest = () => {
    return useMutation({
      mutationFn: async (data: { id: string; status: ItemRequestStatus }) => {
        if (!user?.id) throw new Error('Not authenticated');

        const { data: request, error: reqError } = await supabase
          .from('item_requests')
          .select('item_id, quantity')
          .eq('id', data.id)
          .single();
        if (reqError) throw reqError;

        const { error: updateError } = await supabase
          .from('item_requests')
          .update({ status: data.status })
          .eq('id', data.id);
        if (updateError) throw updateError;

        if (data.status === 'COMPLETED') {
          const { data: item, error: itemError } = await supabase
            .from('items')
            .select('quantity')
            .eq('id', request.item_id)
            .single();
          if (itemError) throw itemError;

          const newQuantity = Math.max(0, (item.quantity ?? 0) - (request.quantity ?? 1));
          const { error: updateItemError } = await supabase
            .from('items')
            .update({ quantity: newQuantity })
            .eq('id', request.item_id);
          if (updateItemError) throw updateItemError;
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['reqItem'] });
        queryClient.invalidateQueries({ queryKey: ['items'] });
        queryClient.invalidateQueries({ queryKey: ['user', 'items'] });
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
