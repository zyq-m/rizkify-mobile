import CustomMap from '@/components/custom/custom-map';
import { useItems } from '@/hooks/use-items';
import { useAuthStore } from '@/store/auth-store';
import dayjs from 'dayjs';
import relativetime from 'dayjs/plugin/relativeTime';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { Calendar, Heart, MapPin, Package, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function ItemDetails() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { useItem, useCreateRequest } = useItems();
  const { data: item, isPending, error } = useItem(id);
  const requestItem = useCreateRequest();

  const { user } = useAuthStore();

  const [imageError, setImageError] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(item?.isLiked);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [disabledReqBtn, setDisable] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleRequest = () => {
    if (item) {
      requestItem.mutate(
        {
          itemId: item.id,
          quantity: selectedQuantity,
          message: message,
        },
        {
          onSuccess: () => {
            Alert.alert('Item requested successfully');
            setShowQuantityModal(false);
            setMessage(undefined);
            router.back();
          },
        }
      );
    }
  };

  useEffect(() => {
    dayjs.extend(relativetime);
  }, []);

  useEffect(() => {
    if (user?.id === item?.userId) {
      setDisable(true);
    }
  }, [item?.userId, user]);

  useEffect(() => {
    if (item) {
      navigation.setOptions({ title: item.name });
    }
  }, [item, navigation]);

  if (isPending) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />
        <View className="flex-1 items-center justify-center">
          <View className="items-center">
            <View className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
            <Text className="mt-4 text-lg font-medium text-gray-600">Loading item...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (error || !item) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />
        <View className="flex-1 items-center justify-center px-8">
          <View className="items-center">
            <Package size={64} color="#9CA3AF" />
            <Text className="mt-4 text-xl font-semibold text-gray-900">Item not found</Text>
            <Text className="mt-2 text-center text-gray-600">
              The item you&apos;re looking for doesn&apos;t exist or has been removed.
            </Text>
            <Pressable onPress={handleBack} className="mt-6 rounded-2xl bg-black px-8 py-4">
              <Text className="font-semibold text-white">Go Back</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Image Gallery */}
        <View className="relative">
          {item.images.length > 0 && !imageError ? (
            <>
              <Image
                source={{ uri: item.images[selectedImageIndex].imageUrl }}
                className="h-96 w-full"
                resizeMode="cover"
                onError={() => setImageError(true)}
              />

              {/* Image Indicators */}
              {item.images.length > 1 && (
                <View className="absolute bottom-6 left-0 right-0">
                  <View className="flex-row justify-center">
                    <View className="flex-row rounded-full bg-black/50 px-4 py-2">
                      {item.images.map((_, index) => (
                        <Pressable
                          key={index}
                          onPress={() => setSelectedImageIndex(index)}
                          className={`mx-1 h-2 w-2 rounded-full ${
                            index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </>
          ) : (
            <View className="h-96 w-full items-center justify-center bg-gray-100">
              <Package size={80} color="#D1D5DB" />
              <Text className="mt-4 text-lg text-gray-500">No image available</Text>
            </View>
          )}

          <View className="absolute bottom-0 w-full flex-row items-center justify-between px-6 py-4">
            {/* Category Badge */}
            <View className="rounded-2xl bg-black px-4 py-2 shadow-lg">
              <Text className="font-semibold text-white">{item.category.name}</Text>
            </View>
            {/* Like Button */}
            <Pressable
              onPress={handleLike}
              className="h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-lg">
              <Heart
                size={24}
                color={isLiked ? '#EF4444' : '#6B7280'}
                fill={isLiked ? '#EF4444' : 'transparent'}
              />
            </Pressable>
          </View>
        </View>

        {/* Content */}
        <View className="px-6 pt-6">
          {/* Title and Basic Info */}
          <View className="mb-6">
            <View className="mb-3 flex-row items-start justify-between">
              <Text className="flex-1 pr-4 text-3xl font-bold text-gray-900">{item.name}</Text>
              <View className="rounded-2xl bg-green-100 px-3 py-1">
                <Text className="font-semibold text-green-800">{item.quantity} left</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="flex-row items-center">
                <User size={16} color="#6B7280" />
                <Text className="ml-2 text-gray-600">{item.user.name}</Text>
              </View>
              <Text className="mx-2 text-gray-300">•</Text>
              <Text className="text-gray-500">{dayjs(item.createdAt).fromNow()}</Text>
            </View>
          </View>

          {/* Description */}
          {item.description && (
            <View className="mb-8">
              <Text className="mb-3 text-xl font-semibold text-gray-900">Description</Text>
              <Text className="text-lg leading-7 text-gray-600">{item.description}</Text>
            </View>
          )}

          {/* Key Details Cards */}
          <View className="mb-8">
            <Text className="mb-4 text-xl font-semibold text-gray-900">Details</Text>
            <View className="rounded-3xl bg-gray-50 p-6">
              <View className="gap-4">
                <View className="flex-row items-center">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
                    <Calendar size={20} color="#D97706" />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="font-medium text-gray-900">Expiry Date</Text>
                    <Text className="text-gray-600">
                      {dayjs(item.expiry).format('MMMM DD, YYYY')}
                    </Text>
                    <Text className="text-sm font-medium text-orange-600">
                      {dayjs().to(item.expiry)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                    <Package size={20} color="#2563EB" />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="font-medium text-gray-900">Quantity</Text>
                    <Text className="text-gray-600">
                      {item.quantity} unit{item.quantity !== 1 ? 's' : ''} available
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Map */}

          <View>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-gray-900">Location</Text>
              <View className="flex-row items-center gap-2">
                <MapPin size={20} color="#10b981" />
                <Text>{item.distanceText} away</Text>
              </View>
            </View>
            <View className="mt-3 overflow-hidden rounded-lg border border-gray-200">
              <View className="h-48">
                <CustomMap {...item.location} />
              </View>
              <View className="border-t border-gray-200 p-3">
                <Text className="text-sm font-medium text-gray-900">{item.location.address}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Quantity Selection Modal */}
      <Modal
        visible={showQuantityModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQuantityModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="mx-4 w-11/12 max-w-sm rounded-3xl bg-white p-6">
            <Text className="mb-2 text-center text-xl font-bold text-gray-900">
              Select Quantity
            </Text>
            <Text className="mb-6 text-center text-gray-600">
              How many &quot;{item.name}&quot; would you like to request?
            </Text>

            {/* Quantity Selector */}
            <View className="mb-6 flex-row items-center justify-between">
              <Pressable
                onPress={() => {
                  if (selectedQuantity > 1) {
                    setSelectedQuantity(selectedQuantity - 1);
                  }
                }}
                className={`h-12 w-12 items-center justify-center rounded-full ${
                  selectedQuantity === 1 ? 'bg-gray-200' : 'bg-blue-500'
                }`}
                disabled={selectedQuantity === 1}>
                <Text
                  className={`text-lg font-bold ${
                    selectedQuantity === 1 ? 'text-gray-400' : 'text-white'
                  }`}>
                  -
                </Text>
              </Pressable>

              <View className="flex-1 items-center">
                <Text className="text-3xl font-bold text-gray-900">{selectedQuantity}</Text>
                <Text className="text-sm text-gray-500">of {item.quantity} available</Text>
              </View>

              <Pressable
                onPress={() => {
                  if (selectedQuantity < item.quantity) {
                    setSelectedQuantity(selectedQuantity + 1);
                  }
                }}
                className={`h-12 w-12 items-center justify-center rounded-full ${
                  selectedQuantity === item.quantity ? 'bg-gray-200' : 'bg-blue-500'
                }`}
                disabled={selectedQuantity === item.quantity}>
                <Text
                  className={`text-lg font-bold ${
                    selectedQuantity === item.quantity ? 'text-gray-400' : 'text-white'
                  }`}>
                  +
                </Text>
              </Pressable>
            </View>

            {/* ADD THIS SECTION - Message Input */}
            <View className="mb-6">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Message to donor (optional)
              </Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Let the donor know when you can pick up or any special requests..."
                multiline
                numberOfLines={3}
                className="rounded-2xl border border-gray-300 bg-gray-50 p-4 text-gray-900"
                textAlignVertical="top"
              />
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowQuantityModal(false)}
                className="flex-1 rounded-2xl bg-gray-200 py-4">
                <Text className="text-center font-semibold text-gray-700">Cancel</Text>
              </Pressable>
              <Pressable onPress={handleRequest} className="flex-1 rounded-2xl bg-yellow-500 py-4">
                <Text className="text-center font-semibold text-white">Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Fixed Bottom Action */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-6 py-4">
        {/* Show reason when disabled */}
        {disabledReqBtn && (
          <View className="mb-2 rounded-lg bg-gray-100 px-4 py-2">
            <Text className="text-center text-sm text-gray-600">
              {item?.quantity === 0
                ? 'This item is no longer available'
                : 'You cannot request this item'}
            </Text>
          </View>
        )}

        <View className="flex-row items-center gap-4">
          <Pressable
            disabled={disabledReqBtn}
            onPress={() => setShowQuantityModal(true)}
            className={`flex-1 rounded-2xl py-4 ${disabledReqBtn ? 'bg-gray-300' : 'bg-yellow-500 active:scale-95 active:opacity-90'}`}>
            <View className="flex-row items-center justify-center">
              <Package size={20} color={disabledReqBtn ? '#9CA3AF' : '#FFF'} />
              <Text
                className={`ml-2 text-center text-lg font-bold ${disabledReqBtn ? 'text-gray-500' : 'text-white'}`}>
                {disabledReqBtn ? 'Unavailable' : 'Request Item'}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
