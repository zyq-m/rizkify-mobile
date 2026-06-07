import { ItemRequestStatus, RequestItem } from '@/api/service';
import { useItems } from '@/hooks/use-items';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Filter,
  Heart,
  MessageCircle,
  Package,
  User,
  X,
  XCircle,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
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

export default function ItemRequest() {
  const { id: itemId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [filter, setFilter] = useState<'all' | ItemRequestStatus>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const { useItem, useUpdateRequest } = useItems();
  const { data: item, error, isPending, refetch, isRefetching } = useItem(itemId);
  const requestItem = useUpdateRequest();

  const handleBack = () => {
    router.back();
  };

  const openRequestDetails = (request: RequestItem) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  const closeRequestDetails = () => {
    setShowRequestModal(false);
    setSelectedRequest(null);
  };

  const handleStatusChange = async (requestId: string, newStatus: ItemRequestStatus) => {
    Alert.alert(
      'Change Status',
      `Are you sure you want to mark this request as ${newStatus.toLowerCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'default',
          onPress: async () => {
            // Implement API call to update request status
            requestItem.mutate(
              {
                id: requestId,
                status: newStatus,
              },
              {
                onSuccess: () => {
                  refetch();
                },
              }
            );
          },
        },
      ]
    );
  };

  const handleContact = (userId: string) => {
    // Find requester from item data
    const requester = item?.requests.find((req) => req.id === userId);
    if (!requester) {
      Alert.alert('No Contact Info', 'Could not find contact information for this user.');
      return;
    }

    // Note: You might need to adjust this based on your user structure
    Alert.alert('Contact Requester', 'This would open contact options in a real app', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Message', style: 'default' },
      { text: 'Call', style: 'default' },
    ]);
  };

  const getStatusColor = (status: ItemRequestStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-emerald-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: ItemRequestStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock size={16} color="#D97706" />;
      case 'APPROVED':
        return <CheckCircle size={16} color="#059669" />;
      case 'REJECTED':
        return <XCircle size={16} color="#DC2626" />;
      case 'COMPLETED':
        return <CheckCircle size={16} color="#2563EB" />;
      default:
        return <Clock size={16} color="#6B7280" />;
    }
  };

  const getStatusText = (status: ItemRequestStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  const filterRequests = (requests: RequestItem[]) => {
    if (filter === 'all') return requests;
    return requests.filter((request) => request.status === filter);
  };

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <StatusBar barStyle="dark-content" />
        <View className="items-center">
          <View className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
          <Text className="mt-4 text-lg font-medium text-gray-600">Loading requests...</Text>
        </View>
      </View>
    );
  }

  if (error || !item) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <StatusBar barStyle="dark-content" />
        <View className="items-center">
          <Package size={64} color="#9CA3AF" />
          <Text className="mt-4 text-xl font-semibold text-gray-900">Failed to load item</Text>
          <Text className="mt-2 text-center text-gray-600">
            The item or its requests could not be loaded.
          </Text>
          <Pressable onPress={handleBack} className="mt-6 rounded-2xl bg-black px-8 py-4">
            <Text className="font-semibold text-white">Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const requests = item.requests || [];
  const filteredRequests = filterRequests(requests);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-6 py-4">
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View>
              <Text className="text-2xl font-bold text-gray-900">{item.name}</Text>
              <Text className="text-gray-500">{item.category.name}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => setShowFilterModal(true)}
            className="flex-row items-center rounded-full bg-gray-100 px-4 py-2">
            <Filter size={16} color="#6B7280" />
            <Text className="ml-2 font-medium text-gray-700">
              {filter === 'all' ? 'All' : getStatusText(filter)}
            </Text>
            <View className="ml-1">
              <ChevronRight size={16} color="#6B7280" />
            </View>
          </Pressable>
        </View>

        {/* Item Summary */}
        <View className="mb-3 rounded-xl bg-gray-50 p-4">
          <View className="flex-row items-center">
            {item.images.length > 0 ? (
              <Image
                source={{ uri: item.images[0].imageUrl }}
                className="mr-4 h-16 w-16 rounded-lg"
                resizeMode="cover"
              />
            ) : (
              <View className="mr-4 h-16 w-16 items-center justify-center rounded-lg bg-gray-200">
                <Package size={24} color="#9CA3AF" />
              </View>
            )}

            <View className="flex-1">
              <Text className="font-semibold text-gray-900">{item.name}</Text>
              <View className="mt-1 flex-row items-center">
                <Text className="mr-3 text-sm text-gray-600">{item.quantity} available</Text>
                <View className="flex-row items-center">
                  <Heart size={14} color="#EF4444" />
                  <Text className="ml-1 text-sm text-gray-600">{item.likedBy.length} likes</Text>
                </View>
              </View>
              <Text className="mt-1 text-sm text-gray-600">
                Expires: {dayjs(item.expiry).format('DD MMM YYYY')}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        {requests.length > 0 && (
          <View className="flex-row gap-4">
            <View className="flex-1 rounded-xl bg-gray-50 p-3">
              <Text className="text-sm text-gray-500">Requester</Text>
              <Text className="text-xl font-bold text-gray-900">{requests.length}</Text>
            </View>
            <View className="flex-1 rounded-xl bg-yellow-50 p-3">
              <Text className="text-sm text-yellow-600">Pending</Text>
              <Text className="text-xl font-bold text-yellow-900">
                {requests.filter((r) => r.status === 'PENDING').length}
              </Text>
            </View>
            <View className="flex-1 rounded-xl bg-emerald-50 p-3">
              <Text className="text-sm text-green-600">Approved</Text>
              <Text className="text-xl font-bold text-green-900">
                {requests.filter((r) => r.status === 'APPROVED').length}
              </Text>
            </View>
          </View>
        )}
      </View>

      {filteredRequests.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Package size={80} color="#D1D5DB" />
          <Text className="mt-4 text-xl font-semibold text-gray-900">No requests found</Text>
          <Text className="mt-2 text-center text-gray-600">
            {filter === 'all'
              ? 'No one has requested this item yet.'
              : `No ${filter.toLowerCase()} requests found.`}
          </Text>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={['#000']}
              tintColor="#000"
            />
          }
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}>
          {filteredRequests.map((request) => (
            <Pressable
              key={request.id}
              onPress={() => openRequestDetails(request)}
              className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <View className="mb-3 flex-row items-start justify-between">
                <View className="flex-1 flex-row">
                  <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-gray-300">
                    <User size={20} color="#6B7280" />
                  </View>

                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900">{request.requester.name}</Text>
                    <Text className="text-sm text-gray-500">
                      Requested {dayjs(request.createdAt).fromNow()}
                    </Text>
                  </View>
                </View>

                <View
                  className={`flex-row items-center rounded-full border px-3 py-1 ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <Text className="ml-1 text-sm font-medium">{getStatusText(request.status)}</Text>
                </View>
              </View>

              <View className="mb-3">
                <View className="mb-2 flex-row items-center">
                  <Package size={14} color="#6B7280" />
                  <Text className="ml-2 text-gray-700">
                    Requested quantity: <Text className="font-semibold">{request.quantity}</Text>
                  </Text>
                </View>

                {request.message && (
                  <View className="rounded-lg bg-gray-50 p-3">
                    <Text className="text-sm text-gray-600">&quot;{request.message}&quot;</Text>
                  </View>
                )}
              </View>

              <View className="flex-row items-center justify-between border-t border-gray-100 pt-3">
                <Pressable
                  onPress={() => handleContact(request.requesterId)}
                  className="flex-row items-center rounded-lg bg-gray-100 px-3 py-2">
                  <MessageCircle size={16} color="#6B7280" />
                  <Text className="ml-2 text-sm font-medium text-gray-700">Contact</Text>
                </Pressable>

                <View className="flex-row gap-2">
                  {request.status === 'PENDING' && (
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => handleStatusChange(request.id, 'APPROVED')}
                        className="rounded-lg bg-emerald-100 px-3 py-2">
                        <Text className="text-sm font-medium text-green-800">Approve</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleStatusChange(request.id, 'REJECTED')}
                        className="rounded-lg bg-red-100 px-3 py-2">
                        <Text className="text-sm font-medium text-red-800">Reject</Text>
                      </Pressable>
                    </View>
                  )}

                  {request.status === 'APPROVED' && (
                    <Pressable
                      onPress={() => handleStatusChange(request.id, 'COMPLETED')}
                      className="rounded-lg bg-blue-100 px-3 py-2">
                      <Text className="text-sm font-medium text-blue-800">Mark Complete</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}>
        <View className="flex-1 items-end justify-end bg-black/50">
          <View className="w-full rounded-t-3xl bg-white p-6">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-gray-900">Filter Requests</Text>
              <Pressable onPress={() => setShowFilterModal(false)} className="p-2">
                <X size={24} color="#6B7280" />
              </Pressable>
            </View>

            <View className="gap-2">
              {(['all', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'] as const).map((status) => (
                <Pressable
                  key={status}
                  onPress={() => {
                    setFilter(status);
                    setShowFilterModal(false);
                  }}
                  className={`flex-row items-center justify-between rounded-xl p-4 ${
                    filter === status ? 'bg-gray-100' : ''
                  }`}>
                  <View className="flex-row items-center">
                    {getStatusIcon(status === 'all' ? 'PENDING' : status)}
                    <Text className="ml-3 text-gray-900">
                      {status === 'all' ? 'All Requests' : getStatusText(status)}
                    </Text>
                  </View>
                  {filter === status && <CheckCircle size={20} color="#10B981" />}
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={() => setShowFilterModal(false)}
              className="mt-6 rounded-2xl bg-gray-200 py-4">
              <Text className="text-center font-semibold text-gray-700">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Request Details Modal */}
      <Modal
        visible={showRequestModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeRequestDetails}>
        <View className="flex-1 items-end justify-end bg-black/50">
          <View className="max-h-[90%] w-full rounded-t-3xl bg-white p-6">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-6 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-gray-900">Request Details</Text>
                <Pressable onPress={closeRequestDetails} className="p-2">
                  <X size={24} color="#6B7280" />
                </Pressable>
              </View>

              {selectedRequest && (
                <>
                  {/* Requester Info */}
                  <View className="mb-6 rounded-xl bg-gray-50 p-4">
                    <View className="flex-row items-center">
                      <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-gray-300">
                        <User size={24} color="#6B7280" />
                      </View>

                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-gray-900">
                          Name: {selectedRequest.requester.name}
                        </Text>
                        <Text className="text-gray-600">
                          Requested {dayjs(selectedRequest.createdAt).fromNow()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Request Details */}
                  <View className="mb-6">
                    <Text className="mb-4 text-lg font-semibold text-gray-900">
                      Request Information
                    </Text>

                    <View className="gap-4">
                      <View className="flex-row items-center">
                        <Package size={20} color="#6B7280" />
                        <View className="ml-4 flex-1">
                          <Text className="font-medium text-gray-900">Quantity Requested</Text>
                          <Text className="text-gray-600">{selectedRequest.quantity} units</Text>
                        </View>
                      </View>

                      <View className="flex-row items-center">
                        <Calendar size={20} color="#6B7280" />
                        <View className="ml-4 flex-1">
                          <Text className="font-medium text-gray-900">Request Date</Text>
                          <Text className="text-gray-600">
                            {dayjs(selectedRequest.createdAt).format('MMMM DD, YYYY hh:mm A')}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center">
                        <Clock size={20} color="#6B7280" />
                        <View className="ml-4 flex-1">
                          <Text className="font-medium text-gray-900">Status</Text>
                          <View
                            className={`self-start rounded-full px-3 py-1 ${getStatusColor(selectedRequest.status)}`}>
                            <Text className="font-medium">
                              {getStatusText(selectedRequest.status)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Message */}
                  {selectedRequest.message && (
                    <View className="mb-6">
                      <Text className="mb-2 text-lg font-semibold text-gray-900">
                        Message from Requester
                      </Text>
                      <View className="rounded-xl bg-gray-50 p-4">
                        <Text className="leading-relaxed text-gray-600">
                          &quot;{selectedRequest.message}&quot;
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Actions */}
                  {selectedRequest.status !== 'COMPLETED' && (
                    <View className="mb-6">
                      <Text className="mb-4 text-lg font-semibold text-gray-900">Actions</Text>

                      {selectedRequest.status === 'PENDING' && (
                        <View className="flex-row gap-3">
                          <Pressable
                            onPress={() => {
                              handleStatusChange(selectedRequest.id, 'APPROVED');
                              closeRequestDetails();
                            }}
                            className="flex-1 rounded-2xl bg-emerald-500 py-4">
                            <Text className="text-center font-semibold text-white">
                              Approve Request
                            </Text>
                          </Pressable>

                          <Pressable
                            onPress={() => {
                              handleStatusChange(selectedRequest.id, 'REJECTED');
                              closeRequestDetails();
                            }}
                            className="flex-1 rounded-2xl bg-red-500 py-4">
                            <Text className="text-center font-semibold text-white">
                              Reject Request
                            </Text>
                          </Pressable>
                        </View>
                      )}

                      {selectedRequest.status === 'APPROVED' && (
                        <Pressable
                          onPress={() => {
                            handleStatusChange(selectedRequest.id, 'COMPLETED');
                            closeRequestDetails();
                          }}
                          className="rounded-2xl bg-blue-500 py-4">
                          <Text className="text-center font-semibold text-white">
                            Mark as Completed
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
