import ConfirmDialog from '@/components/custom/confirm-dialog';
import { useChat } from '@/hooks/use-chat';
import { useItems } from '@/hooks/use-items';
import { useAuthStore } from '@/store/auth-store';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, CheckCheck, Send, User } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';

// Define message type based on your schema
export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  itemRequestId: string;
  isRead: boolean;
  createdAt: Date;
  sender?: {
    id: string;
    name: string;
    imageUrl?: string;
  };
}

export default function ChatScreen() {
  const { id: requestId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [statusChange, setStatusChange] = useState<{ visible: boolean; newStatus: string }>({
    visible: false,
    newStatus: '',
  });

  const {
    useMessages,
    useSendMessage,
    sendRealTimeMessage,
    useMessageListener,
    joinChatRoom,
    useMarkMessagesAsRead,
  } = useChat();
  const { user } = useAuthStore();

  // Get initial messages from API
  const { data: conversationData, isPending, error } = useMessages(requestId);

  // Send message mutation
  const sendMessageMutation = useSendMessage();
  const { mutate: markAsRead } = useMarkMessagesAsRead();

  // Request status mutation
  const { useUpdateRequest } = useItems();
  const { mutate: updateRequest, isPending: isUpdating } = useUpdateRequest();

  // Handle real-time messages
  const handleNewMessage = useCallback(
    (newMessage: ChatMessage) => {
      // Don't add our own messages — already handled via optimistic update
      if (newMessage.senderId === currentUserId) return;

      if (newMessage.itemRequestId === requestId) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });

        markAsRead(newMessage.senderId);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId === newMessage.senderId && !msg.isRead ? { ...msg, isRead: true } : msg
          )
        );
      }
    },
    [requestId, currentUserId, markAsRead]
  );

  // Use the real-time message listener
  useMessageListener(handleNewMessage);

  // Join chat room and set up real-time connection
  useEffect(() => {
    if (requestId) {
      // Join the chat room for this item request
      joinChatRoom(requestId);
    }
  }, [requestId, joinChatRoom]);

  // Initialize messages from API
  useEffect(() => {
    if (conversationData?.chats) {
      setMessages(conversationData.chats);
    }
  }, [conversationData]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Get current user from storage
  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id);
    }
  }, [user]);

  // Track keyboard height
  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      }
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUserId || !conversationData) return;

    const receiverId =
      currentUserId === conversationData.requesterId
        ? conversationData.providerId
        : conversationData.requesterId;

    // Create optimistic message
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: message.trim(),
      senderId: currentUserId,
      receiverId: receiverId,
      itemRequestId: requestId,
      isRead: false,
      createdAt: new Date(),
    };

    // Add to UI immediately
    setMessages((prev) => [...prev, optimisticMessage]);
    setMessage('');

    try {
      // Send via real-time socket
      sendRealTimeMessage({
        content: message.trim(),
        senderId: currentUserId,
        receiverId: receiverId,
        itemRequestId: requestId,
      });

      // Also send via HTTP API for persistence
      await sendMessageMutation.mutateAsync({
        content: message.trim(),
        receiverId: receiverId,
        itemRequestId: requestId,
      });
    } catch (error) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const isProvider = conversationData && currentUserId === conversationData.providerId;

  const handleStatusChange = (newStatus: string) => {
    setStatusChange({ visible: true, newStatus });
  };

  const formatMessageTime = (timestamp: Date) => {
    return dayjs(timestamp).format('HH:mm');
  };

  const isCurrentUser = (senderId: string) => {
    return senderId === currentUserId;
  };

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg text-gray-600">Loading chat...</Text>
      </View>
    );
  }

  if (error || !conversationData) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg text-gray-600">Failed to load chat</Text>
        <Pressable onPress={handleBack} className="mt-4 rounded-lg bg-black px-6 py-3">
          <Text className="font-medium text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const getOtherUser = () => {
    return isCurrentUser(conversationData.requesterId)
      ? conversationData.provider
      : conversationData.requester;
  };

  const otherUser = getOtherUser();

  return (
    <View className="flex-1 bg-gray-100">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-4 pb-4 pt-12">
        <View className="flex-row items-center justify-between gap-4">
          {/* Item */}
          <View className="flex-1 flex-row items-center">
            <Pressable onPress={handleBack} className="mr-2 p-2">
              <ArrowLeft size={24} color="#000" />
            </Pressable>

            <View className="flex-1 flex-row items-center gap-2">
              <Image
                source={{ uri: conversationData.item.images[0].imageUrl }}
                className="size-9 rounded-full"
              />
              <Text className="flex-1 text-base font-medium text-gray-900" numberOfLines={1}>
                {otherUser.name} • {conversationData?.item?.name}
              </Text>
            </View>
          </View>
        </View>

        {/* Request Status Banner */}
        <View className="mt-3 rounded-lg bg-blue-50 p-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm font-medium text-blue-900">
                Request: {conversationData.quantity} × {conversationData.item.name}
              </Text>
              <Text className="mt-1 text-xs text-blue-700">
                Status: <Text className="font-medium">{conversationData.status}</Text>
              </Text>
            </View>
            <View
              className={`rounded-full px-2 py-1 ${
                conversationData.status === 'PENDING'
                  ? 'bg-yellow-100'
                  : conversationData.status === 'APPROVED' ||
                      conversationData.status === 'COMPLETED'
                    ? 'bg-green-100'
                    : conversationData.status === 'REJECTED'
                      ? 'bg-red-100'
                      : 'bg-gray-100'
              }`}>
              <Text
                className={`text-xs font-medium ${
                  conversationData.status === 'PENDING'
                    ? 'text-yellow-800'
                    : conversationData.status === 'APPROVED' ||
                        conversationData.status === 'COMPLETED'
                      ? 'text-green-800'
                      : conversationData.status === 'REJECTED'
                        ? 'text-red-800'
                        : 'text-gray-800'
                }`}>
                {conversationData.status}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          {isProvider &&
            (conversationData.status === 'PENDING' || conversationData.status === 'APPROVED') && (
              <View className="mt-3 flex-row gap-2">
                <Pressable
                  onPress={() => handleStatusChange('COMPLETED')}
                  disabled={isUpdating}
                  className="flex-1 rounded-lg bg-emerald-100 px-3 py-2 active:bg-emerald-200">
                  <Text className="text-center text-sm font-medium text-green-800">
                    Mark as Complete
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleStatusChange('REJECTED')}
                  disabled={isUpdating}
                  className="flex-1 rounded-lg bg-red-100 px-3 py-2 active:bg-red-200">
                  <Text className="text-center text-sm font-medium text-red-800">Reject</Text>
                </Pressable>
              </View>
            )}
        </View>
      </View>

      {/* Chat Messages */}
      <View className="flex-1">
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}>
          {messages.map((msg, index) => {
            const isUser = isCurrentUser(msg.senderId);
            const showAvatar =
              index === messages.length - 1 || messages[index + 1]?.senderId !== msg.senderId;

            return (
              <View key={msg.id} className={`mb-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                <View
                  className={`max-w-[75%] flex-row items-end ${isUser ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  {!isUser && (
                    <View
                      className={`mr-2 h-7 w-7 items-center justify-center rounded-full bg-gray-300 ${showAvatar ? '' : 'opacity-0'}`}>
                      {showAvatar &&
                        (otherUser.imageUrl ? (
                          <Image
                            source={{ uri: otherUser.imageUrl }}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <User size={16} color="#6B7280" />
                        ))}
                    </View>
                  )}

                  {/* Message Bubble */}
                  <View className={isUser ? 'mr-2' : ''}>
                    <View
                      className={`flex-row flex-wrap justify-end rounded-2xl px-3 py-2 ${
                        isUser
                          ? 'rounded-br-md bg-green-700'
                          : 'rounded-bl-md border border-gray-200 bg-white'
                      }`}>
                      <Text
                        className={`text-[15px] leading-5 ${isUser ? 'mr-2 text-white' : 'mr-2 text-gray-900'}`}>
                        {msg.content}
                      </Text>
                      <View className="-mb-0.5 mt-0.5 flex-row items-center justify-end gap-0.5">
                        <Text
                          className={`text-[11px] ${isUser ? 'text-white/70' : 'text-gray-400'}`}>
                          {formatMessageTime(msg.createdAt)}
                        </Text>
                        {isUser &&
                          (msg.isRead ? (
                            <CheckCheck size={11} color="white" />
                          ) : (
                            <Check size={11} color="white" />
                          ))}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Message Input */}
        <View
          className="border-t border-gray-200 bg-white px-4 py-3"
          style={{ marginBottom: keyboardHeight }}>
          <View className="flex-row items-center">
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              multiline
              className="max-h-24 flex-1 rounded-2xl bg-gray-100 px-4 py-3 text-gray-900"
              placeholderTextColor="#9CA3AF"
              onSubmitEditing={handleSendMessage}
            />

            <Pressable
              onPress={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className={`ml-2 rounded-full p-3 ${
                message.trim() && !sendMessageMutation.isPending ? 'bg-blue-500' : 'bg-gray-300'
              }`}>
              {sendMessageMutation.isPending ? (
                <Text className="text-white">...</Text>
              ) : (
                <Send size={20} color={message.trim() ? '#FFF' : '#9CA3AF'} />
              )}
            </Pressable>
          </View>
        </View>
      </View>
      <ConfirmDialog
        visible={statusChange.visible}
        title="Change Status"
        message={`Are you sure you want to mark this request as ${statusChange.newStatus.toLowerCase()}?`}
        onConfirm={() => {
          setStatusChange({ visible: false, newStatus: '' });
          updateRequest({ id: requestId, status: statusChange.newStatus as any });
        }}
        onCancel={() => setStatusChange({ visible: false, newStatus: '' })}
      />
    </View>
  );
}
