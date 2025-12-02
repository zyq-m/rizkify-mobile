import { Item } from '@/api/service';
import { useLookup } from '@/hooks/use-lookup';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

type CategoryModalProps = {
  showModal: boolean;
  closeModal: () => void;
  category: (categoryId: Partial<Item> | null) => void;
};

export default function CategoryModal({ showModal, closeModal, category }: CategoryModalProps) {
  const { useCategories } = useLookup();
  const { data: categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<Partial<Item> | null>(null);

  const resetFilter = () => {
    setSelectedCategory(null);
    closeModal();
  };

  useEffect(() => {
    // if (selectedCategory) {
    category(selectedCategory);
    // }
  }, [category, selectedCategory]);

  return (
    <Modal
      visible={showModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeModal}>
      <View className="flex-1 bg-white">
        <View className="border-b border-gray-200 px-6 py-4">
          <Text className="text-lg font-semibold">Select Category</Text>
        </View>
        <ScrollView className="flex-1 p-4">
          {categories?.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => {
                setSelectedCategory({ id: category.id, name: category.name });
                closeModal();
              }}
              className={`rounded-lg border p-4 ${
                selectedCategory?.id === category.id
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-gray-200 bg-white'
              } mb-2`}>
              <Text
                className={`font-medium ${
                  selectedCategory?.id === category.id ? 'text-yellow-700' : 'text-gray-700'
                }`}>
                {category.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <View className="mt-3 gap-3 border-t border-gray-200 p-4">
          <Pressable onPress={closeModal} className="items-center rounded-lg bg-yellow-500 py-4">
            <Text className="text-base font-medium text-white">Apply</Text>
          </Pressable>

          <Pressable
            onPress={resetFilter}
            className="items-center rounded-lg border border-gray-300 py-4">
            <Text className="text-base font-medium text-gray-700">Clear</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
