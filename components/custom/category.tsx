import { useLookup } from '@/hooks/use-lookup';
import { Beef, ChefHat, Coffee, Package, Soup, Utensils, Wheat } from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

// Icon mapping for each category
const getCategoryIcon = (categoryName: string) => {
  switch (categoryName.toLowerCase()) {
    case 'can food':
      return <Soup size={24} color="#6B7280" />;
    case 'condiment':
      return <Utensils size={24} color="#6B7280" />;
    case 'drinks':
      return <Coffee size={24} color="#6B7280" />;
    case 'dry food':
      return <Wheat size={24} color="#6B7280" />;
    case 'raw item':
      return <Beef size={24} color="#6B7280" />;
    case 'ready to eat':
      return <ChefHat size={24} color="#6B7280" />;
    default:
      return <Package size={24} color="#6B7280" />;
  }
};

// Color mapping for each category
const getCategoryColor = (categoryName: string) => {
  switch (categoryName.toLowerCase()) {
    case 'can food':
      return 'bg-red-50 border-red-100';
    case 'condiment':
      return 'bg-yellow-50 border-yellow-100';
    case 'drinks':
      return 'bg-blue-50 border-blue-100';
    case 'dry food':
      return 'bg-amber-50 border-amber-100';
    case 'raw item':
      return 'bg-green-50 border-green-100';
    case 'ready to eat':
      return 'bg-purple-50 border-purple-100';
    default:
      return 'bg-gray-50 border-gray-100';
  }
};

// Text color mapping
const getCategoryTextColor = (categoryName: string) => {
  switch (categoryName.toLowerCase()) {
    case 'can food':
      return 'text-red-800';
    case 'condiment':
      return 'text-yellow-800';
    case 'drinks':
      return 'text-blue-800';
    case 'dry food':
      return 'text-amber-800';
    case 'raw item':
      return 'text-green-800';
    case 'ready to eat':
      return 'text-purple-800';
    default:
      return 'text-gray-800';
  }
};

export default function Category() {
  const { useCategories } = useLookup();
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <View className="bg-white px-4 py-6">
        <Text className="mb-4 text-lg font-semibold text-gray-900">Categories</Text>
        <View className="flex-row justify-center py-8">
          <ActivityIndicator size="small" color="#000" />
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white px-4 py-6">
      {/* Header */}
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-gray-900">Browse By Category</Text>
      </View>

      {/* Categories Grid */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
        className="-mx-4 px-4">
        {categories?.map((category) => (
          <Pressable key={category.id} className="mr-4 w-40">
            <View className={`rounded-2xl border p-5 ${getCategoryColor(category.name)}`}>
              {/* Icon */}
              <View className="mb-4">
                <View
                  className={`h-12 w-12 items-center justify-center rounded-xl ${
                    getCategoryColor(category.name)
                      .replace('50', '100')
                      .replace('border-', 'bg-')
                      .split(' ')[0]
                  }`}>
                  {getCategoryIcon(category.name)}
                </View>
              </View>

              {/* Category Name */}
              <Text
                className={`mb-1 text-base font-semibold ${getCategoryTextColor(category.name)}`}
                numberOfLines={1}>
                {category.name}
              </Text>

              {/* Item Count */}
              <View className="flex-row items-center">
                <Text className="text-xs text-gray-500">
                  {category._count.items} item{category._count.items !== 1 ? 's' : ''}
                </Text>
              </View>

              {/* Short Description */}
              <Text className="mt-2 text-xs text-gray-600" numberOfLines={2}>
                {category.description.length > 60
                  ? `${category.description.substring(0, 60)}...`
                  : category.description}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
