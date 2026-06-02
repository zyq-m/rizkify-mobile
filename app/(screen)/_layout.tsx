import useNotification from '@/hooks/use-notification';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';

export default function Root() {
  const { isAuthenticated, setAuth, setLoading } = useAuthStore();
  const { schedulePushNotification } = useNotification();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session?.user ?? null, session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(session?.user ?? null, session);
    });

    return () => subscription.unsubscribe();
  }, [setAuth, setLoading]);

  // Real-time chat listener for notifications
  useEffect(() => {
    const channel = supabase
      .channel('chat-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        async (payload) => {
          const message = payload.new as any;
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (message.receiver_id === session?.user?.id) {
            schedulePushNotification({
              title: 'New message',
              body: message.content,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [schedulePushNotification]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(drawer)" />
        <Stack.Screen name="(item)" />
        <Stack.Screen name="(location)" />
      </Stack.Protected>
    </Stack>
  );
}
