import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { formatNumber } from '@/utils/formatters';

interface SummaryCardsProps {
  investTotal: number;
  cashTotal: number;
}

export const SummaryCards = ({ investTotal, cashTotal }: SummaryCardsProps) => {
  return (
    <View className="flex-row justify-between mb-8">
      <View
        className="w-[48%] bg-white p-4 rounded-2xl items-center"
        style={{ shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
      >
        <View className="w-9 h-9 rounded-xl bg-primary-light items-center justify-center mb-2.5">
          <Ionicons name="trending-up" size={18} color={COLORS.primary} />
        </View>
        <Text className="text-xs text-gray-500 mb-1 font-semibold">투자 자산</Text>
        <Text className="text-[15px] font-bold text-gray-900">{formatNumber(investTotal)}</Text>
      </View>
      <View
        className="w-[48%] bg-white p-4 rounded-2xl items-center"
        style={{ shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
      >
        <View className="w-9 h-9 rounded-xl bg-emerald-light items-center justify-center mb-2.5">
          <Ionicons name="shield-checkmark" size={18} color={COLORS.emerald} />
        </View>
        <Text className="text-xs text-gray-500 mb-1 font-semibold">현금 보유</Text>
        <Text className="text-[15px] font-bold text-gray-900">{formatNumber(cashTotal)}</Text>
      </View>
    </View>
  );
};
