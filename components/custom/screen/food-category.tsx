import { Text } from '@/components/nativewindui/Text';
import { Image, View } from 'react-native';

export type Category = {
  id: string | number;
  name: string;
  image: string;
};

const category: Category[] = [
  {
    id: 1,
    name: 'Ready to eat',
    image:
      'https://images.pexels.com/photos/2725744/pexels-photo-2725744.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 2,
    name: 'Condiment',
    image:
      'https://images.unsplash.com/photo-1617908486074-2c4a15fa412e?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 3,
    name: 'Drinks',
    image:
      'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 4,
    name: 'Can food',
    image:
      'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 5,
    name: 'Raw item',
    image: 'https://images.pexels.com/photos/5971872/pexels-photo-5971872.jpeg',
  },
  {
    id: 6,
    name: 'Dry food',
    image:
      'https://images.pexels.com/photos/3905826/pexels-photo-3905826.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
];

export default function FoodCategory() {
  return (
    <View className="flex flex-row flex-wrap justify-between">
      {category.map((cat) => (
        <View key={cat.id} className="mb-4 w-1/2">
          <Image
            source={{ uri: cat.image }}
            resizeMode="cover"
            className="h-40 w-full rounded-md"
          />
          <Text className="mt-2">{cat.name}</Text>
        </View>
      ))}
    </View>
  );
}
