import { Item } from '@/api/service';
import CategoryModal from '@/components/custom/category-modal';
import ItemCard from '@/components/custom/item-card-v2';
import SetSearchLocationModal, { SearchLocation } from '@/components/custom/set-location-v2';
import { useDebounce } from '@/hooks/use-debounce';
import { SortItem, useItems } from '@/hooks/use-items';
import { useUser } from '@/hooks/use-user';
import {
  ChevronDown,
  Clock,
  ClockAlert,
  Filter,
  LucideIcon,
  MapPin,
  Search,
  Tag,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';

const sortOptions: { key: SortItem; label: string; icon: LucideIcon }[] = [
  { key: 'latest', label: 'Latest', icon: Clock },
  { key: 'nearest', label: 'Nearest', icon: MapPin },
  { key: 'expiring', label: 'Expiring soon', icon: ClockAlert },
];

export default function ItemsListScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<Partial<Item> | null>();
  const [selectedSort, setSelectedSort] = useState<SortItem | undefined>();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchLocation, setSearchLocation] = useState<SearchLocation | null>(null);

  const { useProfile } = useUser();
  const { data: profile } = useProfile();

  const debouncedSearch = useDebounce(searchQuery, 900);

  const { useItems: useSearchItems } = useItems();
  const {
    data: items,
    isRefetching,
    refetch,
  } = useSearchItems({
    categoryId: category?.id,
    name: debouncedSearch.toLowerCase().trim(),
    lat: profile?.location?.latitude.toString(),
    lng: profile?.location?.longitude.toString(),
    maxDistance: searchLocation?.range.toString(),
    sortBy: selectedSort,
  });

  const clearLocationFilter = () => {
    setSearchLocation(null);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Bar */}
      <View className="border-b border-gray-200 bg-white px-4 py-3">
        <View className="flex-row items-center rounded-lg bg-gray-100 px-3 py-2">
          <Search size={20} color="#6B7280" />
          <TextInput
            className="ml-2 flex-1 text-base"
            placeholder="Find fresh food near you"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Bar */}
      <View className="border-b border-gray-200 bg-white px-4 py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {/* Category Filter */}
            <Pressable
              onPress={() => setShowCategoryModal(true)}
              className="flex-row items-center rounded-full border border-gray-300 bg-white px-3 py-2">
              <Tag size={16} color="#6B7280" />
              <Text className="ml-2 text-sm text-gray-700">{category?.name ?? 'All'}</Text>
              <View className="ml-1">
                <ChevronDown size={14} color="#6B7280" />
              </View>
            </Pressable>

            {/* Sort Filter */}
            <Pressable
              onPress={() => setShowSortModal(true)}
              className="flex-row items-center rounded-full border border-gray-300 bg-white px-3 py-2">
              <Filter size={16} color="#6B7280" />
              <Text className="ml-2 text-sm text-gray-700">{selectedSort ?? 'Sort by'}</Text>
              <View className="ml-1">
                <ChevronDown size={14} color="#6B7280" />
              </View>
            </Pressable>

            {/* Location Filter */}
            <Pressable
              onPress={() => setShowLocationModal(true)}
              className="flex-row items-center rounded-full border border-green-200 bg-green-50 px-3 py-2">
              <MapPin size={16} color="#10B981" />
              <Text className="ml-2 text-sm text-green-700">
                {searchLocation ? `${searchLocation.range}km` : 'Location'}
              </Text>
              {searchLocation && (
                <Pressable onPress={clearLocationFilter} className="ml-1">
                  <Text className="text-sm text-green-500">✕</Text>
                </Pressable>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </View>

      {/* Results Count */}
      <View className="px-4 py-3">
        <Text className="text-sm text-gray-600">
          {items?.length} {items?.length === 1 ? 'item' : 'items'} found
          {searchLocation && ` within ${searchLocation.range}km`}
        </Text>
      </View>

      {/* Items List */}
      <FlatList
        data={items}
        renderItem={({ item }) => <ItemCard item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#000']}
            tintColor="#000"
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Search size={48} color="#9CA3AF" />
            <Text className="mt-4 text-lg font-medium text-gray-500">No items found</Text>
            <Text className="mt-2 text-center text-gray-400">
              {searchLocation
                ? `No items within ${searchLocation.range}km. Try expanding your search range.`
                : 'Try adjusting your search or filters'}
            </Text>
          </View>
        }
      />

      {/* Category Modal */}
      <CategoryModal
        showModal={showCategoryModal}
        closeModal={() => setShowCategoryModal(false)}
        category={(categoryId) => setCategory(categoryId)}
      />

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSortModal(false)}>
        <View className="flex-1 bg-white">
          <View className="border-b border-gray-200 px-6 py-4">
            <Text className="text-lg font-semibold">Sort By</Text>
          </View>
          <ScrollView className="flex-1 p-4">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => {
                    setSelectedSort(option.key);
                    setShowSortModal(false);
                  }}
                  className={`flex-row items-center rounded-lg border p-4 ${
                    selectedSort === option.key
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-gray-200 bg-white'
                  } mb-2`}>
                  <Icon size={20} color={selectedSort === option.key ? '#EAB308' : '#6B7280'} />
                  <Text
                    className={`ml-3 font-medium ${
                      selectedSort === option.key ? 'text-yellow-700' : 'text-gray-700'
                    }`}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View className="mt-3 gap-3 border-t border-gray-200 p-4">
            <Pressable
              onPress={() => setShowSortModal(false)}
              className="items-center rounded-lg bg-yellow-500 py-4">
              <Text className="text-base font-medium text-white">Apply Filter</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setShowSortModal(false);
                setSelectedSort(undefined);
              }}
              className="items-center rounded-lg border border-gray-300 py-4">
              <Text className="text-base font-medium text-gray-700">Clear</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Location Modal */}
      <SetSearchLocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSet={setSearchLocation}
        initialLocation={profile?.location}
        btnLabel="Apply Filter"
      />
    </View>
  );
}
