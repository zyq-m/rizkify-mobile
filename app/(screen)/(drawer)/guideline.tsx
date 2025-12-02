import { AlertCircle, CheckCircle, XCircle } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function GuidelinesScreen() {
  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <Text className="mb-8 text-center text-2xl font-bold text-gray-900">
          Community Guidelines
        </Text>

        {/* Do Section */}
        <View className="mb-8">
          <View className="mb-4 flex-row items-center">
            <CheckCircle size={20} color="#10B981" />
            <Text className="ml-2 text-lg font-bold text-gray-900">Do</Text>
          </View>
          <View className="rounded-xl bg-green-50 p-4">
            <Text className="mb-2 font-medium text-green-800">
              • Indicate what time you can collect
            </Text>
            <Text className="font-medium text-green-800">• Inform if you&apos;re running late</Text>
          </View>
        </View>

        {/* Don't Section */}
        <View className="mb-8">
          <View className="mb-4 flex-row items-center">
            <XCircle size={20} color="#EF4444" />
            <Text className="ml-2 text-lg font-bold text-gray-900">Don&apos;t</Text>
          </View>
          <View className="rounded-xl bg-red-50 p-4">
            <Text className="mb-2 font-medium text-red-800">• Ask for delivery or posting</Text>
            <Text className="font-medium text-red-800">
              • Get upset if you don&apos;t get something
            </Text>
          </View>
        </View>

        {/* Checklist */}
        <View className="mb-8">
          <View className="mb-4 flex-row items-center">
            <AlertCircle size={20} color="#3B82F6" />
            <Text className="ml-2 text-lg font-bold text-gray-900">Only set off when:</Text>
          </View>
          <View className="rounded-xl bg-blue-50 p-4">
            <Text className="mb-2 font-medium text-blue-800">1. It&apos;s been confirmed</Text>
            <Text className="mb-2 font-medium text-blue-800">2. You have the address</Text>
            <Text className="font-medium text-blue-800">3. There&apos;s an agreed time</Text>
          </View>
        </View>

        <View className="mt-4 rounded-xl bg-gray-100 p-4">
          <Text className="text-center text-sm text-gray-700">
            Thank you for helping reduce food waste responsibly! ♻️
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
