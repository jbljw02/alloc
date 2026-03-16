import { COLORS } from '@/constants/colors';
import { formatNumber } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface TotalAssetsChartProps {
  totalAssets: number;
  lastMonthDiff: number;
  investTotal: number;
  cashTotal: number;
}

export const TotalAssetsChart = ({ totalAssets, lastMonthDiff, investTotal, cashTotal }: TotalAssetsChartProps) => {
  const SIZE = 260;
  const STROKE_WIDTH = 20;
  const RADIUS = (SIZE - STROKE_WIDTH) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const normalizedTotalAssets = totalAssets > 0 ? totalAssets : 1;
  const isIncrease = lastMonthDiff > 0;
  const isDecrease = lastMonthDiff < 0;
  const diffColor = isIncrease ? COLORS.increase : isDecrease ? COLORS.decrease : COLORS.secondary;
  const diffBackgroundColor = isIncrease ? '#FEF2F2' : isDecrease ? '#EFF6FF' : '#F3F4F6';
  const diffIconName = isIncrease ? 'caret-up' : isDecrease ? 'caret-down' : 'remove';

  const investPercent = investTotal / normalizedTotalAssets;
  const cashPercent = cashTotal / normalizedTotalAssets;
  const investArcLength = CIRCUMFERENCE * investPercent;
  const cashArcLength = CIRCUMFERENCE * cashPercent;

  return (
    <View className="items-center mt-8 mb-8">
      <View
        className="w-[260px] h-[260px] rounded-full bg-white items-center justify-center"
        style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 10 }, shadowRadius: 20, elevation: 5 }}
      >
        <Svg width={SIZE} height={SIZE} className="absolute" style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={COLORS.primary}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${investArcLength} ${CIRCUMFERENCE - investArcLength}`}
            strokeDashoffset={0}
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={COLORS.emerald}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${cashArcLength} ${CIRCUMFERENCE - cashArcLength}`}
            strokeDashoffset={-investArcLength}
          />
        </Svg>

        <View
          className="absolute items-center justify-center px-5"
          style={{ top: 0, left: 0, right: 0, bottom: 0 }}
          pointerEvents="none"
        >
          <Text className="text-[13px] text-gray-500 mb-1 font-semibold">총 순자산</Text>
          <Text className="text-[26px] font-extrabold text-gray-900 text-center tracking-tight">{formatNumber(totalAssets)}</Text>
          <View className="flex-row items-center px-2 py-1 rounded-xl mt-2" style={{ backgroundColor: diffBackgroundColor }}>
            <Ionicons name={diffIconName} size={12} color={diffColor} />
            <Text className="text-xs font-bold ml-1" style={{ color: diffColor }}>
              {formatNumber(Math.abs(lastMonthDiff))} (지난달)
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
