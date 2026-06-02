import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

export type ImageT = {
  name?: string | null;
  uri?: string;
  type?: string;
};

export default function usePickImage() {
  const [images, setImages] = useState<ImageT[]>([]);

  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 0.8,
      selectionLimit: 5 - images.length, // Dynamic limit based on current images
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((d) => ({
        name: d.fileName ?? d.uri.split('/').pop(),
        uri: d.uri,
        type: d.mimeType,
      }));

      setImages((prev) => [...prev, ...newImages].slice(0, 5)); // Ensure max 5 images
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const clear = () => {
    setImages([]);
  };

  return { images, pickImage, removeImage, clear };
}
