import { lookupAPI } from '@/api/service';
import { useQuery } from '@tanstack/react-query';

export const useLookup = () => {
  // Get categories
  const useCategories = () => {
    return useQuery({
      queryKey: ['lookup', 'categories'],
      queryFn: () => lookupAPI.getCategories().then((res) => res.data),
      staleTime: 30 * 60 * 1000, // 30 minutes
    });
  };

  // Get single category
  const useCategory = (id: string) => {
    return useQuery({
      queryKey: ['lookup', 'categories', id],
      queryFn: () => lookupAPI.getCategory(id).then((res) => res.data),
      enabled: !!id,
    });
  };

  // Get expiry
  const expiry = useQuery({
    queryKey: ['lookup', 'expiry'],
    queryFn: () => lookupAPI.getExpiry().then((res) => res.data),
  });

  // Get condtions
  const conditions = useQuery({
    queryKey: ['lookup', 'condition'],
    queryFn: () => lookupAPI.getConditon().then((res) => res.data),
  });

  return {
    useCategories,
    useCategory,
    expiry,
    conditions,
  };
};
