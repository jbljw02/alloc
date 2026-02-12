import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { formatNumber } from '@/utils/formatters';
import { Asset } from '@/constants/mock-dashboard';

interface PortfolioListProps {
  assets: Asset[];
}

export const PortfolioList = ({ assets }: PortfolioListProps) => {
  return (
    <View className="mb-5">
      <Text className="text-[17px] font-bold text-gray-900 mb-4">포트폴리오 상세</Text>

      {assets.map((item) => {
        const isInvest = item.category === 'INVEST';
        const isPositiveProfit = item.profit.includes('+');
        return (
          <View
            key={item.id}
            className="flex-row justify-between items-center p-4 bg-white rounded-2xl mb-3"
            style={{ shadowColor: '#000', shadowOpacity: 0.02, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
          >
            <View className="flex-row items-center">
              <View
                className="w-11 h-11 rounded-[14px] items-center justify-center mr-3.5"
                style={{ backgroundColor: item.color + '15' }}
              >
                <Ionicons name={isInvest ? item.icon : 'wallet'} size={20} color={item.color} />
              </View>
              <View>
                <View className="flex-row items-center mb-1">
                  <Text className="text-[15px] font-semibold text-gray-800 mr-2">{item.name}</Text>
                  <View className={`px-1.5 py-0.5 rounded-md ${isInvest ? 'bg-primary-light' : 'bg-success-light'}`}>
                    <Text className={`text-[10px] font-bold ${isInvest ? 'text-primary' : 'text-success'}`}>
                      {item.category}
                    </Text>
                  </View>
                </View>
                <Text
                  className="text-xs font-medium mt-0.5"
                  style={{ color: isPositiveProfit ? COLORS.danger : '#3B82F6' }}
                >
                  수익률 {item.profit}
                </Text>
              </View>
            </View>
            <Text className="text-base font-bold text-gray-900">{formatNumber(item.amount)}</Text>
          </View>
        );
      })}
    </View>
  );
};
