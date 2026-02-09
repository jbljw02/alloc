import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { CATEGORY_CONFIG, CategoryType, MY_ASSETS_DB } from '@/constants/mock-categories';

interface AssetListContentProps {
  onSelectAsset: (name: string, category: CategoryType) => void;
  onOpenCustomInput: () => void;
}

export const AssetListContent = ({ onSelectAsset, onOpenCustomInput }: AssetListContentProps) => {
  return (
    <>
      <ScrollView style={{ maxHeight: 300 }}>
        {MY_ASSETS_DB.map((asset) => {
          const config = CATEGORY_CONFIG[asset.category as CategoryType];
          return (
            <TouchableOpacity
              key={asset.id}
              className="py-4 border-b border-gray-100 flex-row justify-between items-center"
              onPress={() => onSelectAsset(asset.name, asset.category as CategoryType)}
            >
              <View className="flex-row items-center">
                <View className={`w-8 h-8 rounded-[10px] items-center justify-center mr-3 ${config.bgClass}`}>
                  <Ionicons name={config.icon} size={16} color={config.color} />
                </View>
                <Text className="text-base text-gray-700">{asset.name}</Text>
              </View>
              <Text className={`text-xs font-semibold ${config.textClass}`}>
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View className="h-px bg-gray-200 my-4" />
      <TouchableOpacity className="flex-row items-center justify-center p-3" onPress={onOpenCustomInput}>
        <Ionicons name="create-outline" size={20} color={COLORS.primary} />
        <Text className="text-primary font-semibold ml-2">직접 입력해서 추가하기</Text>
      </TouchableOpacity>
    </>
  );
};
