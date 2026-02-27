import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { formatNumber } from '@/utils/formatters';
import { Asset } from '@/types/domain/asset';
import { CATEGORY_TYPES } from '@/constants/categories';

interface PortfolioListProps {
  assets: Asset[];
}

const HEX_OPACITY_8_PERCENT = '15';

export const PortfolioList = ({ assets }: PortfolioListProps) => {
  return (
    <View className="mb-5">
      <Text className="text-[17px] font-bold text-gray-900 mb-4">포트폴리오 상세</Text>

      {assets.map((item) => {
        const isInvest = item.category === CATEGORY_TYPES.INVEST;
        const iconColor = item.color ?? COLORS.primary;
        const iconName = item.iconName ?? 'wallet';

        return (
          <View
            key={item.id}
            className="flex-row justify-between items-center p-4 bg-white rounded-2xl mb-3"
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
            <Text className="text-base font-bold text-gray-900">{formatNumber(item.currentBalance ?? 0)}</Text>
          </View>
        );
      })}
    </View>
  );
};
