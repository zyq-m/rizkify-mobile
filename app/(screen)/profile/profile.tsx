import ConfirmDialog from '@/components/custom/confirm-dialog';
import CustomHeader from '@/components/custom/custom-header';
import SetSearchLocationModal, { SearchLocation } from '@/components/custom/set-location-v2';
import { useAuth } from '@/hooks/use-auth';
import { useUser } from '@/hooks/use-user';
import dayjs from 'dayjs';
import { router, Stack } from 'expo-router';
import {
  Calendar,
  ChevronRight,
  Edit3,
  Eye,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  User,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useToast } from '@/providers/ToastProvider';

export default function Profile() {
  const { useProfile, useUpdateProfile, useUserStats } = useUser();
  const { showToast } = useToast();
  const { mutate: logout } = useAuth().logout;
  const { data: profile } = useProfile();
  const { data: stats } = useUserStats();
  const { mutate: updateLocation } = useUpdateProfile();

  const [showLocationModal, setShow] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Edit Profile',
          onPress: () => router.push('/(screen)/profile/edit'),
          color: '#3B82F6',
        },
        {
          icon: Eye,
          label: 'Password',
          onPress: () => router.push('/(screen)/profile/change-pass'),
          color: '#6B7280',
        },
        {
          icon: MapPin,
          label: 'Change location',
          onPress: () => setShow(true),
          color: '#059669',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & Support',
          onPress: () => router.push('/(screen)/help'),
          color: '#F59E0B',
        },
        {
          icon: Heart,
          label: 'About Rizkify',
          onPress: () => router.push('/(screen)/about'),
          color: '#EF4444',
        },
      ],
    },
  ];

  const handleLogout = () => {
    setShowLogout(true);
  };

  const handleChangeLocation = (location: SearchLocation) => {
    updateLocation(
      { location: JSON.stringify(location) },
      {
        onSuccess: () => {
          showToast('success', 'Success', 'Your location updated successfully');
        },
        onError: (error) => {
          showToast('error', 'Error', error.message);
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <CustomHeader navigation={navigation} title="Profile" backBtn />
          ),
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="bg-white px-6 py-8">
          <View className="items-center">
            {/* Avatar */}
            <View className="relative">
              <View className="h-24 w-24  items-center justify-center rounded-full bg-gray-200">
                {profile?.imageUrl ? (
                  <Image source={{ uri: profile.imageUrl }} className="h-24 w-24 rounded-full" />
                ) : (
                  <User size={40} color="#6B7280" />
                )}
              </View>
              <Pressable
                onPress={() => router.push('/(screen)/profile/edit')}
                className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-yellow-500">
                <Edit3 size={14} color="white" />
              </Pressable>
            </View>

            {/* User Info */}
            <Text className="mt-4 text-2xl font-bold text-gray-900">{profile?.name}</Text>
            <Text className="mt-1 text-gray-600">{profile?.email}</Text>

            {/* Location & Join Date */}
            <View className="mt-3 flex-row items-center gap-4">
              <View className="flex-row items-center">
                <MapPin size={14} color="#6B7280" />
                <Text className="ml-1 text-sm text-gray-600">
                  {profile?.location?.address?.split(',')[1]}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Calendar size={14} color="#6B7280" />
                <Text className="ml-1 text-sm text-gray-600">
                  Joined {dayjs(profile?.createdAt).format('MMMM YYYY')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View className="mt-6 px-6">
          <View className="rounded-2xl bg-white p-6 shadow-sm">
            <Text className="mb-4 text-center text-lg font-semibold text-gray-900">
              Community Impact
            </Text>
            <View className="flex-row justify-between gap-4">
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-yellow-600">{stats?.itemsShared ?? 0}</Text>
                <Text className="mt-1 text-center text-xs text-gray-600">Items Shared</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-emerald-600">{stats?.itemsReceived ?? 0}</Text>
                <Text className="mt-1 text-center text-xs text-gray-600">Items Received</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-blue-600">{stats?.totalImpact ?? 0}</Text>
                <Text className="mt-1 text-center text-xs text-gray-600">Total Impact</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        <View className="mt-6 px-6">
          {menuSections.map((section, sectionIndex) => (
            <View key={section.title} className="mb-6">
              <Text className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
                {section.title}
              </Text>

              <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <Pressable
                      key={item.label}
                      onPress={item.onPress}
                      className={`flex-row items-center px-4 py-4 ${
                        itemIndex < section.items.length - 1 ? 'border-b border-gray-100' : ''
                      } active:bg-gray-50`}>
                      <View
                        className="h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${item.color}15` }} // 15 = 8% opacity
                      >
                        <Icon size={20} color={item.color} />
                      </View>
                      <Text className="ml-3 flex-1 font-medium text-gray-900">{item.label}</Text>
                      <ChevronRight size={18} color="#D1D5DB" />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Logout Button */}
        <View className="mb-8 mt-2 px-6">
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center justify-center rounded-2xl bg-white px-4 py-4 shadow-sm active:bg-gray-50">
            <LogOut size={20} color="#EF4444" />
            <Text className="ml-3 font-medium text-red-500">Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>
      <SetSearchLocationModal
        initialLocation={profile?.location}
        visible={showLocationModal}
        onClose={() => setShow(false)}
        onLocationSet={handleChangeLocation}
        hideRange
      />
      <ConfirmDialog
        visible={showLogout}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        confirmDestructive
        onConfirm={() => {
          setShowLogout(false);
          logout(undefined, {
            onError: (err) => {
              showToast('error', 'Error', err.message);
            },
          });
        }}
        onCancel={() => setShowLogout(false)}
      />
    </View>
  );
}
