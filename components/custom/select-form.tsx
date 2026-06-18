import { Picker, PickerItemProps, PickerProps } from '@react-native-picker/picker';

import { ReactNode } from 'react';
import { Platform, Text, View } from 'react-native';
import { FormError } from './input-form';

export type SelectFormProps = PickerProps &
  FormError & {
    children: ReactNode;
    selectItems?: PickerItemProps[];
    placeholder?: string;
  };

export default function SelectFrom({
  children,
  selectItems = [],
  error = undefined,
  errorMsg,
  placeholder = 'Select...',
  ...props
}: SelectFormProps) {
  return (
    <View className="mb-1">
      <Text className={`mb-2 text-sm font-medium ${error ? 'text-red-500' : 'text-gray-900'}`}>
        {children}
      </Text>

      <View
        className={`rounded-lg border ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
        }`}>
        <Picker
          {...props}
          style={{
            fontSize: 14,
            color: props.selectedValue ? '#1F2937' : '#6B7280',
            ...(Platform.OS === 'web' ? { padding: 16 } : {}),
          }}
          mode="dropdown" // This makes it look much cleaner on Android
        >
          <Picker.Item label={placeholder} value={null} color="#6B7280" style={{ fontSize: 14 }} />
          {selectItems.map((item, index) => (
            <Picker.Item
              key={index}
              label={item.label}
              value={item.value}
              color="#1F2937"
              style={{ fontSize: 14 }}
            />
          ))}
        </Picker>
      </View>

      {error && <Text className="mt-1 text-xs font-medium text-red-500">{errorMsg}</Text>}
    </View>
  );
}
