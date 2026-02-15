import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { CATEGORY_CONFIG, CategoryType } from '@/constants/mock-categories';

export interface AllocationItem {
  id: string;
  name: string;
  category: CategoryType;
  amount: string;
}

interface AllocationListProps {
  items: AllocationItem[];
  onAmountChange: (text: string, id: string) => void;
  onRemove: (id: string) => void;
  onReset: () => void;
  onAddPress: () => void;
}

export const AllocationList = ({
  items,
  onAmountChange,
  onRemove,
  onReset,
  onAddPress,
}: AllocationListProps) => {
  return (
    <View className="p-6">
      <View className="flex-row justify-between mb-4">
        <Text className="text-base font-bold text-gray-700">자산 배분</Text>
        <TouchableOpacity onPress={onReset}>
          <Text className="text-[13px] text-danger">초기화</Text>
        </TouchableOpacity>
      </View>

      {items.map((item) => {
        const config = CATEGORY_CONFIG[item.category];
        return (
          <View key={item.id} className="flex-row justify-between items-center py-3.5 border-b border-gray-100">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => onRemove(item.id)} className="mr-3">
                <Ionicons name="remove-circle" size={22} color={COLORS.failure} />
              </TouchableOpacity>
              <View className={`w-8 h-8 rounded-[10px] items-center justify-center mr-2.5 ${config.bgClass}`}>
                <Ionicons name={config.icon} size={14} color={config.color} />
              </View>
              <Text className="text-base text-gray-800 font-medium">{item.name}</Text>
            </View>
            <TextInput
              className="text-lg font-semibold text-gray-900 min-w-[80px] text-right p-0"
              placeholder="0"
              keyboardType="numeric"
              value={item.amount}
              onChangeText={(text) => onAmountChange(text, item.id)}
            />
          </View>
        );
      })}

      <TouchableOpacity className="flex-row items-center justify-center p-4 mt-4 border border-dashed border-gray-200 rounded-xl" onPress={onAddPress}>
        <Ionicons name="add" size={20} color={COLORS.secondary} />
        <Text className="ml-1.5 text-gray-600 font-semibold">자산 추가하기</Text>
      </TouchableOpacity>
    </View>
  );
};
