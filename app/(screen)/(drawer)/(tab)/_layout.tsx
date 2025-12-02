import { Tabs } from 'expo-router';
import { Home, ListChecks, MessageCircle, Plus, Search } from 'lucide-react-native';
import React from 'react';

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
          tabBarIcon: () => <MessageCircle />,
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
