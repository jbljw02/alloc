import { COLORS } from '@/constants/colors';
import { formatNumber } from '@/utils/formatters';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface TotalAssetsChartProps {
  totalAssets: number;
  investTotal: number;
  cashTotal: number;
  inputValue: string;
  isEditing: boolean;
  isPending: boolean;
  onCancel: () => void;
  onEditAmountChange: (value: string) => void;
  onStartEditing: () => void;
  onSubmit: () => void;
}

export const TotalAssetsChart = ({
  totalAssets,
  investTotal,
  cashTotal,
  inputValue,
  isEditing,
  isPending,
  onCancel,
  onEditAmountChange,
  onStartEditing,
  onSubmit,
}: TotalAssetsChartProps) => {
  const SIZE = 260;
  const STROKE_WIDTH = 20;
  const RADIUS = (SIZE - STROKE_WIDTH) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const normalizedTotalAssets = totalAssets > 0 ? totalAssets : 1;
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
        </View>
      </View>

      <View className="w-full bg-white rounded-2xl px-4 py-4 mt-2" style={{ shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
        {isEditing ? (
          <View>
            <Text className="text-xs text-gray-500 mb-2 font-semibold">총자산 수정</Text>
            <TextInput
              className="text-[24px] font-bold text-gray-900 border border-gray-200 rounded-2xl px-4 py-3"
              keyboardType="numeric"
              placeholder="0"
              value={inputValue}
              onChangeText={onEditAmountChange}
            />
            <View className="flex-row justify-end mt-3">
              <TouchableOpacity className="px-4 py-2 rounded-full bg-gray-100 mr-2" onPress={onCancel} disabled={isPending}>
                <Text className="text-xs font-semibold text-gray-700">취소</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-2 rounded-full bg-primary-light" onPress={onSubmit} disabled={isPending}>
                <Text className="text-xs font-semibold text-primary">{isPending ? '저장 중' : '저장'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-gray-500 font-semibold">현재 총합 기준점</Text>
              <Text className="text-sm text-gray-900 mt-1">총자산 값을 직접 맞춤</Text>
            </View>
            <TouchableOpacity className="px-4 py-2 rounded-full bg-primary-light" onPress={onStartEditing}>
              <Text className="text-xs font-semibold text-primary">총자산 수정</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};
