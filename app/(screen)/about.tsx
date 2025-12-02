import CustomHeader from '@/components/custom/custom-header';
import { Stack } from 'expo-router';
import { ExternalLink, Globe, Heart, Leaf, Mail, Users, Zap } from 'lucide-react-native';
import React from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';

export default function AboutUsScreen() {
  const openUniSZAWebsite = () => {
    Linking.openURL('https://www.unisza.edu.my');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <CustomHeader navigation={navigation} backBtn title="About Rizkify" />
          ),
        }}
      />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="bg-white px-6 py-8">
          <View className="mb-6 items-center">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-2xl bg-green-100">
              <Leaf size={32} color="#10B981" />
            </View>
            <Text className="mb-2 text-center text-3xl font-bold text-gray-900">About Rizkify</Text>
            <Text className="text-center text-lg text-gray-600">
              Turning surplus into sustenance
            </Text>
          </View>
        </View>

        {/* Introduction */}
        <View className="mx-4 mt-4 rounded-2xl bg-white p-6 shadow-sm">
          <Text className="text-center text-lg leading-7 text-gray-700">
            Rizkify is a digital platform designed to{' '}
            <Text className="font-semibold text-green-600">reduce food waste</Text> by connecting
            individuals and organisations with surplus food to those who need it —{' '}
            <Text className="font-semibold">safely, quickly, and responsibly</Text>.
          </Text>
        </View>

        {/* Origin Story */}
        <View className="mx-4 mt-4 rounded-2xl bg-white p-6 shadow-sm">
          <Text className="text-base leading-6 text-gray-700">
            Originally developed at{' '}
            <Pressable onPress={openUniSZAWebsite}>
              <Text className="font-semibold text-blue-500">
                Universiti Sultan Zainal Abidin (UniSZA)
              </Text>
            </Pressable>
            , this app aims to create a sustainable food-sharing ecosystem that empowers
            communities, promotes responsible consumption, and supports those facing food
            insecurity.
          </Text>
        </View>

        {/* Belief Statement */}
        <View className="mx-4 mt-4 rounded-2xl border border-green-200 bg-green-50 p-6">
          <Text className="text-center text-lg font-semibold italic text-green-800">
            &quot;We believe that even small acts — like sharing extra food — can create lasting
            impact.&quot;
          </Text>
        </View>

        {/* Audience */}
        <View className="mx-4 mt-4 rounded-2xl bg-white p-6 shadow-sm">
          <View className="mb-3 flex-row items-center">
            <Users size={20} color="#6B7280" />
            <Text className="ml-2 text-lg font-semibold text-gray-900">For Everyone</Text>
          </View>
          <Text className="text-base text-gray-700">
            Whether you&apos;re a student, a staff member, a vendor, or a community volunteer,
            Rizkify gives you the tools to donate, receive, and make a difference.
          </Text>
        </View>

        {/* Mission Section */}
        <View className="mx-4 mt-4 rounded-2xl bg-white p-6 shadow-sm">
          <View className="mb-4 flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Zap size={20} color="#3B82F6" />
            </View>
            <Text className="ml-3 text-xl font-bold text-gray-900">Our Mission</Text>
          </View>
          <Text className="text-lg font-semibold leading-7 text-blue-700">
            To reduce avoidable food waste through technology, community collaboration, and the
            power of sharing.
          </Text>
        </View>

        {/* Values Section */}
        <View className="mx-4 mt-4 rounded-2xl bg-white p-6 shadow-sm">
          <View className="mb-4 flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <Heart size={20} color="#8B5CF6" />
            </View>
            <Text className="ml-3 text-xl font-bold text-gray-900">Our Values</Text>
          </View>

          <View className="space-y-4">
            <View className="flex-row items-start">
              <View className="mr-3 mt-1 h-6 w-6 items-center justify-center rounded-full bg-green-100">
                <Leaf size={14} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">Sustainability</Text>
                <Text className="mt-1 text-gray-600">
                  Committed to environmental protection and reducing our ecological footprint
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="mr-3 mt-1 h-6 w-6 items-center justify-center rounded-full bg-pink-100">
                <Heart size={14} color="#EC4899" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">Empathy</Text>
                <Text className="mt-1 text-gray-600">
                  Understanding and addressing the needs of our community with compassion
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="mr-3 mt-1 h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                <Users size={14} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">Inclusivity</Text>
                <Text className="mt-1 text-gray-600">
                  Creating a platform that welcomes everyone, regardless of background or
                  circumstance
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="mr-3 mt-1 h-6 w-6 items-center justify-center rounded-full bg-orange-100">
                <Zap size={14} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">Action over waste</Text>
                <Text className="mt-1 text-gray-600">
                  Prioritizing practical solutions and immediate impact over passive observation
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Call to Action */}
        <View className="mx-4 mb-8 mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <View className="mb-4 flex-row items-center">
            <Globe size={24} color="#D97706" />
            <Text className="ml-3 text-xl font-bold text-gray-900">Get Involved</Text>
          </View>

          <Text className="mb-4 text-lg leading-7 text-gray-700">
            Use Rizkify to list or request surplus food. Every meal shared is a step toward a more
            caring, sustainable world.
          </Text>

          <View className="rounded-xl border border-yellow-200 bg-white p-4">
            <Text className="text-center font-semibold text-yellow-700">
              Join our movement today and be part of the solution! 🌍
            </Text>
          </View>
        </View>

        {/* Contact/Footer */}
        <View className="mx-4 mb-8 rounded-2xl bg-gray-100 p-6">
          <View className="mb-2 flex-row items-center justify-center">
            <Mail size={16} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-600">From UniSZA with ❤️</Text>
          </View>
          <Pressable onPress={openUniSZAWebsite} className="flex-row items-center justify-center">
            <Text className="mr-1 font-medium text-blue-500">Visit UniSZA</Text>
            <ExternalLink size={14} color="#3B82F6" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
