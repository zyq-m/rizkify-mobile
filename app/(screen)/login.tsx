import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { ArrowRight, Eye, EyeOff, Mail, UserPlus } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useToast } from '@/providers/ToastProvider';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import InputForm from '@/components/custom/input-form';
import { useAuth } from '@/hooks/use-auth';
import { LoginFormT, loginSchema } from '@/utils/form/login';

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormT>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'test@gmail.com',
      password: 'Test123',
    },
  });

  const { login } = useAuth();

  const onSubmit = async (data: LoginFormT) => {
    login.mutate(data, {
      onSuccess: () => {
        // On successful login
        showToast('success', 'Success', 'Welcome back to Rizkify!');
        router.replace('/(screen)/(drawer)');
      },

      onError: (error) => {
        showToast('error', 'Error', error.message);
      },
    });
  };

  const handleForgotPassword = () => {
    showToast('info', 'Forgot Password', 'Password reset feature coming soon!');
  };

  const handleSignUp = () => {
    router.push('/(screen)/signup');
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
        <View className="px-6 pb-8 pt-20">
          <View className="mb-2 items-center">
            <Image
              source={require('assets/icon.png')}
              className="mb-6 h-20 w-20"
              style={{ height: 80, width: 80 }}
            />
            <Text className="text-center text-3xl font-bold text-gray-900">Welcome Back</Text>
            <Text className="mt-2 text-center text-gray-600">
              Sign in to continue reducing food waste
            </Text>
          </View>
        </View>

        {/* Login Form */}
        <View className="flex-1 px-6">
          <View className="gap-4">
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
                  editable={!login.isPending}
                  icon={<Mail size={20} color="#6B7280" />}>
                  Email Address
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
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!login.isPending}
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

            {/* Forgot Password */}
            <Pressable
              onPress={handleForgotPassword}
              disabled={login.isPending}
              className="self-end">
              <Text className="text-sm font-medium text-yellow-500">Forgot Password?</Text>
            </Pressable>

            <View>
              {/* Login Button */}
              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={login.isPending}
                className={`mt-6 items-center justify-center rounded-xl bg-yellow-500 py-4 ${
                  login.isPending ? 'opacity-70' : 'active:bg-yellow-600'
                }`}>
                <View className="flex-row items-center">
                  <Text className="mr-2 text-base font-semibold text-white">
                    {login.isPending ? 'Signing In...' : 'Sign In'}
                  </Text>
                  {!login.isPending && <ArrowRight size={20} color="white" />}
                </View>
              </Pressable>
              {/* Divider */}
              <View className="my-4 flex-row items-center">
                <View className="h-px flex-1 bg-gray-200" />
                <Text className="mx-4 text-sm text-gray-500">or</Text>
                <View className="h-px flex-1 bg-gray-200" />
              </View>
              {/* Sign Up Option */}
              <Pressable
                onPress={handleSignUp}
                disabled={login.isPending}
                className="items-center justify-center rounded-xl border-2 border-gray-200 py-4 active:bg-gray-50">
                <View className="flex-row items-center">
                  <UserPlus size={20} color="#374151" />
                  <Text className="ml-2 text-base font-semibold text-gray-900">
                    Create New Account
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View className="px-6 pb-8 pt-12">
          <Text className="text-center text-sm text-gray-500">
            By continuing, you agree to our{' '}
            <Text className="text-yellow-500">Terms of Service</Text> and{' '}
            <Text className="text-yellow-500">Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
