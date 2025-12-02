import { Conversation } from '@/api/service';
import { useChat } from '@/hooks/use-chat';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

dayjs.extend(relativeTime);

export type ChatItem = {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
};

export default function ChatsListScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatItem[]>();
  const [filteredChats, setFilteredChats] = useState<ChatItem[]>();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { useConversations } = useChat();
  const { data, refetch } = useConversations();

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredChats(chats);
    } else {
      const filtered = chats?.filter(
        (chat) =>
          chat.name.toLowerCase().includes(query.toLowerCase()) ||
          chat.lastMessage.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredChats(filtered);
    }
  };

  // Handle pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [refetch]);

  const navigateToChat = (chat: Conversation) => {
    router.push({
      pathname: '/(screen)/chat/[id]',
      params: { id: chat.request.id },
    });
  };

  const renderChatItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      className="flex-row items-center bg-white p-4 active:bg-gray-50"
      onPress={() => navigateToChat(item)}>
      <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-gray-200">
        {item.partner.imageUrl ? (
          <Image source={{ uri: item.partner.imageUrl }} className="h-12 w-12 rounded-full" />
        ) : (
          <User size={20} color="#6B7280" />
        )}
      </View>
      <View className="flex-1 justify-center gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-gray-900">{item.partner.name}</Text>
          <Text className="text-xs text-gray-500">{dayjs().to(item.lastMessage.createdAt)}</Text>
        </View>
        <Text>{item.item.name}</Text>
        <View className="flex-row items-center justify-between">
          <Text
            className={`mr-2 flex-1 text-sm ${
              item.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
            }`}
            numberOfLines={1}>
            {item.lastMessage.content}
          </Text>
          {item.unreadCount > 0 && (
            <View className="h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5">
              <Text className="text-xs font-semibold text-white">{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSeparator = () => <View className="ml-15 h-[1px] bg-gray-200" />;

  const renderEmptyState = () => (
    <View className="py-25 flex-1 items-center justify-center">
      <Ionicons
        name={searchQuery ? 'search-outline' : 'chatbubble-outline'}
        size={64}
        color="#9ca3af"
      />
      <Text className="mb-2 mt-4 text-lg font-semibold text-gray-600">
        {searchQuery ? 'No matches found' : 'No chats yet'}
      </Text>
      <Text className="text-center text-sm text-gray-500">
        {searchQuery ? 'Try a different search term' : 'Start a conversation with someone!'}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Search Bar */}
      <View className="border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center rounded-lg bg-gray-100 px-3 py-2">
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
          <TextInput
            className="ml-2 flex-1 text-gray-900"
            placeholder="Search chats..."
            value={searchQuery}
            onChangeText={handleSearch}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      <FlatList
        data={data}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
}
