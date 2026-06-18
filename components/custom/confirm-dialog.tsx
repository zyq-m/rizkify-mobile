import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmDestructive?: boolean;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmDestructive = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="mx-4 w-11/12 max-w-sm rounded-3xl bg-white p-6">
          <Text className="mb-2 text-center text-xl font-bold text-gray-900">
            {title}
          </Text>
          <Text className="mb-6 text-center text-gray-600">
            {message}
          </Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={onCancel}
              className="flex-1 rounded-2xl bg-gray-200 py-4"
            >
              <Text className="text-center font-semibold text-gray-700">{cancelText}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className={`flex-1 rounded-2xl py-4 ${confirmDestructive ? 'bg-red-500' : 'bg-yellow-500'}`}
            >
              <Text className="text-center font-semibold text-white">{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
