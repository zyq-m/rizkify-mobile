import { Conversation, GetMessageRes } from '@/api/service';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { Database } from '@/types/supabase.types';
import { toCamelCase } from '@/utils/map';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

type ChatMessageRow = Database['public']['Tables']['chat_messages']['Row'];

export const useChat = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const useConversations = () => {
    return useQuery({
      queryKey: ['chat', 'conversations'],
      queryFn: async () => {
        if (!user?.id) throw new Error('Not authenticated');

        const { data: requests, error } = await supabase
          .from('item_requests')
          .select(
            '*, item:items(*, images:item_images(*)), requester:users(*), provider:users(*), chats:chat_messages(*)'
          )
          .or(`requester_id.eq.${user.id},provider_id.eq.${user.id}`)
          .order('updated_at', { ascending: false });
        if (error) throw error;

        const conversations: Conversation[] = (requests || []).map((req: any) => {
          const isRequester = req.requester_id === user.id;
          const partner = isRequester ? req.provider : req.requester;
          const messages = req.chats || [];
          const lastMsg = messages[messages.length - 1];
          const unreadCount = messages.filter(
            (m: any) => !m.is_read && m.receiver_id === user.id
          ).length;

          return {
            id: req.id,
            partner: {
              id: partner.id,
              name: partner.name,
              email: partner.email,
              imageUrl: partner.image_url,
            },
            item: {
              id: req.item.id,
              name: req.item.name,
              image: req.item.images?.[0]?.image_url || null,
            },
            request: {
              id: req.id,
              status: req.status,
              quantity: req.quantity,
              initialMessage: req.message,
            },
            lastMessage: lastMsg
              ? {
                  id: lastMsg.id,
                  content: lastMsg.content,
                  sender: { id: lastMsg.sender_id, name: '' },
                  isFromCurrentUser: lastMsg.sender_id === user.id,
                  isRead: lastMsg.is_read,
                  createdAt: lastMsg.created_at,
                }
              : (undefined as any),
            unreadCount,
            totalMessages: messages.length,
            updatedAt: req.updated_at,
          };
        });

        return conversations;
      },
      enabled: !!user?.id,
    });
  };

  const useMessages = (reqItemId: string) => {
    return useQuery({
      queryKey: ['chat', 'messages', reqItemId],
      queryFn: async () => {
        const { data: request, error } = await supabase
          .from('item_requests')
          .select(
            '*, item:items(*), requester:users(*), provider:users(*), chats:chat_messages(*, sender:users(*), receiver:users(*))'
          )
          .eq('id', reqItemId)
          .single();
        if (error) throw error;

        return toCamelCase<GetMessageRes>(request);
      },
      enabled: !!reqItemId,
      staleTime: 0,
    });
  };

  const useSendMessage = () => {
    return useMutation({
      mutationFn: async (data: { receiverId: string; content: string; itemRequestId: string }) => {
        if (!user?.id) throw new Error('Not authenticated');
        const { error } = await supabase.from('chat_messages').insert({
          content: data.content,
          sender_id: user.id,
          receiver_id: data.receiverId,
          item_request_id: data.itemRequestId,
        });
        if (error) throw error;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: ['chat', 'messages', variables.itemRequestId],
        });
        queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      },
    });
  };

  const useSendImageMessage = () => {
    return useMutation({
      mutationFn: async (formData: FormData) => {
        if (!user?.id) throw new Error('Not authenticated');
        const image = formData.get('image') as File;
        const requestId = formData.get('itemRequestId') as string;
        const receiverId = formData.get('receiverId') as string;

        const fileName = `chat/${requestId}/${Date.now()}_${image.name}`;
        const { error: uploadError } = await supabase.storage
          .from('items')
          .upload(fileName, image as any);
        if (uploadError) throw uploadError;

        const { data: urlData } = await supabase.storage.from('items').getPublicUrl(fileName);

        const { error } = await supabase.from('chat_messages').insert({
          content: '',
          image_url: urlData.publicUrl,
          sender_id: user.id,
          receiver_id: receiverId,
          item_request_id: requestId,
        });
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      },
    });
  };

  const useMarkMessagesAsRead = () => {
    return useMutation({
      mutationFn: async (senderId: string) => {
        if (!user?.id) throw new Error('Not authenticated');
        const { error } = await supabase
          .from('chat_messages')
          .update({ is_read: true })
          .eq('sender_id', senderId)
          .eq('receiver_id', user.id)
          .eq('is_read', false);
        if (error) throw error;
      },
      onSuccess: (_, senderId) => {
        queryClient.invalidateQueries({ queryKey: ['chat', 'messages', senderId] });
        queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      },
    });
  };

  const useUnreadCount = () => {
    return useQuery({
      queryKey: ['chat', 'unread-count'],
      queryFn: async () => {
        if (!user?.id) return { count: 0 };
        const { count, error } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('is_read', false);
        if (error) throw error;
        return { count: count || 0 };
      },
      enabled: !!user?.id,
    });
  };

  const useSearchUsers = (query: string) => {
    return useQuery({
      queryKey: ['chat', 'search-users', query],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, image_url')
          .ilike('name', `%${query}%`);
        if (error) throw error;
        return toCamelCase(data || []);
      },
      enabled: query.length > 2,
    });
  };

  const useMessageListener = (callback: (message: any) => void) => {
    useEffect(() => {
      const channel = supabase
        .channel('chat-messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages' },
          (payload: RealtimePostgresChangesPayload<ChatMessageRow>) => {
            callback(toCamelCase(payload.new));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [callback]);
  };

  const sendRealTimeMessage = () => {};
  const joinChatRoom = () => {};
  const setUserOnline = () => {};

  return {
    useConversations,
    useMessages,
    useSendMessage,
    useSendImageMessage,
    useMarkMessagesAsRead,
    useUnreadCount,
    useSearchUsers,
    useMessageListener,
    sendRealTimeMessage,
    joinChatRoom,
    setUserOnline,
  };
};
