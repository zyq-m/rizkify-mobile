import { MyItemRes } from '@/api/service';
import { useUser } from '@/hooks/use-user';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter } from 'expo-router';
import { Calendar, Edit, Eye, Heart, MapPin, MoreVertical, Package, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';

// Extend dayjs
dayjs.extend(relativeTime);

export default function MyListing() {
  const router = useRouter();
  const { useMyItems } = useUser();
  const { data: items, isLoading, error, refetch, isRefetching } = useMyItems();
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MyItemRes | null>(null);

  const openOptionsModal = (item: MyItemRes) => {
    setSelectedItem(item);
    setShowOptionsModal(true);
  };

  const closeOptionsModal = () => {
    setShowOptionsModal(false);
    setSelectedItem(null);
  };

  const handleEditItem = (itemId: string) => {
    setShowOptionsModal(false);
    router.push({ pathname: '/(screen)/(item)/edit/[id]', params: { id: itemId } });
  };

  const handleViewDetails = (itemId: string) => {
    router.push({ pathname: '/(screen)/(item)/[id]', params: { id: itemId } });
  };

  const handleViewRequests = (itemId: string) => {
    router.push({ pathname: '/(screen)/(item)/requester/[id]', params: { id: itemId } });
  };

  const filterItems = (items: MyItemRes[]) => {
    if (filter === 'all') return items;
    if (filter === 'active') {
      return items.filter((item) => dayjs(item.expiry).isAfter(dayjs()));
    }
    if (filter === 'expired') {
      return items.filter((item) => dayjs(item.expiry).isBefore(dayjs()));
    }
    return items;
  };

  const getStatusColor = (expiry: Date) => {
    const daysUntilExpiry = dayjs(expiry).diff(dayjs(), 'day');

    if (daysUntilExpiry < 0) {
      return 'bg-red-100 text-red-800 border-red-200'; // Expired
    } else if (daysUntilExpiry <= 2) {
      return 'bg-orange-100 text-orange-800 border-orange-200'; // Expiring soon
    } else {
      return 'bg-green-100 text-green-800 border-green-200'; // Active
    }
  };

  const getStatusText = (expiry: Date) => {
    const daysUntilExpiry = dayjs(expiry).diff(dayjs(), 'day');

    if (daysUntilExpiry < 0) {
      return 'Expired';
    } else if (daysUntilExpiry === 0) {
      return 'Expires today';
    } else if (daysUntilExpiry === 1) {
      return 'Expires tomorrow';
    } else if (daysUntilExpiry <= 7) {
      return `Expires in ${daysUntilExpiry} days`;
    } else {
      return 'Active';
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <StatusBar barStyle="dark-content" />
        <View className="items-center">
          <View className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
          <Text className="mt-4 text-lg font-medium text-gray-600">Loading your listings...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <StatusBar barStyle="dark-content" />
        <View className="items-center">
          <Package size={64} color="#9CA3AF" />
          <Text className="mt-4 text-xl font-semibold text-gray-900">Failed to load listings</Text>
          <Text className="mt-2 text-center text-gray-600">
            Please check your connection and try again.
          </Text>
          <Pressable onPress={() => refetch()} className="mt-6 rounded-2xl bg-black px-8 py-4">
            <Text className="font-semibold text-white">Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const filteredItems = filterItems(items || []);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-6 py-4">
        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {(['all', 'active', 'expired'] as const).map((filterType) => (
            <Pressable
              key={filterType}
              onPress={() => setFilter(filterType)}
              className={`mr-2 rounded-full px-4 py-2 ${
                filter === filterType ? 'bg-yellow-500' : 'bg-gray-200'
              }`}>
              <Text
                className={`font-medium ${filter === filterType ? 'text-white' : 'text-gray-700'}`}>
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {filteredItems.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Package size={80} color="#D1D5DB" />
          <Text className="mt-4 text-xl font-semibold text-gray-900">No listings found</Text>
          <Text className="mt-2 text-center text-gray-600">
            {filter === 'all'
              ? "You haven't created any listings yet."
              : `No ${filter} listings found.`}
          </Text>
          <Pressable
            onPress={() => router.push('/(screen)/(drawer)/(tab)/new-item')}
            className="mt-6 rounded-2xl bg-yellow-500 px-8 py-4">
            <Text className="font-semibold text-white">Create Your First Listing</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={['#000']}
              tintColor="#000"
            />
          }
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {/* Image Section */}
              <View className="relative">
                {item.images.length > 0 ? (
                  <Image
                    source={{ uri: item.images[0].imageUrl }}
                    className="h-48 w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-48 w-full items-center justify-center bg-gray-200">
                    <Package size={48} color="#9CA3AF" />
                  </View>
                )}

                {/* Status Badge */}
                <View
                  className={`absolute left-4 top-4 rounded-full border px-3 py-1 ${getStatusColor(item.expiry)}`}>
                  <Text className="text-xs font-medium">{getStatusText(item.expiry)}</Text>
                </View>

                {/* Category Badge */}
                <View className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1">
                  <Text className="text-xs font-medium text-white">{item.category.name}</Text>
                </View>
              </View>

              {/* Content Section */}
              <View className="p-4">
                <View className="mb-3 flex-row items-start justify-between">
                  <Text
                    className="flex-1 pr-4 text-lg font-semibold text-gray-900"
                    numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Pressable onPress={() => openOptionsModal(item)} className="p-1">
                    <MoreVertical size={20} color="#6B7280" />
                  </Pressable>
                </View>

                {/* Description */}
                {item.description && (
                  <Text className="mb-3 text-gray-600" numberOfLines={2}>
                    {item.description}
                  </Text>
                )}

                {/* Location */}
                <View className="mb-3 flex-row items-center">
                  <MapPin size={14} color="#6B7280" />
                  <Text className="ml-2 flex-1 text-sm text-gray-600" numberOfLines={1}>
                    {item.location.address?.split(',')[1]}
                  </Text>
                </View>

                {/* Stats */}
                <View className="mb-4 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center">
                      <Heart size={16} color="#EF4444" />
                      <Text className="ml-1 text-sm font-medium text-gray-700">
                        {item.likeCount}
                      </Text>
                      <Text className="ml-1 text-sm text-gray-500">likes</Text>
                    </View>

                    <View className="flex-row items-center">
                      <Package size={16} color="#3B82F6" />
                      <Text className="ml-1 text-sm font-medium text-gray-700">
                        {item.pendingRequestCount}
                      </Text>
                      <Text className="ml-1 text-sm text-gray-500">requests</Text>
                    </View>

                    <View className="flex-row items-center">
                      <Package size={16} color="#10B981" />
                      <Text className="ml-1 text-sm font-medium text-gray-700">
                        {item.quantity}
                      </Text>
                      <Text className="ml-1 text-sm text-gray-500">available</Text>
                    </View>
                  </View>
                </View>

                {/* Bottom Info */}
                <View className="border-t border-gray-100 pt-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Calendar size={14} color="#6B7280" />
                      <Text className="ml-2 text-xs text-gray-500">
                        Expires: {dayjs(item.expiry).format('DD MMM YYYY')}
                      </Text>
                    </View>

                    <Text className="text-xs text-gray-500">
                      Listed {dayjs(item.createdAt).fromNow()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        />
      )}
      <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeOptionsModal}>
        <View className="flex-1 items-end justify-end bg-black/50">
          <View className="w-full rounded-t-3xl bg-white p-6">
            {/* Modal Header */}
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-gray-900">Item Options</Text>
              <Pressable onPress={closeOptionsModal} className="p-2">
                <X size={24} color="#6B7280" />
              </Pressable>
            </View>

            {/* Item Info */}
            {selectedItem && (
              <View className="mb-6 rounded-xl bg-gray-50 p-4">
                <Text className="font-semibold text-gray-900">{selectedItem.name}</Text>
                <Text className="text-sm text-gray-600">
                  {selectedItem.category.name} • {selectedItem.quantity} available
                </Text>
              </View>
            )}

            {/* Options List */}
            <View className="gap-2">
              <Pressable
                onPress={() => selectedItem && handleViewDetails(selectedItem.id)}
                className="flex-row items-center gap-4 rounded-xl p-4 active:bg-gray-100">
                <Eye size={20} color="#6B7280" />
                <Text className="flex-1 text-gray-900">View Details</Text>
              </Pressable>

              <Pressable
                onPress={() => selectedItem && handleEditItem(selectedItem.id)}
                className="flex-row items-center gap-4 rounded-xl p-4 active:bg-gray-100">
                <Edit size={20} color="#6B7280" />
                <Text className="flex-1 text-gray-900">Edit Item</Text>
              </Pressable>

              <Pressable
                onPress={() => selectedItem && handleViewRequests(selectedItem.id)}
                className="flex-row items-center gap-4 rounded-xl p-4 active:bg-gray-100">
                <Package size={20} color="#3B82F6" />
                <Text className="flex-1 text-gray-900">View Requests</Text>
                {selectedItem && (
                  <View className="rounded-full bg-blue-100 px-2 py-1">
                    <Text className="text-xs font-medium text-blue-800">
                      {selectedItem.pendingRequestCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>

            {/* Cancel Button */}
            <Pressable onPress={closeOptionsModal} className="mt-6 rounded-2xl bg-gray-200 py-4">
              <Text className="text-center font-semibold text-gray-700">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
