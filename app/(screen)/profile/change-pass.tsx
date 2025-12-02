import Card from '@/components/custom/card';
import CustomHeader from '@/components/custom/custom-header';
import InputForm from '@/components/custom/input-form';
import { Text } from '@/components/nativewindui/Text';
import { useUser } from '@/hooks/use-user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack } from 'expo-router';
import { Eye, EyeOff, Lock } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { z } from 'zod';

// Password validation schema
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ChangePasswordFormT = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordScreen() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: changePassword, isPending } = useUser().useChangePassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormT>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit: SubmitHandler<ChangePasswordFormT> = async (data) => {
    changePassword(
      {
        newPassword: data.newPassword,
        currentPassword: data.currentPassword,
      },
      {
        onSuccess: (res) => {
          reset();
          Alert.alert('Success', res.data.message);
        },
        onError: (error) => {
          Alert.alert('Error', error.message);
        },
      }
    );
  };

  const toggleShowCurrentPassword = () => setShowCurrentPassword(!showCurrentPassword);
  const toggleShowNewPassword = () => setShowNewPassword(!showNewPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <CustomHeader navigation={navigation} title="Change password" backBtn />
          ),
        }}
      />
      <View className="flex-1 gap-4">
        {/* Header */}
        <View className="items-center py-4">
          <View className="rounded-full bg-yellow-100 p-4">
            <Lock size={32} color="#EFB255" />
          </View>
          <Text className="mt-3 text-xl font-semibold">Change Password</Text>
          <Text className="mt-2 text-center text-gray-500">
            Enter your current password and set a new one
          </Text>
        </View>

        <Card>
          <Controller
            control={control}
            name="currentPassword"
            render={({ field: { value, onChange, onBlur } }) => (
              <InputForm
                secureTextEntry={!showCurrentPassword}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.currentPassword}
                errorMsg={errors.currentPassword?.message}
                icon={
                  <Pressable onPress={toggleShowCurrentPassword} className="pr-3">
                    {showCurrentPassword ? (
                      <EyeOff size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </Pressable>
                }>
                Current Password
              </InputForm>
            )}
          />

          <Controller
            control={control}
            name="newPassword"
            render={({ field: { value, onChange, onBlur } }) => (
              <InputForm
                secureTextEntry={!showNewPassword}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.newPassword}
                errorMsg={errors.newPassword?.message}
                icon={
                  <Pressable onPress={toggleShowNewPassword} className="pr-3">
                    {showNewPassword ? (
                      <EyeOff size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </Pressable>
                }>
                New Password
              </InputForm>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { value, onChange, onBlur } }) => (
              <InputForm
                secureTextEntry={!showConfirmPassword}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword}
                errorMsg={errors.confirmPassword?.message}
                icon={
                  <Pressable onPress={toggleShowConfirmPassword} className="pr-3">
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </Pressable>
                }>
                Confirm New Password
              </InputForm>
            )}
          />
        </Card>

        {/* Password Requirements */}
        <Card>
          <Text className="mb-2 font-medium text-gray-900">Password Requirements</Text>
          <View className="gap-1">
            <Text className="text-sm text-gray-600">• At least 8 characters long</Text>
            <Text className="text-sm text-gray-600">• One uppercase letter (A-Z)</Text>
            <Text className="text-sm text-gray-600">• One lowercase letter (a-z)</Text>
            <Text className="text-sm text-gray-600">• One number (0-9)</Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View className="mb-6 mt-4 gap-3 px-6">
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            className={`items-center rounded-lg py-3 ${
              isPending ? 'bg-gray-400' : 'bg-yellow-500'
            }`}>
            <Text className="text-base font-medium text-white">
              {isPending ? 'Changing Password...' : 'Change Password'}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
