import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { formatNumber } from '@/utils/formatters';

interface TotalAssetsChartProps {
  totalAssets: number;
  lastMonthDiff: number;
}

export const TotalAssetsChart = ({ totalAssets, lastMonthDiff }: TotalAssetsChartProps) => {
  return (
    <View className="items-center mt-8 mb-8">
      <View
        className="w-[260px] h-[260px] rounded-full border-[20px] border-white bg-white items-center justify-center"
        style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 10 }, shadowRadius: 20, elevation: 5 }}
      >
        <View
          className="absolute w-full h-full rounded-full border-[20px] border-l-transparent border-b-transparent border-r-transparent"
          style={{ borderColor: COLORS.primary, transform: [{ rotate: '45deg' }] }}
        />
        <View
          className="absolute w-full h-full rounded-full border-[20px] border-l-transparent border-b-transparent border-r-transparent"
          style={{ borderColor: COLORS.success, transform: [{ rotate: '180deg' }], opacity: 0.5 }}
        />
        <View className="items-center justify-center px-5 w-full">
          <Text className="text-[13px] text-gray-500 mb-1 font-semibold">총 순자산</Text>
          <Text className="text-[26px] font-extrabold text-gray-900 text-center tracking-tight">{formatNumber(totalAssets)}</Text>
          <View className="flex-row items-center bg-success-light px-2 py-1 rounded-xl mt-2">
            <Ionicons name="caret-up" size={12} color={COLORS.success} />
            <Text className="text-xs text-success font-bold ml-1">{formatNumber(lastMonthDiff)} (지난달)</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
