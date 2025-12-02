// src/hooks/useItems.ts
import { ItemRequestStatus, itemsAPI, requestsAPI } from '@/api/service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type SortItem = 'latest' | 'nearest' | 'expiring';

export const useItems = () => {
  const queryClient = useQueryClient();

  // Get all items
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
      queryFn: () => itemsAPI.getItems(filters).then((res) => res.data),
    });
  };

  const useTrending = () => {
    return useQuery({
      queryKey: ['items', 'trending'],
      queryFn: () => itemsAPI.getTrendingItems().then((res) => res.data),
    });
  };

  // Get single item
  const useItem = (id: string) => {
    return useQuery({
      queryKey: ['items', id],
      queryFn: () => itemsAPI.getItem(id).then((res) => res.data),
      enabled: !!id,
    });
  };

  // Create item
  const useCreateItem = () => {
    return useMutation({
      mutationFn: (formData: FormData) => itemsAPI.createItem(formData),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['items'] });
        queryClient.invalidateQueries({ queryKey: ['user', 'items'] });
      },
    });
  };

  // Update item
  const useUpdateItem = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
        itemsAPI.updateItem(id, formData),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['items'] });
        queryClient.invalidateQueries({ queryKey: ['items', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['user', 'items'] });
      },
    });
  };

  // Like item
  const useLikeItem = () => {
    return useMutation({
      mutationFn: (id: string) => itemsAPI.likeItem(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['items'] });
        queryClient.invalidateQueries({ queryKey: ['user', 'liked-items'] });
      },
    });
  };

  // Delete item image
  const useDeleteItemImage = () => {
    return useMutation({
      mutationFn: ({ itemId, imageId }: { itemId: string; imageId: string }) =>
        itemsAPI.deleteItemImage(itemId, imageId),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['items', variables.itemId] });
        queryClient.invalidateQueries({ queryKey: ['user', 'items'] });
      },
    });
  };

  // Create food request
  const useCreateRequest = () => {
    return useMutation({
      mutationFn: (data: { itemId: string; message?: string; quantity?: number }) =>
        requestsAPI.createRequest(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['items', 'requests'] });
        queryClient.invalidateQueries({ queryKey: ['items'] });
        queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      },
    });
  };

  // Get requested items
  const useRequestItem = () => {
    return useQuery({
      queryKey: ['items', 'requests'],
      queryFn: () => requestsAPI.getRequest().then((res) => res.data),
    });
  };

  // Update status items
  const useUpdateRequest = () => {
    return useMutation({
      mutationFn: (data: { id: string; status: ItemRequestStatus }) =>
        requestsAPI.updateRequest(data),
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
