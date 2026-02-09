import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface AllocationFooterProps {
  remaining: number;
  progressPercent: number;
  totalIncome: number;
  onSave: () => void;
}

export const AllocationFooter = ({
  remaining,
  progressPercent,
  totalIncome,
  onSave,
}: AllocationFooterProps) => {
  const isComplete = remaining === 0 && totalIncome > 0;
  const isOverBudget = remaining < 0;
  const progressColor = isOverBudget ? 'bg-danger' : 'bg-primary';
  const remainingColor = isOverBudget ? 'text-danger' : 'text-gray-900';
  const buttonBg = isComplete ? 'bg-gray-900' : 'bg-gray-200';
  const buttonTextColor = isComplete ? 'text-white' : 'text-gray-400';

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white p-5 pb-10 border-t border-gray-100" style={{ elevation: 20 }}>
      <View className="h-1 bg-gray-100 rounded-sm mb-4 overflow-hidden">
        <View className={`h-full rounded-sm ${progressColor}`} style={{ width: `${progressPercent}%` }} />
      </View>

      <View className="flex-row justify-between mb-3">
        <Text className="text-[15px] text-gray-500">남은 금액</Text>
        <Text className={`text-lg font-bold ${remainingColor}`}>
          {remaining.toLocaleString()} 원
        </Text>
      </View>

      <TouchableOpacity
        className={`h-14 rounded-2xl items-center justify-center ${buttonBg}`}
        disabled={!isComplete}
        onPress={onSave}
      >
        <Text className={`text-base font-bold ${buttonTextColor}`}>
          {isComplete ? "배분 완료하기" : "금액을 맞춰주세요"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
