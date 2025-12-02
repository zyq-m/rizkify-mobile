import { chatAPI } from '@/api/service';
import { socketService } from '@/api/socket';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export const useChat = () => {
  const queryClient = useQueryClient();

  // Get conversations
  const useConversations = () => {
    return useQuery({
      queryKey: ['chat', 'conversations'],
      queryFn: () => chatAPI.getConversations().then((res) => res.data),
    });
  };

  // Get messages with user
  const useMessages = (reqItemId: string) => {
    return useQuery({
      queryKey: ['chat', 'messages', reqItemId],
      queryFn: () => chatAPI.getMessages(reqItemId).then((res) => res.data),
      enabled: !!reqItemId,
      staleTime: 0,
    });
  };

  // Send message
  const useSendMessage = () => {
    return useMutation({
      mutationFn: (data: { receiverId: string; content: string; itemRequestId: string }) =>
        chatAPI.sendMessage(data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: ['chat', 'messages', variables.receiverId],
        });
        queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      },
    });
  };

  // Send image message
  const useSendImageMessage = () => {
    return useMutation({
      mutationFn: (formData: FormData) => chatAPI.sendImageMessage(formData),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      },
    });
  };

  // Mark messages as read
  const useMarkMessagesAsRead = () => {
    return useMutation({
      mutationFn: (senderId: string) => chatAPI.markMessagesAsRead(senderId),
      onSuccess: (_, senderId) => {
        queryClient.invalidateQueries({ queryKey: ['chat', 'messages', senderId] });
        queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      },
    });
  };

  // Get unread count
  const useUnreadCount = () => {
    return useQuery({
      queryKey: ['chat', 'unread-count'],
      queryFn: () => chatAPI.getUnreadCount().then((res) => res.data),
    });
  };

  // Search users
  const useSearchUsers = (query: string) => {
    return useQuery({
      queryKey: ['chat', 'search-users', query],
      queryFn: () => chatAPI.searchUsers(query).then((res) => res.data),
      enabled: query.length > 2,
    });
  };

  // Real-time message listener
  const useMessageListener = (callback: (message: any) => void) => {
    useEffect(() => {
      socketService.onReceiveMessage(callback);

      return () => {
        socketService.socket?.off('receive_message', callback);
      };
    }, [callback]);
  };

  // Send real-time message
  const sendRealTimeMessage = (data: {
    content: string;
    senderId: string;
    receiverId: string;
    itemRequestId: string;
  }) => {
    socketService.sendMessage(data);
  };

  // Join chat room
  const joinChatRoom = (roomId: string) => {
    socketService.joinRoom(roomId);
  };

  // User online status
  const setUserOnline = (userId: string) => {
    socketService.userOnline(userId);
  };

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
