import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { Camera, ChevronRight, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, View } from 'react-native';

import Card from '@/components/custom/card';
import CustomMap from '@/components/custom/custom-map';
import InputForm from '@/components/custom/input-form';
import SelectFrom from '@/components/custom/select-form';
import SetSearchLocationModal, { SearchLocation } from '@/components/custom/set-location-v2';
import { Text } from '@/components/nativewindui/Text';
import { useItems } from '@/hooks/use-items';
import { useLookup } from '@/hooks/use-lookup';
import usePickImage from '@/hooks/use-pick-image';
import itemSchema from '@/utils/form/item';
import { z } from 'zod';

// Update form schema (remove required for images since they might already exist)
const updateItemSchema = itemSchema.extend({
  images: itemSchema.shape.images.optional(),
  existingImageUrls: z.array(z.string()).optional(),
});

// type UpdateItemFormT = ItemFormT & {
//   existingImageUrls?: string[]; // For tracking existing images
// };

export type UpdateItemFormT = z.infer<typeof updateItemSchema>;

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<UpdateItemFormT>({
    resolver: zodResolver(updateItemSchema),
    defaultValues: {
      quantity: '1',
    },
  });

  const { useCategories, expiry, conditions } = useLookup();
  const { data: categories } = useCategories();
  const { useItem, useUpdateItem } = useItems();
  const { data: item, isLoading: isItemLoading, error } = useItem(id);
  const updateItem = useUpdateItem();

  const { pickImage, images, clear: clearImages, removeImage } = usePickImage();
  const [modal, setModal] = useState(false);
  const [coords, setCoords] = useState<SearchLocation | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // Load item data when component mounts
  useEffect(() => {
    if (item) {
      // Populate form with existing item data
      reset({
        name: item.name,
        description: item.description || '',
        quantity: item.quantity.toString(),
        categoryId: item.categoryId,
        conditionId: item.conditionId,
        expiry: '', // Format date for input
        location: item.location,
      });

      // Set existing images
      if (item.images.length > 0) {
        const imageUrls = item.images.map((img) => img.imageUrl);
        setExistingImages(imageUrls);
        setValue('existingImageUrls', imageUrls);
      }

      // Set location
      if (item.location) {
        setCoords(item.location);
        setValue('location', item.location);
      }
    }
  }, [item, reset, setValue]);

  const onSubmit: SubmitHandler<UpdateItemFormT> = async (data) => {
    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('quantity', data.quantity);
    formData.append('categoryId', data.categoryId.toString());
    formData.append('conditionId', data.conditionId.toString());
    formData.append('description', data.description.toString());
    formData.append('expiry', data.expiry.toString());
    formData.append('location', JSON.stringify(data.location));

    // Add new images
    data.images?.forEach((img) => {
      formData.append('newImages', img as any);
    });

    // Add existing images that should be kept
    const keptImages = existingImages.filter((img) => !imagesToDelete.includes(img));
    keptImages.forEach((imgUrl, index) => {
      formData.append('existingImages', imgUrl);
    });

    // Add images to delete
    imagesToDelete.forEach((imgUrl) => {
      formData.append('imagesToDelete', imgUrl);
    });

    updateItem.mutate(
      { id, formData },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Item updated successfully!');
          clearImages();
          setImagesToDelete([]);
          router.back();
        },
        onError: (error) => {
          if (isAxiosError(error)) {
            console.log('Update error:', error.response?.data);
            Alert.alert(
              'Error',
              error.response?.data?.message || 'Failed to update item. Please try again.'
            );
          } else {
            Alert.alert('Error', 'Failed to update item. Please try again.');
          }
        },
      }
    );
  };

  // Handle image selection
  useEffect(() => {
    if (images.length) {
      setValue('images', images);
    }
  }, [images, setValue]);

  // Handle location update
  useEffect(() => {
    if (coords) {
      setValue('location', coords);
    }
  }, [coords, setValue]);

  const handleRemoveExistingImage = (imageUrl: string) => {
    setImagesToDelete((prev) => [...prev, imageUrl]);
    setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
  };

  const handleRestoreImage = (imageUrl: string) => {
    setImagesToDelete((prev) => prev.filter((img) => img !== imageUrl));
    setExistingImages((prev) => [...prev, imageUrl]);
  };

  const selectedLocation = watch('location');

  const handleBack = () => {
    router.back();
  };

  if (isItemLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-4 text-gray-600">Loading item details...</Text>
      </View>
    );
  }

  if (error || !item) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-lg font-semibold text-gray-900">Item not found</Text>
        <Text className="mt-2 text-center text-gray-600">
          The item you&apos;re trying to edit doesn&apos;t exist or you don&apos;t have permission
          to edit it.
        </Text>
        <Pressable onPress={handleBack} className="mt-6 rounded-lg bg-black px-6 py-3">
          <Text className="font-medium text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Images Section */}
        <Card>
          <View>
            <View className="mb-3 flex-row items-center justify-between">
              <Text
                className={`text-sm font-medium ${errors.images ? 'text-red-500' : 'text-gray-900'}`}>
                Photos
              </Text>
              <Text className={`text-xs ${errors.images ? 'text-red-500' : 'text-gray-500'}`}>
                {existingImages.length + images.length}/5
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}>
              {/* New image upload button */}
              {existingImages.length + images.length < 5 && (
                <Pressable
                  onPress={pickImage}
                  className={`h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed ${
                    errors.images ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                  }`}>
                  <Camera size={20} color={errors.images ? '#EF4444' : '#9CA3AF'} />
                </Pressable>
              )}

              {/* Existing images */}
              {existingImages.map((imgUrl, index) => (
                <View key={`existing-${index}`} className="relative">
                  <Image source={{ uri: imgUrl }} className="h-24 w-24 rounded-lg" />
                  <Pressable
                    onPress={() => handleRemoveExistingImage(imgUrl)}
                    className="absolute right-1 top-1 h-5 w-5 items-center justify-center rounded-full bg-red-500">
                    <X size={12} color="white" />
                  </Pressable>
                </View>
              ))}

              {/* New images */}
              {images.map((img, index) => (
                <View key={`new-${img.uri}`} className="relative">
                  <Image source={{ uri: img.uri }} className="h-24 w-24 rounded-lg" />
                  <Pressable
                    onPress={() => removeImage(index)}
                    className="absolute right-1 top-1 h-5 w-5 items-center justify-center rounded-full bg-red-500">
                    <X size={12} color="white" />
                  </Pressable>
                </View>
              ))}
            </ScrollView>

            {/* Deleted images section (can be restored) */}
            {imagesToDelete.length > 0 && (
              <View className="mt-3">
                <Text className="mb-2 text-xs text-gray-500">Recently removed (can restore):</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}>
                  {imagesToDelete.map((imgUrl, index) => (
                    <View key={`deleted-${index}`} className="relative opacity-60">
                      <Image source={{ uri: imgUrl }} className="h-16 w-16 rounded-lg" />
                      <Pressable
                        onPress={() => handleRestoreImage(imgUrl)}
                        className="absolute inset-0 items-center justify-center rounded-lg bg-black/40">
                        <Text className="text-xs font-medium text-white">Restore</Text>
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {errors.images && (
              <Text className="mt-2 text-xs font-medium text-red-500">{errors.images.message}</Text>
            )}

            {!existingImages.length && !images.length && !errors.images && (
              <Text className="mt-2 text-center text-xs text-gray-400">
                Add photos to help others see your item
              </Text>
            )}
          </View>
        </Card>

        {/* Item Details */}
        <View className="mt-3">
          <Card>
            <View className="gap-4">
              <Text className="mb-1 text-sm font-medium text-gray-900">Item Information</Text>

              <Controller
                control={control}
                name="name"
                render={({ field: { value, onChange, onBlur } }) => (
                  <InputForm
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name}
                    errorMsg={errors.name?.message}
                    placeholder="What are you sharing?"
                    className="text-sm">
                    Title
                  </InputForm>
                )}
              />

              <Controller
                control={control}
                name="description"
                render={({ field: { value, onChange, onBlur } }) => (
                  <InputForm
                    multiline
                    numberOfLines={3}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.description}
                    errorMsg={errors.description?.message}
                    placeholder="Describe the item and its condition..."
                    textAlignVertical="top"
                    className="text-sm">
                    Description
                  </InputForm>
                )}
              />

              <Controller
                control={control}
                name="quantity"
                render={({ field: { value, onChange, onBlur } }) => (
                  <InputForm
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.quantity}
                    errorMsg={errors.quantity?.message}
                    placeholder="How many?"
                    className="text-sm">
                    Quantity
                  </InputForm>
                )}
              />

              <Controller
                control={control}
                name="categoryId"
                render={({ field: { value, onChange, onBlur } }) => (
                  <SelectFrom
                    selectItems={categories?.map((cat) => ({ label: cat.name, value: cat.id }))}
                    onValueChange={onChange}
                    selectedValue={value}
                    onBlur={onBlur}
                    error={errors.categoryId}
                    errorMsg={errors.categoryId?.message}
                    placeholder="Choose category">
                    Category
                  </SelectFrom>
                )}
              />

              <Controller
                control={control}
                name="conditionId"
                render={({ field: { value, onChange, onBlur } }) => (
                  <SelectFrom
                    selectItems={conditions.data?.map(({ id, name }) => ({
                      label: name,
                      value: id,
                    }))}
                    onValueChange={onChange}
                    selectedValue={value}
                    onBlur={onBlur}
                    error={errors.conditionId}
                    errorMsg={errors.conditionId?.message}
                    placeholder="Select condition">
                    Condition
                  </SelectFrom>
                )}
              />

              <Controller
                control={control}
                name="expiry"
                render={({ field: { value, onChange, onBlur } }) => (
                  <SelectFrom
                    selectItems={expiry.data}
                    onValueChange={onChange}
                    selectedValue={value}
                    onBlur={onBlur}
                    error={errors.expiry}
                    errorMsg={errors.expiry?.message}
                    placeholder="How long available?">
                    Expiry Date
                  </SelectFrom>
                )}
              />
            </View>
          </Card>
        </View>

        {/* Location Section */}
        <View className="mt-3">
          <Card>
            <Pressable
              className="flex-row items-center justify-between"
              onPress={() => setModal(true)}>
              <View className="flex-1">
                <Text className="mb-1 text-sm font-medium text-gray-900">Pickup Location</Text>
                <Text className={`text-xs ${errors.location ? 'text-red-500' : 'text-gray-500'}`}>
                  {selectedLocation ? 'Location set ✓' : 'Tap to set location'}
                </Text>
              </View>
              <ChevronRight size={16} color="#6B7280" />
            </Pressable>

            {errors.location && (
              <Text className="mt-1 text-xs text-red-500">{errors.location.message}</Text>
            )}

            {coords && (
              <View className="mt-3 overflow-hidden rounded-lg border border-gray-200">
                <View className="h-32">
                  <CustomMap {...coords} />
                </View>
                <View className="border-t border-gray-200 p-3">
                  <Text className="text-sm font-medium text-gray-900">{coords.address}</Text>
                </View>
              </View>
            )}
          </Card>
        </View>

        {/* Submit Buttons */}
        <View className="mt-6 gap-3 px-4">
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={updateItem.isPending}
            className={`items-center rounded-lg py-3 ${
              updateItem.isPending ? 'bg-gray-400' : 'bg-yellow-500'
            }`}>
            <Text className="text-base font-medium text-white">
              {updateItem.isPending ? 'Updating Item...' : 'Update Item'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Alert.alert(
                'Cancel Editing',
                'Are you sure you want to cancel? Your changes will be lost.',
                [
                  { text: 'Continue Editing', style: 'cancel' },
                  { text: 'Discard Changes', style: 'destructive', onPress: handleBack },
                ]
              );
            }}
            className="items-center rounded-lg border border-gray-300 py-3">
            <Text className="text-base font-medium text-gray-700">Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Location Modal */}
      <SetSearchLocationModal
        visible={modal}
        onLocationSet={(e) => setCoords(e)}
        onClose={() => setModal(false)}
        hideRange
      />
    </View>
  );
}
