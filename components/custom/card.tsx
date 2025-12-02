import React, { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

export type CardProps = ViewProps & {
  children: ReactNode;
};

export default function Card({ children, className }: CardProps) {
  return <View className={`gap-4 bg-white px-6 py-8 ${className}`}>{children}</View>;
}
