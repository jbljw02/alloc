import { useUpdateAssets } from '@/hooks/useUpdateAssets';
import { formatNumber } from '@/utils/formatters';
import { isNil } from '@/utils/validators';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Asset } from '@/types/domain/asset';
import { CATEGORY_TYPES } from '@/constants/categories';

interface PortfolioListProps {
  assets: Asset[];
}

const HEX_OPACITY_8_PERCENT = '15';

const styles = StyleSheet.create({
  amountInput: {
    backgroundColor: 'transparent',
    includeFontPadding: false,
    paddingBottom: 8,
    paddingRight: 1,
    paddingTop: 0,
    textAlign: 'right',
    textAlignVertical: 'center',
  },
  amountUnit: {
    includeFontPadding: false,
    lineHeight: 22,
  },
});

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
    const formattedValue = formatNumber(value);

    setEditingAmounts((prev) => {
      return {
        ...prev,
        [assetId]: formattedValue,
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
    const editingAmount = getEditingAmount(asset.id);
    const amountValue = isEditing ? editingAmount : formatNumber(asset.currentBalance ?? 0);

    return (
      <View className="w-full h-[42px] flex-row items-center justify-end">
        <View className="w-[112px] h-full justify-center pl-2 pr-0">
          <TextInput
            className={`w-full text-base font-bold text-right p-0 m-0 ${isEditing ? 'text-gray-400' : 'text-gray-900'}`}
            style={styles.amountInput}
            cursorColor={COLORS.primary}
            editable={isEditing}
            keyboardType="numeric"
            readOnly={!isEditing}
            selectionColor={COLORS.primary}
            underlineColorAndroid="transparent"
            value={amountValue}
            onChangeText={(value) => handleAmountChange(asset.id, value)}
          />
        </View>
        <Text className="text-base font-bold text-gray-900 ml-0.5" style={styles.amountUnit}>
          원
        </Text>
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
