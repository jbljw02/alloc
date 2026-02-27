import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { CATEGORY_CONFIG } from '@/constants/categories';
import { CategoryType } from '@/constants/categories';
import { useAssets } from '@/hooks/useAssets';

interface AssetListContentProps {
  onSelectAsset: (assetId: string, name: string, category: CategoryType) => void;
  onOpenCustomInput: () => void;
}

const HEX_OPACITY_8_PERCENT = '15';

export const AssetListContent = ({ onSelectAsset, onOpenCustomInput }: AssetListContentProps) => {
  const { data: assets = [], isLoading, error } = useAssets();

  if (isLoading) {
    return (
      <View className="py-10 justify-center items-center">
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="py-10 justify-center items-center">
        <Text className="text-gray-500">자산을 불러오는데 실패했습니다.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={{ maxHeight: 300 }}>
        {assets.map((asset) => {
          const config = CATEGORY_CONFIG[asset.category];

          const iconColor = asset.color ?? config.color;
          const iconName = asset.iconName ?? config.icon;
          const bgStyle = asset.color ? { backgroundColor: asset.color + HEX_OPACITY_8_PERCENT } : undefined;
          const bgClass = asset.color ? asset.color + HEX_OPACITY_8_PERCENT : config.bgClass;

          return (
            <TouchableOpacity
              key={asset.id}
              className="py-4 border-b border-gray-100 flex-row justify-between items-center"
              onPress={() => onSelectAsset(asset.id, asset.name, asset.category)}
            >
              <View className="flex-row items-center">
                <View
                  className={`w-8 h-8 rounded-[10px] items-center justify-center mr-3 ${bgClass}`}
                  style={bgStyle}
                >
                  <Ionicons name={iconName} size={16} color={iconColor} />
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
