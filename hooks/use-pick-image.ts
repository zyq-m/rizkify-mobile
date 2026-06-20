import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

export type ImageT = {
  name?: string | null;
  uri?: string;
  type?: string;
};

export async function toBlob(image: ImageT): Promise<Blob> {
  if (!image.uri) throw new Error('Image URI is required');

  const base64 = await FileSystem.readAsStringAsync(image.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: image.type || 'image/jpeg' });
}

export default function usePickImage() {
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
      selectionLimit: 5 - images.length,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets].slice(0, 5));
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
