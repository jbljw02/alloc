import { COLORS } from '@/constants/colors';
import { formatAmount } from '@/utils/formatters';
import { Text, View } from 'react-native';

interface HistorySummaryCardProps {
  hasPreviousMonthData: boolean;
  monthDiff: number;
  previousMonthLabel: string;
  selectedMonthLabel: string;
  totalAmount: number;
}

export const HistorySummaryCard = ({
  hasPreviousMonthData,
  monthDiff,
  previousMonthLabel,
  selectedMonthLabel,
  totalAmount,
}: HistorySummaryCardProps) => {
  const diffColor = monthDiff > 0 ? COLORS.increase : monthDiff < 0 ? COLORS.decrease : COLORS.secondary;
  const diffPrefix = monthDiff > 0 ? '+' : monthDiff < 0 ? '-' : '';
  const monthDiffLabel = hasPreviousMonthData
    ? `${previousMonthLabel} 대비 ${diffPrefix}${formatAmount(Math.abs(monthDiff))}원`
    : `${previousMonthLabel}의 비교 데이터가 없습니다.`;

  return (
    <View className="bg-white rounded-[28px] p-6 mb-4">
      <Text className="text-sm text-gray-500 mb-2">{selectedMonthLabel} 총 자금 흐름</Text>
      <Text className="text-[32px] font-bold text-gray-900">{formatAmount(totalAmount)}원</Text>
      <Text className="text-sm mt-3" style={{ color: hasPreviousMonthData ? diffColor : COLORS.secondary }}>
        {monthDiffLabel}
      </Text>
    </View>
  );
};
