import { useUpdateAssets } from '@/hooks/useUpdateAssets';
import { formatNumber } from '@/utils/formatters';
import { isNil } from '@/utils/validators';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Asset } from '@/types/domain/asset';
import { CATEGORY_TYPES } from '@/constants/categories';

interface PortfolioListProps {
  assets: Asset[];
}

const HEX_OPACITY_8_PERCENT = '15';

const sanitizeEditingAmount = (value: string): string => {
  return value.replace(/[^0-9,\s-]/g, '');
};

export const PortfolioList = ({ assets }: PortfolioListProps) => {
  const [editingAmounts, setEditingAmounts] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const { mutateAsync: updateAssets, isPending } = useUpdateAssets();

  const handleStartEdit = () => {
    const nextEditingAmounts = assets.reduce<Record<string, string>>((amounts, asset) => {
      return {
        ...amounts,
        [asset.id]: isNil(asset.currentBalance) ? '' : formatNumber(asset.currentBalance),
      };
    }, {});

    setEditingAmounts(nextEditingAmounts);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditingAmounts({});
    setIsEditing(false);
  };

  const handleAmountChange = (assetId: string, value: string) => {
    const normalizedValue = sanitizeEditingAmount(value);

    setEditingAmounts((prev) => {
      return {
        ...prev,
        [assetId]: normalizedValue,
      };
    });
  };

  const handleSubmitEdit = async () => {
    const items = assets.map((asset) => {
      return {
        asset,
        editingAmount: editingAmounts[asset.id] ?? '',
      };
    });

    try {
      await updateAssets({
        items,
      });

      handleCancelEdit();
    } catch {
      Alert.alert('오류', '자산 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const renderSectionAction = () => {
    if (isEditing) {
      return (
        <View className="flex-row items-center">
          <TouchableOpacity className="px-3 py-2 rounded-full bg-gray-200 mr-2" onPress={handleCancelEdit} disabled={isPending}>
            <Text className="text-xs font-semibold text-gray-700">취소</Text>
          </TouchableOpacity>
          <TouchableOpacity className="px-3 py-2 rounded-full bg-primary-light" onPress={() => void handleSubmitEdit()} disabled={isPending}>
            <Text className="text-xs font-semibold text-primary">{isPending ? '저장 중' : '저장'}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity className="px-3 py-2 rounded-full bg-primary-light" onPress={handleStartEdit}>
        <Text className="text-xs font-semibold text-primary">편집</Text>
      </TouchableOpacity>
    );
  };

  const getEditingAmount = (assetId: string): string => {
    return editingAmounts[assetId] ?? '';
  };

  const renderAmountArea = (asset: Asset) => {
    if (isEditing) {
      return (
        <TextInput
          className="w-full h-[42px] text-base font-bold text-gray-900 text-right border border-gray-200 rounded-xl px-3 py-2"
          keyboardType="numeric"
          placeholder="0"
          value={getEditingAmount(asset.id)}
          onChangeText={(value) => handleAmountChange(asset.id, value)}
        />
      );
    }

    return (
      <View className="w-full h-[42px] justify-center px-3 pt-1">
        <Text className="text-base font-bold text-gray-900 text-right">{formatNumber(asset.currentBalance ?? 0)}</Text>
      </View>
    );
  };

  return (
    <View className="mb-5">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-[17px] font-bold text-gray-900">포트폴리오 상세</Text>
        {renderSectionAction()}
      </View>

      {assets.map((item) => {
        const isInvest = item.category === CATEGORY_TYPES.INVEST;
        const iconColor = item.color ?? COLORS.primary;
        const iconName = item.iconName ?? 'wallet';

        return (
          <View
            key={item.id}
            className="relative flex-row justify-between items-center p-4 bg-white rounded-2xl mb-3"
            style={{ shadowColor: '#000', shadowOpacity: 0.02, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
          >
            <View className="flex-row items-center">
              <View
                className="w-11 h-11 rounded-[14px] items-center justify-center mr-3.5"
                style={{ backgroundColor: iconColor + HEX_OPACITY_8_PERCENT }}
              >
                <Ionicons name={isInvest ? iconName : 'wallet'} size={20} color={iconColor} />
              </View>
              <View>
                <View className="flex-row items-center mb-1">
                  <Text className="text-[15px] font-semibold text-gray-800 mr-2">{item.name}</Text>
                  <View className={`px-1.5 py-0.5 rounded-md ${isInvest ? 'bg-primary-light' : 'bg-emerald-light'}`}>
                    <Text className={`text-[10px] font-bold ${isInvest ? 'text-primary' : 'text-emerald'}`}>
                      {item.category}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View className="w-[132px] items-end">
              {renderAmountArea(item)}
            </View>
          </View>
        );
      })}
    </View>
  );
};
