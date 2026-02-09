import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CATEGORY_CONFIG, CategoryType } from '@/constants/mock-categories';

interface CustomAssetInputProps {
  name: string;
  onNameChange: (value: string) => void;
  category: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  onAdd: () => void;
  onBackToList: () => void;
}

export const CustomAssetInput = ({
  name,
  onNameChange,
  category,
  onCategoryChange,
  onAdd,
  onBackToList,
}: CustomAssetInputProps) => {
  return (
    <View>
      <TextInput
        className="bg-gray-50 p-4 rounded-xl text-base mb-4"
        placeholder="예: 적금, 비상금"
        value={name}
        onChangeText={onNameChange}
        autoFocus
      />
      <View className="flex-row gap-2 mb-5">
        {(Object.keys(CATEGORY_CONFIG) as CategoryType[]).map((cat) => {
          const isSelected = category === cat;
          return (
            <TouchableOpacity
              key={cat}
              className={`py-2 px-4 rounded-full border ${isSelected ? '' : 'border-gray-200 bg-white'}`}
              style={isSelected ? { backgroundColor: CATEGORY_CONFIG[cat].color, borderColor: CATEGORY_CONFIG[cat].color } : undefined}
              onPress={() => onCategoryChange(cat)}
            >
              <Text className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                {CATEGORY_CONFIG[cat].label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity
        className="bg-gray-900 p-4 rounded-xl items-center"
        style={{ opacity: name ? 1 : 0.5 }}
        disabled={!name}
        onPress={onAdd}
      >
        <Text className="text-white font-bold text-base">추가하기</Text>
      </TouchableOpacity>

      <TouchableOpacity className="mt-3 items-center" onPress={onBackToList}>
        <Text className="text-gray-500 text-[13px]">목록에서 선택하기</Text>
      </TouchableOpacity>
    </View>
  );
};
