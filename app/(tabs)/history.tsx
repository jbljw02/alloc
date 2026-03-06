import { useAssets } from '@/hooks/useAssets';
import { useAllocations } from '@/hooks/useAllocations';
import { CATEGORY_CONFIG, CATEGORY_TYPES, CategoryType } from '@/constants/categories';
import { COLORS } from '@/constants/colors';
import { formatDate } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, View } from 'react-native';

const HEX_OPACITY_8_PERCENT = '15';
const formatAmount = (value: number) => value.toLocaleString('ko-KR');

export default function AllocationHistoryScreen() {
  const { data: allocations = [], isLoading: isAllocationsLoading, error: allocationsError } = useAllocations();
  const { data: assets = [], isLoading: isAssetsLoading, error: assetsError } = useAssets();

  const currentMonthKey = formatDate(new Date(), 'yyyy-MM');
  const currentMonthLabel = formatDate(new Date(), 'yyyy년 M월');
  const currentMonthAllocations = allocations.filter((allocation) => allocation.allocationMonth.startsWith(currentMonthKey));

  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));
  const historyItems = currentMonthAllocations.map((allocation) => {
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

  const totalAmount = historyItems.reduce((sum, item) => sum + item.amount, 0);

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
          <Text className="text-sm text-gray-500 mt-1">{currentMonthLabel} 자금 배분 흐름</Text>
        </View>

        <View className="bg-white rounded-[28px] p-6 mb-4">
          <Text className="text-sm text-gray-500 mb-2">이번 달 총 배분</Text>
          <Text className="text-[32px] font-bold text-gray-900">{formatAmount(totalAmount)}원</Text>
          <Text className="text-sm text-gray-500 mt-3">총 {historyItems.length}건의 배분이 기록되었습니다.</Text>
        </View>

        <View className="flex-row flex-wrap justify-between mb-5">
          {categoryTotals.map((item) => (
            <View key={item.category} className="bg-white rounded-2xl p-4 w-[48%] mb-3">
              <Text className="text-sm text-gray-500 mb-1">{item.label}</Text>
              <Text className="text-[18px] font-bold text-gray-900">{formatAmount(item.amount)}원</Text>
            </View>
          ))}
        </View>

        <View className="mb-3">
          <Text className="text-[17px] font-bold text-gray-900">이번 달 배분 항목</Text>
        </View>

        {historyItems.length === 0 ? (
          <View className="bg-white rounded-2xl p-6 items-center">
            <Text className="text-base font-semibold text-gray-800 mb-1">아직 배분 내역이 없습니다.</Text>
            <Text className="text-sm text-gray-500">이번 달 배분을 저장하면 여기에 표시됩니다.</Text>
          </View>
        ) : (
          historyItems.map((item) => (
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
                  <Text className="text-xs text-gray-400">{currentMonthLabel} 배분액</Text>
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
