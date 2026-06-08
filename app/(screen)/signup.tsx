import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { ArrowRight, Eye, EyeOff, LogIn, Mail, Phone, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import InputForm from '@/components/custom/input-form';
import { useAuth } from '@/hooks/use-auth';
import { SignupFormT, signupSchema } from '@/utils/form/signup';

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormT>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupFormT) => {
    register.mutate(
      {
        email: data.email,
        name: data.name,
        phone: data.phone,
        password: data.password,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Welcome to Rizkify! Your account has been created.');
          router.replace('/(screen)/(drawer)');
        },
        onError: (error) => {
          Alert.alert('Error', error.message);
          console.log(error.message);
        },
      }
    );
  };

  const handleLogin = () => {
    router.push('/(screen)/login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Header Section */}
        <View className="px-6 pb-8 pt-16">
          <View className="mb-2 items-center">
            <View className="mb-6 h-20 w-20 items-center justify-center rounded-2xl bg-green-100">
              <Text className="text-2xl">🌱</Text>
            </View>
            <Text className="text-center text-3xl font-bold text-gray-900">Join Rizkify</Text>
            <Text className="mt-2 text-center text-gray-600">
              Create your account and start reducing food waste
            </Text>
          </View>
        </View>

        {/* Signup Form */}
        <View className="flex-1 px-6">
          <View className="gap-4">
            {/* Name Input */}
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
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                  autoComplete="name"
                  editable={!register.isPending}
                  icon={<User size={20} color="#6B7280" />}>
                  Full Name
                </InputForm>
              )}
            />

            {/* Email Input */}
            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur } }) => (
                <InputForm
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email}
                  errorMsg={errors.email?.message}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!register.isPending}
                  icon={<Mail size={20} color="#6B7280" />}>
                  Email Address
                </InputForm>
              )}
            />

            {/* Phone Input */}
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
                  placeholder="Enter your phone"
                  keyboardType="number-pad"
                  editable={!register.isPending}
                  icon={<Phone size={20} color="#6B7280" />}>
                  Phone No.
                </InputForm>
              )}
            />

            {/* Password Input */}
            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange, onBlur } }) => (
                <InputForm
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password}
                  errorMsg={errors.password?.message}
                  placeholder="Create a password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!register.isPending}
                  icon={
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <EyeOff size={20} color="#6B7280" />
                      ) : (
                        <Eye size={20} color="#6B7280" />
                      )}
                    </Pressable>
                  }>
                  Password
                </InputForm>
              )}
            />

            {/* Confirm Password Input */}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { value, onChange, onBlur } }) => (
                <InputForm
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword}
                  errorMsg={errors.confirmPassword?.message}
                  placeholder="Confirm your password"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!register.isPending}
                  icon={
                    <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? (
                        <EyeOff size={20} color="#6B7280" />
                      ) : (
                        <Eye size={20} color="#6B7280" />
                      )}
                    </Pressable>
                  }>
                  Confirm Password
                </InputForm>
              )}
            />

            {/* Password Requirements */}
            <View className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <Text className="mb-2 text-sm font-medium text-blue-900">Password Requirements:</Text>
              <Text className="text-xs text-blue-700">• At least 6 characters</Text>
              <Text className="text-xs text-blue-700">• One uppercase letter</Text>
              <Text className="text-xs text-blue-700">• One lowercase letter</Text>
              <Text className="text-xs text-blue-700">• One number</Text>
            </View>

            <View>
              {/* Sign Up Button */}
              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={register.isPending}
                className={`mt-4 items-center justify-center rounded-xl bg-emerald-500 py-4 ${
                  register.isPending ? 'opacity-70' : 'active:bg-emerald-600'
                }`}>
                <View className="flex-row items-center">
                  <Text className="mr-2 text-base font-semibold text-white">
                    {register.isPending ? 'Creating Account...' : 'Create Account'}
                  </Text>
                  {!register.isPending && <ArrowRight size={20} color="white" />}
                </View>
              </Pressable>
              {/* Divider */}
              <View className="my-4 flex-row items-center">
                <View className="h-px flex-1 bg-gray-200" />
                <Text className="mx-4 text-sm text-gray-500">Already have an account?</Text>
                <View className="h-px flex-1 bg-gray-200" />
              </View>
              {/* Login Option */}
              <Pressable
                onPress={handleLogin}
                disabled={register.isPending}
                className="items-center justify-center rounded-xl border-2 border-gray-200 py-4 active:bg-gray-50">
                <View className="flex-row items-center">
                  <LogIn size={20} color="#374151" />
                  <Text className="ml-2 text-base font-semibold text-gray-900">
                    Sign In Instead
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View className="px-6 pb-8 pt-12">
          <Text className="text-center text-sm text-gray-500">
            By creating an account, you agree to our{' '}
            <Text className="text-emerald-500">Terms of Service</Text> and{' '}
            <Text className="text-emerald-500">Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
