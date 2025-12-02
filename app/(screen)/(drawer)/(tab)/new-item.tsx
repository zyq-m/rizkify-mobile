import Card from '@/components/custom/card';
import CustomMap from '@/components/custom/custom-map';
import InputForm from '@/components/custom/input-form';
import SelectFrom from '@/components/custom/select-form';
import SetSearchLocationModal, { SearchLocation } from '@/components/custom/set-location-v2';
import { Text } from '@/components/nativewindui/Text';
import { useItems } from '@/hooks/use-items';
import { useLookup } from '@/hooks/use-lookup';
import usePickImage from '@/hooks/use-pick-image';
import itemSchema, { ItemFormT } from '@/utils/form/item';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { router } from 'expo-router';
import { Camera, ChevronRight, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Alert, Image, Pressable, ScrollView, View } from 'react-native';

export default function NewItemScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<ItemFormT>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      quantity: '1',
    },
  });

  const { useCategories, expiry, conditions } = useLookup();
  const { data: categories } = useCategories();
  const { useCreateItem } = useItems();
  const item = useCreateItem();

  const { pickImage, images, clear: clearImages, removeImage } = usePickImage();
  // const { coords, clear: clearCoords } = useCoords();
  const [modal, setModal] = useState(false);
  const [coords, setCoords] = useState<SearchLocation | null>(null);

  const onSubmit: SubmitHandler<ItemFormT> = async (data) => {
    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('quantity', data.quantity);
    formData.append('categoryId', data.categoryId.toString());
    formData.append('conditionId', data.conditionId.toString());
    formData.append('description', data.description.toString());
    formData.append('expiry', data.expiry.toString());
    formData.append('location', JSON.stringify(data.location));

    data.images.forEach((img) => {
      formData.append('images', img as any);
    });

    item.mutate(formData, {
      onSuccess: () => {
        Alert.alert('Success', 'Item listed successfully!');
        clearImages();
        setCoords(null);
        reset();
        router.back();
      },
      onError: (error) => {
        if (isAxiosError(error)) {
          console.log('Axios error:', error.response?.data);
        }
        Alert.alert('Error', 'Failed to add item. Please try again.');
      },
    });
  };

  useEffect(() => {
    if (images.length) {
      setValue('images', images);
    }
  }, [images, setValue]);

  useEffect(() => {
    if (coords) {
      setValue('location', coords);
    }
  }, [coords, setValue]);

  const selectedLocation = watch('location');

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Images Section */}
        <View>
          <Card>
            <View>
              <View className="mb-3 flex-row items-center justify-between">
                <Text
                  className={`text-sm font-medium ${errors.images ? 'text-red-500' : 'text-gray-900'}`}>
                  Photos
                </Text>
                <Text className={`text-xs ${errors.images ? 'text-red-500' : 'text-gray-500'}`}>
                  {images.length}/5
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}>
                {images.length < 5 && (
                  <Pressable
                    onPress={pickImage}
                    className={`h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed ${
                      errors.images ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                    }`}>
                    <Camera size={20} color={errors.images ? '#EF4444' : '#9CA3AF'} />
                  </Pressable>
                )}

                {images.map((img, index) => (
                  <View key={img.uri} className="relative">
                    <Image source={{ uri: img.uri }} className="h-24 w-24 rounded-lg" />
                    <Pressable
                      onPress={() => {
                        removeImage(index);
                      }}
                      className="absolute right-1 top-1 h-5 w-5 items-center justify-center rounded-full bg-red-500">
                      <X size={12} color="white" />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>

              {errors.images && (
                <Text className="mt-2 text-xs font-medium text-red-500">
                  {errors.images.message}
                </Text>
              )}

              {!images.length && !errors.images && (
                <Text className="mt-2 text-center text-xs text-gray-400">
                  Add photos to help others see your item
                </Text>
              )}
            </View>
          </Card>
        </View>

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
                    Available For
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

        {/* Submit Button */}
        <View className="mt-6 px-4">
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={item.isPending}
            className={`items-center rounded-lg py-3 ${
              item.isPending ? 'bg-gray-400' : 'bg-yellow-500'
            }`}>
            <Text className="text-base font-medium text-white">
              {item.isPending ? 'Submiting Item...' : 'Add Item'}
            </Text>
          </Pressable>

          <Text className="mt-2 text-center text-xs text-gray-400">
            By listing, you agree to our community guidelines
          </Text>
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
