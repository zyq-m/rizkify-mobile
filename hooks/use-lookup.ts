import { Category, Condition } from '@/api/service';
import { supabase } from '@/lib/supabase';
import { toCamelCase } from '@/utils/map';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';

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
        { id: '1', label: 'Today', value: dayjs().format('YYYY-MM-DD') },
        { id: '2', label: 'Tomorrow', value: dayjs().add(1, 'day').format('YYYY-MM-DD') },
        { id: '3', label: 'This Week', value: dayjs().endOf('week').format('YYYY-MM-DD') },
        { id: '4', label: 'Next Week', value: dayjs().add(1, 'week').endOf('week').format('YYYY-MM-DD') },
        { id: '5', label: 'This Month', value: dayjs().endOf('month').format('YYYY-MM-DD') },
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
