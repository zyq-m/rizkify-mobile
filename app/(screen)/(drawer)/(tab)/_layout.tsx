import { Tabs } from 'expo-router';
import { Home, ListChecks, MessageCircle, Plus, Search } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { useChat } from '@/hooks/use-chat';

function ChatTabIcon() {
  const { useUnreadCount } = useChat();
  const { data } = useUnreadCount();
  const unreadCount = data?.count ?? 0;

  return (
    <View style={{ position: 'relative' }}>
      <MessageCircle />
      {unreadCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#EF4444',
          }}
        />
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => <Home />,
        }}
      />
      <Tabs.Screen
        name="items"
        options={{
          title: 'Search',
          tabBarIcon: () => <Search />,
        }}
      />
      <Tabs.Screen
        name="new-item"
        options={{
          title: 'Add',
          tabBarIcon: () => <Plus />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chat',
          tabBarIcon: () => <ChatTabIcon />,
        }}
      />
      <Tabs.Screen
        name="requested-item"
        options={{
          title: 'Requests',
          tabBarIcon: ({ color, size }) => <ListChecks size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
