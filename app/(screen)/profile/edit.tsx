import Card from '@/components/custom/card';
import CustomHeader from '@/components/custom/custom-header';
import InputForm from '@/components/custom/input-form';
import usePickImage from '@/hooks/use-pick-image';
import { useUser } from '@/hooks/use-user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack } from 'expo-router';
import { Camera, User as UserIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useToast } from '@/providers/ToastProvider';
import { z } from 'zod';

// Validation schema
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Invalid phone number').max(12, 'Invalid phone number'),
});

type ProfileFormT = z.infer<typeof profileSchema>;

export default function UpdateProfileScreen() {
  const { pickImage, images, clear: clearImages } = usePickImage();
  const { showToast } = useToast();

  const { useProfile, useUpdateProfile } = useUser();
  const { data: profile } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormT>({
    resolver: zodResolver(profileSchema),
  });
  const onSubmit = async (data: ProfileFormT) => {
    updateProfile(
      { name: data.name, phone: data.phone },
      {
        onSuccess: (res) => {
          showToast('success', 'Success', res.message);
        },
      }
    );
  };

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        phone: profile.phone,
      });
    }
  }, [profile, reset]);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <CustomHeader navigation={navigation} title="Edit Profile" backBtn />
          ),
        }}
      />
      <View className="flex-1 gap-6 pt-6">
        {/* Profile Picture Section */}
        <View className="items-center">
          <View className="relative">
            <View className="h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-300">
              {images.length > 0 ? (
                <Image source={{ uri: images[0].uri }} className="h-full w-full" />
              ) : (
                <UserIcon size={48} color="#6B7280" />
              )}
            </View>

            {/* Camera Button */}
            <Pressable
              onPress={pickImage}
              className="absolute bottom-0 right-0 h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-yellow-500">
              <Camera size={20} color="white" />
            </Pressable>
          </View>

          <Pressable onPress={pickImage} className="mt-3">
            <Text className="font-medium text-yellow-500">Change Photo</Text>
          </Pressable>
        </View>

        {/* Form Section */}
        <Card>
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
                autoCapitalize="words">
                Name
              </InputForm>
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange, onBlur } }) => (
              <InputForm
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone}
                errorMsg={errors.phone?.message}
                keyboardType="decimal-pad"
                autoCapitalize="none"
                autoComplete="email">
                Phone No.
              </InputForm>
            )}
          />
        </Card>

        {/* Action Buttons */}
        <View className="gap-3 px-6">
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            className={`items-center rounded-lg py-3 ${
              isPending ? 'bg-gray-400' : 'bg-yellow-500'
            }`}>
            <Text className="text-base font-medium text-white">
              {isPending ? 'Saving...' : 'Save Changes'}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
