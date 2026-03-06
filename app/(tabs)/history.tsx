import { useAssets } from '@/hooks/useAssets';
import { useAllocations } from '@/hooks/useAllocations';
import { CATEGORY_CONFIG, CATEGORY_TYPES, CategoryType } from '@/constants/categories';
import { COLORS } from '@/constants/colors';
import { formatDate } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const HEX_OPACITY_8_PERCENT = '15';
const formatAmount = (value: number) => value.toLocaleString('ko-KR');
const shiftMonth = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth() + amount, 1);
type AllocationHistoryFilter = CategoryType | 'ALL';

const CATEGORY_FILTERS: Array<{ key: AllocationHistoryFilter; label: string }> = [
  { key: 'ALL', label: '전체' },
  { key: CATEGORY_TYPES.INVEST, label: '투자' },
  { key: CATEGORY_TYPES.CASH, label: '현금' },
  { key: CATEGORY_TYPES.SPEND, label: '소비' },
];

export default function AllocationHistoryScreen() {
  const { data: allocations = [], isLoading: isAllocationsLoading, error: allocationsError } = useAllocations();
  const { data: assets = [], isLoading: isAssetsLoading, error: assetsError } = useAssets();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedFilter, setSelectedFilter] = useState<AllocationHistoryFilter>('ALL');
  const handleMonthChange = (amount: number) => {
    setSelectedMonth((prev) => shiftMonth(prev, amount));
    setSelectedFilter('ALL');
  };

  const currentMonth = new Date();
  const currentMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const selectedMonthKey = formatDate(selectedMonth, 'yyyy-MM');
  const selectedMonthLabel = formatDate(selectedMonth, 'yyyy년 M월');
  const previousMonth = shiftMonth(selectedMonth, -1);
  const previousMonthKey = formatDate(previousMonth, 'yyyy-MM');
  const previousMonthLabel = formatDate(previousMonth, 'M월');
  const selectedMonthAllocations = allocations.filter((allocation) => allocation.allocationMonth.startsWith(selectedMonthKey));
  const previousMonthAllocations = allocations.filter((allocation) => allocation.allocationMonth.startsWith(previousMonthKey));
  const isCurrentMonth = selectedMonth.getTime() === currentMonthDate.getTime();

  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));
  const historyItems = selectedMonthAllocations.map((allocation) => {
    const asset = assetMap.get(allocation.assetId);
    const category = asset?.category ?? CATEGORY_TYPES.CASH;
    const config = CATEGORY_CONFIG[category];

    return {
      id: allocation.id,
      name: asset?.name ?? '알 수 없는 자산',
      amount: allocation.inputAmount,
      category,
      iconName: asset?.iconName ?? config.icon,
      color: asset?.color ?? config.color,
      label: config.label,
      textClass: config.textClass,
    };
  });
  const filteredHistoryItems = selectedFilter === 'ALL'
    ? historyItems
    : historyItems.filter((item) => item.category === selectedFilter);

  const totalAmount = historyItems.reduce((sum, item) => sum + item.amount, 0);
  const previousMonthTotalAmount = previousMonthAllocations.reduce((sum, allocation) => sum + allocation.inputAmount, 0);
  const monthDiff = totalAmount - previousMonthTotalAmount;
  const hasPreviousMonthData = previousMonthAllocations.length > 0;
  const diffColor = monthDiff > 0 ? COLORS.increase : monthDiff < 0 ? COLORS.decrease : COLORS.secondary;
  const diffPrefix = monthDiff > 0 ? '+' : monthDiff < 0 ? '-' : '';

  const categoryTotals = (Object.values(CATEGORY_TYPES) as CategoryType[]).map((category) => {
    const config = CATEGORY_CONFIG[category];
    const amount = historyItems
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      category,
      amount,
      label: config.label,
      color: config.color,
      bgClass: config.bgClass,
    };
  });

  if (isAllocationsLoading || isAssetsLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (allocationsError || assetsError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Text className="text-base font-semibold text-gray-800 mb-2">배분 내역을 불러오지 못했습니다.</Text>
        <Text className="text-sm text-gray-500 text-center">잠시 후 다시 시도해주세요.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Text className="text-[28px] font-bold text-gray-900">배분 내역</Text>
          <Text className="text-sm text-gray-500 mt-1">{selectedMonthLabel} 자금 배분 흐름</Text>
        </View>

        <View className="bg-white rounded-2xl px-4 py-4 mb-4 flex-row items-center justify-between">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={() => handleMonthChange(-1)}
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.secondaryDark} />
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-lg font-bold text-gray-900">{selectedMonthLabel}</Text>
            <Text className="text-xs text-gray-400 mt-1">월별 배분 조회</Text>
          </View>

          <TouchableOpacity
            className={`w-10 h-10 rounded-full items-center justify-center ${isCurrentMonth ? 'bg-gray-100' : 'bg-primary-light'}`}
            onPress={() => handleMonthChange(1)}
            disabled={isCurrentMonth}
          >
            <Ionicons name="chevron-forward" size={20} color={isCurrentMonth ? '#9CA3AF' : COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-[28px] p-6 mb-4">
          <Text className="text-sm text-gray-500 mb-2">{selectedMonthLabel} 총 배분</Text>
          <Text className="text-[32px] font-bold text-gray-900">{formatAmount(totalAmount)}원</Text>
          <Text className="text-sm mt-3" style={{ color: hasPreviousMonthData ? diffColor : COLORS.secondary }}>
            {hasPreviousMonthData
              ? `${previousMonthLabel} 대비 ${diffPrefix}${formatAmount(Math.abs(monthDiff))}원`
              : `${previousMonthLabel} 비교 데이터가 없습니다.`}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">총 {historyItems.length}건의 배분이 기록되었습니다.</Text>
        </View>

        <View className="flex-row flex-wrap justify-between mb-5">
          {categoryTotals.map((item) => (
            <View key={item.category} className="bg-white rounded-2xl p-4 w-[48%] mb-3">
              <Text className="text-sm text-gray-500 mb-1">{item.label}</Text>
              <Text className="text-[18px] font-bold text-gray-900">{formatAmount(item.amount)}원</Text>
            </View>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row">
            {CATEGORY_FILTERS.map((filter) => {
              const isSelected = selectedFilter === filter.key;
              const selectedColor = filter.key === 'ALL'
                ? COLORS.secondaryDark
                : CATEGORY_CONFIG[filter.key].color;

              return (
                <TouchableOpacity
                  key={filter.key}
                  className="px-4 py-2 rounded-full mr-2 border"
                  style={{
                    backgroundColor: isSelected ? selectedColor : '#FFFFFF',
                    borderColor: isSelected ? selectedColor : '#E5E7EB',
                  }}
                  onPress={() => setSelectedFilter(filter.key)}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: isSelected ? '#FFFFFF' : '#6B7280' }}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View className="mb-3">
          <Text className="text-[17px] font-bold text-gray-900">{selectedMonthLabel} 배분 항목</Text>
        </View>

        {filteredHistoryItems.length === 0 ? (
          <View className="bg-white rounded-2xl p-6 items-center">
            <Text className="text-base font-semibold text-gray-800 mb-1">아직 배분 내역이 없습니다.</Text>
            <Text className="text-sm text-gray-500">
              {selectedFilter === 'ALL'
                ? `${selectedMonthLabel} 배분을 저장하면 여기에 표시됩니다.`
                : `${selectedMonthLabel} ${CATEGORY_CONFIG[selectedFilter].label} 배분 내역이 없습니다.`}
            </Text>
          </View>
        ) : (
          filteredHistoryItems.map((item) => (
            <View
              key={item.id}
              className="flex-row justify-between items-center p-4 bg-white rounded-2xl mb-3"
              style={{ shadowColor: '#000', shadowOpacity: 0.02, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
            >
              <View className="flex-row items-center flex-1 mr-4">
                <View
                  className="w-11 h-11 rounded-[14px] items-center justify-center mr-3.5"
                  style={{ backgroundColor: item.color + HEX_OPACITY_8_PERCENT }}
                >
                  <Ionicons name={item.iconName} size={20} color={item.color} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-[15px] font-semibold text-gray-800 mr-2">{item.name}</Text>
                    <View className={`px-1.5 py-0.5 rounded-md ${item.category === CATEGORY_TYPES.INVEST ? 'bg-primary-light' : item.category === CATEGORY_TYPES.CASH ? 'bg-emerald-light' : 'bg-warning-light'}`}>
                      <Text className={`text-[10px] font-bold ${item.textClass}`}>{item.label}</Text>
                    </View>
                  </View>
                  <Text className="text-xs text-gray-400">{selectedMonthLabel} 배분액</Text>
                </View>
              </View>
              <Text className="text-base font-bold text-gray-900">{formatAmount(item.amount)}원</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
