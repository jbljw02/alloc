import React from 'react';
import { Text, View, TextInput } from 'react-native';

interface IncomeInputProps {
  value: string;
  onValueChange: (value: string) => void;
};

export const IncomeInput = ({ value, onValueChange }: IncomeInputProps) => {
  return (
    <View className="p-6 pb-2.5">
      <Text className="text-sm text-gray-500 mb-2 font-semibold">이번 달 수입</Text>
      <View className="flex-row items-center">
        <Text className="text-[28px] font-bold text-gray-900 mr-2">₩</Text>
        <TextInput
          className="text-[28px] font-bold text-gray-900 flex-1"
          placeholder="0"
          keyboardType="numeric"
          value={value}
          onChangeText={onValueChange}
        />
      </View>
    </View>
  );
};
