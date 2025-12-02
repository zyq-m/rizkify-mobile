import CustomHeader from '@/components/custom/custom-header';
import { Stack } from 'expo-router';
import {
  ChevronRight,
  Clock,
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
  Search,
  Shield,
  Users,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

const faqCategories = [
  {
    id: '1',
    title: 'Getting Started',
    icon: HelpCircle,
    questions: [
      {
        question: 'How do I list an item?',
        answer:
          'Tap the + button on the home screen, add photos, fill in details, and set your location.',
      },
      {
        question: 'How do I request an item?',
        answer:
          'Browse available items, tap on one you like, and send a pickup request to the owner.',
      },
      {
        question: 'Is there a limit to how many items I can list?',
        answer: 'You can list up to 10 active items at a time.',
      },
    ],
  },
  {
    id: '2',
    title: 'Safety & Guidelines',
    icon: Shield,
    questions: [
      {
        question: 'What safety measures should I take?',
        answer:
          'Always meet in public places, verify items before accepting, and follow community guidelines.',
      },
      {
        question: 'What items are not allowed?',
        answer:
          'Perishable items past expiry, opened containers, and non-food items are not permitted.',
      },
    ],
  },
  {
    id: '3',
    title: 'Account & Settings',
    icon: Users,
    questions: [
      {
        question: 'How do I change my location?',
        answer: 'Go to Profile → Settings → Location to update your pickup location.',
      },
      {
        question: 'Can I delete my account?',
        answer: 'Yes, contact support from this screen to request account deletion.',
      },
    ],
  },
];

const contactMethods = [
  {
    id: '1',
    title: 'Chat Support',
    subtitle: 'Get instant help',
    icon: MessageCircle,
    color: '#10B981',
    onPress: () => console.log('Open chat'),
    available: true,
  },
  {
    id: '2',
    title: 'Email Support',
    subtitle: 'support@rizkify.com',
    icon: Mail,
    color: '#3B82F6',
    onPress: () => Linking.openURL('mailto:support@rizkify.com'),
    available: true,
  },
  {
    id: '3',
    title: 'Community Guidelines',
    subtitle: 'Read our guidelines',
    icon: FileText,
    color: '#F59E0B',
    onPress: () => console.log('Open guidelines'),
    available: true,
  },
];

const supportHours = [
  { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
  { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
  { day: 'Sunday', hours: 'Closed' },
];

export default function HelpSupportScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const toggleQuestion = (question: string) => {
    setExpandedQuestion(expandedQuestion === question ? null : question);
  };

  const filteredFAQs = faqCategories
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <CustomHeader navigation={navigation} backBtn title="Help & Support" />
          ),
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white px-6 py-8">
          <View className="items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-yellow-100">
              <HelpCircle size={32} color="#EAB308" />
            </View>
            <Text className="text-center text-2xl font-bold text-gray-900">Help & Support</Text>
            <Text className="mt-2 text-center text-gray-600">
              We&apos;re here to help you with any questions
            </Text>
          </View>
        </View>

        {/* Search */}
        <View className="mt-4 px-6">
          <View className="flex-row items-center rounded-xl bg-white px-4 py-3 shadow-sm">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              className="ml-3 flex-1 text-gray-900"
              placeholder="Search for help..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Quick Contact */}
        <View className="mt-6 px-6">
          <Text className="mb-4 text-lg font-semibold text-gray-900">Get Help Quickly</Text>
          <View className="space-y-3">
            {contactMethods.map((method) => (
              <Pressable
                key={method.id}
                onPress={method.onPress}
                className="flex-row items-center rounded-xl bg-white p-4 shadow-sm active:bg-gray-50">
                <View
                  className="h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${method.color}15` }}>
                  <method.icon size={24} color={method.color} />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="font-semibold text-gray-900">{method.title}</Text>
                  <Text className="mt-1 text-sm text-gray-600">{method.subtitle}</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </Pressable>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View className="mt-8 px-6">
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            {searchQuery ? 'Search Results' : 'Frequently Asked Questions'}
          </Text>

          {filteredFAQs.length === 0 ? (
            <View className="items-center rounded-xl bg-white p-8">
              <HelpCircle size={48} color="#9CA3AF" />
              <Text className="mt-4 text-center text-gray-500">
                No results found for &quot;{searchQuery}&quot;
              </Text>
              <Text className="mt-2 text-center text-sm text-gray-400">
                Try different keywords or contact our support team
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {filteredFAQs.map((category) => {
                const Icon = category.icon;
                return (
                  <View key={category.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
                    <Pressable
                      onPress={() => toggleCategory(category.id)}
                      className="flex-row items-center p-4 active:bg-gray-50">
                      <Icon size={20} color="#6B7280" />
                      <Text className="ml-3 flex-1 font-semibold text-gray-900">
                        {category.title}
                      </Text>
                      <ChevronRight
                        size={20}
                        color="#6B7280"
                        style={{
                          transform: [
                            { rotate: expandedCategory === category.id ? '90deg' : '0deg' },
                          ],
                        }}
                      />
                    </Pressable>

                    {expandedCategory === category.id && (
                      <View className="border-t border-gray-100">
                        {category.questions.map((faq, index) => (
                          <View
                            key={faq.question}
                            className={`${index > 0 ? 'border-t border-gray-100' : ''}`}>
                            <Pressable
                              onPress={() => toggleQuestion(faq.question)}
                              className="p-4 active:bg-gray-50">
                              <Text className="font-medium text-gray-900">{faq.question}</Text>
                              {expandedQuestion === faq.question && (
                                <Text className="mt-2 leading-5 text-gray-600">{faq.answer}</Text>
                              )}
                            </Pressable>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Support Hours */}
        <View className="mb-8 mt-8 px-6">
          <View className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
            <View className="mb-4 flex-row items-center">
              <Clock size={20} color="#D97706" />
              <Text className="ml-2 font-semibold text-yellow-800">Support Hours</Text>
            </View>
            <View className="space-y-2">
              {supportHours.map((schedule) => (
                <View key={schedule.day} className="flex-row justify-between">
                  <Text className="text-sm text-yellow-700">{schedule.day}</Text>
                  <Text className="text-sm font-medium text-yellow-700">{schedule.hours}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Emergency Contact */}
        <View className="mb-8 px-6">
          <View className="rounded-xl border border-red-200 bg-red-50 p-6">
            <Text className="mb-2 text-center font-semibold text-red-800">
              Need Immediate Assistance?
            </Text>
            <Text className="text-center text-sm text-red-700">
              For urgent safety concerns, please contact local authorities immediately
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
