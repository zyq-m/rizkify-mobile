import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { toCamelCase } from '@/utils/map';
import { Category, Condition } from '@/api/service';

export const useLookup = () => {
  const useCategories = () => {
    return useQuery({
      queryKey: ['lookup', 'categories'],
      queryFn: async () => {
        const { data, error } = await supabase.from('categories').select('*');
        if (error) throw error;
        return toCamelCase<Category[]>(data || []);
      },
      staleTime: 30 * 60 * 1000,
    });
  };

  const useCategory = (id: string) => {
    return useQuery({
      queryKey: ['lookup', 'categories', id],
      queryFn: async () => {
        const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
        if (error) throw error;
        return toCamelCase<Category>(data);
      },
      enabled: !!id,
    });
  };

  const expiry = useQuery({
    queryKey: ['lookup', 'expiry'],
    queryFn: () =>
      Promise.resolve([
        { id: '1', label: 'Today', value: 'today' },
        { id: '2', label: 'Tomorrow', value: 'tomorrow' },
        { id: '3', label: 'This Week', value: 'this_week' },
        { id: '4', label: 'Next Week', value: 'next_week' },
        { id: '5', label: 'This Month', value: 'this_month' },
        { id: '6', label: 'More than a month', value: 'more_than_month' },
      ]),
  });

  const conditions = useQuery({
    queryKey: ['lookup', 'condition'],
    queryFn: async () => {
      const { data, error } = await supabase.from('conditions').select('*');
      if (error) throw error;
      return toCamelCase<Condition[]>(data || []);
    },
  });

  return {
    useCategories,
    useCategory,
    expiry,
    conditions,
  };
};
