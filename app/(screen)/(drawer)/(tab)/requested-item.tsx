import { ItemRequestStatus } from '@/api/service';
import { useItems } from '@/hooks/use-items';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Calendar, CheckCircle, Clock, Package, User, XCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

// Extend dayjs
dayjs.extend(relativeTime);

export default function RequestedItemsScreen() {
  const [filter, setFilter] = useState<ItemRequestStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { useRequestItem } = useItems();
  const { data: requestList, isPending, refetch } = useRequestItem();

  const requests =
    filter === 'all' ? requestList : requestList?.filter((request) => request.status === filter);

  const getStatusColor = (status: ItemRequestStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: ItemRequestStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock size={16} color="#D97706" />;
      case 'APPROVED':
        return <CheckCircle size={16} color="#2563EB" />;
      case 'REJECTED':
        return <XCircle size={16} color="#DC2626" />;
      case 'COMPLETED':
        return <CheckCircle size={16} color="#059669" />;
      default:
        return <Clock size={16} color="#6B7280" />;
    }
  };

  const getStatusText = (status: ItemRequestStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'APPROVED':
        return 'Accepted';
      case 'REJECTED':
        return 'Rejected';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    refetch();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  if (isPending) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header Loading */}
        <View className="border-b border-gray-200 bg-white px-6 py-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} className="mr-2 h-9 w-20 animate-pulse rounded-full bg-gray-300" />
            ))}
          </ScrollView>
        </View>

        {/* Content Loading */}
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <View className="mb-3 flex-row items-start justify-between">
                <View className="flex-1 flex-row">
                  <View className="mr-4 h-16 w-16 animate-pulse rounded-xl bg-gray-300" />
                  <View className="flex-1">
                    <View className="mb-2 h-4 w-3/4 animate-pulse rounded bg-gray-300" />
                    <View className="h-3 w-1/2 animate-pulse rounded bg-gray-300" />
                  </View>
                </View>
                <View className="h-8 w-24 animate-pulse rounded-full bg-gray-300" />
              </View>

              <View className="mb-3 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="h-4 w-4 animate-pulse rounded-full bg-gray-300" />
                  <View className="ml-2 h-4 w-24 animate-pulse rounded bg-gray-300" />
                </View>
                <View className="h-8 w-20 animate-pulse rounded-lg bg-gray-300" />
              </View>

              <View className="border-t border-gray-100 pt-3">
                <View className="h-3 w-32 animate-pulse rounded bg-gray-300" />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-6 py-4">
        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {(['all', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'] as const).map((status) => (
            <Pressable
              key={status}
              onPress={() => setFilter(status)}
              className={`mr-2 rounded-full px-4 py-2 ${
                filter === status ? 'bg-yellow-500' : 'bg-gray-200'
              }`}>
              <Text className={`font-medium ${filter === status ? 'text-white' : 'text-gray-700'}`}>
                {status === 'all' ? 'All' : getStatusText(status)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16 }}>
        {!requests?.length ? (
          <View className="items-center justify-center py-16">
            <Package size={64} color="#D1D5DB" />
            <Text className="mt-4 text-xl font-semibold text-gray-500">No requests found</Text>
            <Text className="mt-2 text-center text-gray-400">
              {filter === 'all' ? "You haven't made any requests yet." : `No requests found.`}
            </Text>
          </View>
        ) : (
          requests.map((request) => (
            <Pressable
              key={request.id}
              // onPress={() => handleRequestPress(request)}
              className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              {/* Header - Item Info and Status */}
              <View className="mb-3 flex-row items-start justify-between">
                <View className="flex-1 flex-row">
                  <Image
                    source={{ uri: request.item.images[0]?.imageUrl }}
                    className="mr-4 h-16 w-16 rounded-xl"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <Text className="mb-1 text-lg font-semibold text-gray-900" numberOfLines={2}>
                      {request.item.name}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {request.quantity} item{request.quantity !== 1 ? 's' : ''} requested
                    </Text>
                  </View>
                </View>
                <View
                  className={`flex-row items-center rounded-full border px-3 py-1 ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <Text className="ml-1 text-sm font-medium">{getStatusText(request.status)}</Text>
                </View>
              </View>

              {/* Donor Info */}
              <View className="mb-3 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <User size={16} color="#6B7280" />
                  <Text className="ml-2 text-gray-600">{request.provider.name}</Text>
                </View>
                <Pressable
                  // onPress={() => handleContactDonor(request.donor)}
                  className="rounded-lg bg-gray-100 px-3 py-1">
                  <Text className="text-sm font-medium text-gray-700">Contact</Text>
                </Pressable>
              </View>

              {/* Request Details */}
              <View className="border-t border-gray-100 pt-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Calendar size={14} color="#6B7280" />
                    <Text className="ml-2 text-sm text-gray-500">
                      Requested {dayjs(request.createdAt).fromNow()}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
