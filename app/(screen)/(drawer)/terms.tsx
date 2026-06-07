import { useRouter } from 'expo-router';
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  FileText,
  Globe,
  Mail,
  Shield,
} from 'lucide-react-native';
import React, { useRef } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';

export default function TermsScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const handleBack = () => {
    router.back();
  };

  const handleContact = () => {
    Linking.openURL('mailto:support@example.com');
  };

  const scrollToSection = (index: number) => {
    // You can implement section scrolling if needed
    console.log('Scroll to section', index);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Introduction */}
        <View className="p-6">
          <View className="mb-8">
            <View className="mb-4 flex-row items-center">
              <FileText size={28} color="#000" />
              <Text className="ml-3 text-3xl font-bold text-gray-900">Welcome to our app!</Text>
            </View>
            <Text className="text-base leading-relaxed text-gray-600">
              Please read these Terms & Conditions carefully before using our services.
            </Text>
          </View>

          {/* Quick Links */}
          <View className="mb-8 rounded-2xl bg-gray-50 p-5">
            <Text className="mb-4 text-lg font-semibold text-gray-900">Table of Contents</Text>
            <View className="gap-3">
              {[
                { id: 1, label: '1. Acceptance of Terms' },
                { id: 2, label: '2. Use License' },
                { id: 3, label: '3. User Responsibilities' },
                { id: 4, label: '4. Limitation of Liability' },
                { id: 5, label: '5. Changes to Terms' },
              ].map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => scrollToSection(item.id)}
                  className="flex-row items-center rounded-xl border border-gray-200 bg-white p-3">
                  <Text className="flex-1 font-medium text-gray-700">{item.label}</Text>
                  <ChevronRight size={16} color="#6B7280" />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Terms Sections */}
          <View className="gap-10">
            {/* Section 1 */}
            <View className="border-l-4 border-blue-500 pl-4">
              <Text className="mb-3 text-xl font-bold text-gray-900">1. Acceptance of Terms</Text>
              <Text className="leading-relaxed text-gray-600">
                By accessing and using this app, you agree to be bound by these Terms & Conditions
                and all applicable laws and regulations.
              </Text>
              <View className="mt-4 flex-row items-start">
                <View className="mr-3 mt-1 flex-shrink-0">
                  <CheckCircle size={18} color="#3B82F6" />
                </View>
                <Text className="flex-1 text-gray-600">
                  Your use of the app constitutes acceptance of these terms
                </Text>
              </View>
              <View className="mt-2 flex-row items-start">
                <View className="mr-3 mt-1 flex-shrink-0">
                  <CheckCircle size={18} color="#3B82F6" />
                </View>
                <Text className="flex-1 text-gray-600">
                  You acknowledge reading and understanding these terms
                </Text>
              </View>
            </View>

            {/* Section 2 */}
            <View className="border-l-4 border-green-500 pl-4">
              <Text className="mb-3 text-xl font-bold text-gray-900">2. Use License</Text>
              <Text className="mb-4 leading-relaxed text-gray-600">
                Permission is granted to temporarily download one copy of the materials for
                personal, non-commercial transitory viewing only.
              </Text>
              <View className="gap-3">
                <View className="rounded-lg bg-green-50 p-4">
                  <Text className="mb-1 font-semibold text-green-800">You may:</Text>
                  <Text className="text-sm text-green-700">
                    • Use the app for personal purposes{'\n'}• Temporarily download content for
                    viewing{'\n'}• Share items within the community
                  </Text>
                </View>
                <View className="rounded-lg bg-red-50 p-4">
                  <Text className="mb-1 font-semibold text-red-800">You may not:</Text>
                  <Text className="text-sm text-red-700">
                    • Modify or copy the materials{'\n'}• Use the materials for commercial purposes
                    {'\n'}• Transfer the materials to another person
                  </Text>
                </View>
              </View>
            </View>

            {/* Section 3 */}
            <View className="border-l-4 border-yellow-500 pl-4">
              <Text className="mb-3 text-xl font-bold text-gray-900">3. User Responsibilities</Text>
              <Text className="mb-4 leading-relaxed text-gray-600">
                You agree not to misuse the app or help anyone else do so. This includes but is not
                limited to hacking, transmitting viruses, or infringing on others&apos; rights.
              </Text>
              <View className="gap-3">
                {[
                  'Do not attempt to hack or compromise the app',
                  'Do not transmit viruses or malicious code',
                  'Do not infringe on intellectual property rights',
                  'Do not harass or threaten other users',
                  'Do not post false or misleading information',
                ].map((item, index) => (
                  <View key={index} className="flex-row items-start">
                    <View className="mr-3 mt-1 flex-shrink-0">
                      <AlertCircle size={18} color="#D97706" />
                    </View>
                    <Text className="flex-1 text-gray-600">{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Section 4 */}
            <View className="border-l-4 border-red-500 pl-4">
              <Text className="mb-3 text-xl font-bold text-gray-900">
                4. Limitation of Liability
              </Text>
              <Text className="mb-4 leading-relaxed text-gray-600">
                In no event shall we be liable for any damages arising out of the use or inability
                to use the app.
              </Text>
              <View className="rounded-lg bg-red-50 p-5">
                <View className="flex-row items-start">
                    <View className="mr-3 mt-1">
                      <Shield size={20} color="#DC2626" />
                    </View>
                  <View className="flex-1">
                    <Text className="mb-2 font-semibold text-red-800">Important Disclaimer</Text>
                    <Text className="text-sm text-red-700">
                      We are not responsible for any direct, indirect, incidental, or consequential
                      damages resulting from your use of the app. This includes but is not limited
                      to data loss, financial loss, or personal injury.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Section 5 */}
            <View className="border-l-4 border-purple-500 pl-4">
              <Text className="mb-3 text-xl font-bold text-gray-900">5. Changes to Terms</Text>
              <Text className="mb-4 leading-relaxed text-gray-600">
                We reserve the right to modify these terms at any time. Your continued use of the
                app constitutes acceptance of those changes.
              </Text>
              <View className="gap-3">
                <View className="flex-row items-start">
                  <View className="mr-3 mt-1 flex-shrink-0">
                    <CheckCircle size={18} color="#8B5CF6" />
                  </View>
                  <Text className="flex-1 text-gray-600">
                    We may update these terms periodically
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <View className="mr-3 mt-1 flex-shrink-0">
                    <CheckCircle size={18} color="#8B5CF6" />
                  </View>
                  <Text className="flex-1 text-gray-600">
                    Continued use after changes means you accept them
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <View className="mr-3 mt-1 flex-shrink-0">
                    <CheckCircle size={18} color="#8B5CF6" />
                  </View>
                  <Text className="flex-1 text-gray-600">
                    We recommend reviewing terms regularly
                  </Text>
                </View>
              </View>
              <View className="mt-4 rounded-lg bg-purple-50 p-4">
                <Text className="text-sm italic text-purple-800">
                  Last updated date will always be displayed at the top of this page.
                </Text>
              </View>
            </View>

            {/* Contact Information */}
            <View className="mt-8 rounded-2xl bg-gray-50 p-6">
              <Text className="mb-4 text-xl font-bold text-gray-900">Questions?</Text>
              <Text className="mb-4 text-gray-600">
                If you have any questions about these Terms & Conditions, please contact us.
              </Text>
              <Pressable
                onPress={handleContact}
                className="mb-3 flex-row items-center rounded-xl border border-gray-200 bg-white p-4">
                <Mail size={20} color="#6B7280" />
                <Text className="ml-3 flex-1 font-medium text-gray-700">support@example.com</Text>
              </Pressable>
              <View className="flex-row items-center rounded-xl border border-gray-200 bg-white p-4">
                <Globe size={20} color="#6B7280" />
                <Text className="ml-3 flex-1 font-medium text-gray-700">
                  www.example.com/support
                </Text>
              </View>
            </View>

            {/* Acceptance Notice */}
            <View className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
              <Text className="mb-3 text-center text-lg font-bold text-blue-900">
                ✅ Your Agreement
              </Text>
              <Text className="text-center leading-relaxed text-blue-800">
                By using this app, you acknowledge that you have read, understood, and agree to be
                bound by these Terms & Conditions.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View className="border-t border-gray-200 bg-white p-6">
        <Pressable onPress={handleBack} className="rounded-xl bg-yellow-500 py-4 active:opacity-80">
          <Text className="text-center text-base font-semibold text-white">
            I Understand & Accept
          </Text>
        </Pressable>
        <Text className="mt-3 text-center text-xs text-gray-500">
          By continuing, you agree to our Terms & Conditions
        </Text>
      </View>
    </View>
  );
}
