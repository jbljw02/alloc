import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { formatNumber } from '@/utils/formatters';

interface SummaryCardsProps {
  investTotal: number;
  cashTotal: number;
}

export const SummaryCards = ({
  investTotal,
  cashTotal,
}: SummaryCardsProps) => {
  return (
    <View className="mb-8">
      <View className="flex-row justify-between">
        <View
          className="relative w-[47%] bg-white px-4 pb-5 pt-4 rounded-2xl"
          style={{ shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
        >
          <View className="w-14 h-14 rounded-[16px] bg-primary-light items-center justify-center mb-2.5 self-center">
            <Ionicons name="trending-up" size={26} color={COLORS.primary} />
          </View>
          <Text className="text-[12px] text-gray-500 mb-1 font-semibold text-center">투자 자산</Text>
          <Text className="text-[15px] font-bold text-gray-900 text-center">{formatNumber(investTotal)}</Text>
        </View>
        <View
          className="relative w-[47%] bg-white px-4 pb-5 pt-4 rounded-2xl"
          style={{ shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
        >
          <View className="w-14 h-14 rounded-[16px] bg-emerald-light items-center justify-center mb-2.5 self-center">
            <Ionicons name="shield-checkmark" size={26} color={COLORS.emerald} />
          </View>
          <Text className="text-[12px] text-gray-500 mb-1 font-semibold text-center">현금 보유</Text>
          <Text className="text-[15px] font-bold text-gray-900 text-center">{formatNumber(cashTotal)}</Text>
        </View>
      </View>
    </View>
  );
};
