import React, { ReactNode } from 'react';
import { Text, TextInputProps, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

export type FormError = {
  error?: any;
  errorMsg?: string;
};

export type InputFormT = TextInputProps &
  FormError & {
    children: ReactNode;
    icon?: ReactNode;
  };

export default function InputForm({
  error = undefined,
  errorMsg,
  children,
  icon,
  ...props
}: InputFormT) {
  return (
    <View className="mb-1">
      <Text className={`mb-2 text-sm font-medium ${error ? 'text-red-500' : 'text-gray-900'}`}>
        {children}
      </Text>

      <View
        className={`flex-row items-center rounded-lg border px-4 ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
        }`}>
        <TextInput
          {...props}
          className="flex-1 py-4 text-base text-gray-900"
          placeholderTextColor="#9CA3AF"
          style={{ fontSize: 14 }}
        />
        {icon && <View className="ml-2">{icon}</View>}
      </View>

      {error && <Text className="mt-1 text-xs font-medium text-red-500">{errorMsg}</Text>}
    </View>
  );
}
