import { AssetSelectionModal } from '@/components/allocation/AssetSelectionModal';
import { HistoryItemList } from '@/components/history/HistoryItemList';
import { HistorySummaryCard } from '@/components/history/HistorySummaryCard';
import { CATEGORY_CONFIG } from '@/constants/categories';
import { COLORS } from '@/constants/colors';
import { ALL_FILTER } from '@/hooks/history/allocationHistory';
import { useAssets } from '@/hooks/useAssets';
import { useAllocationHistory } from '@/hooks/useAllocationHistory';
import { useAllocations } from '@/hooks/useAllocations';
import { useSaveAllocation } from '@/hooks/useSaveAllocation';
import { getAllocationMonthValue } from '@/services/allocation/allocation.service';
import { formatAmount } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function AllocationHistoryScreen() {
  const [isModalVisible, setModalVisible] = useState(false);
  const { data: allocations = [], isLoading: isAllocationsLoading, error: allocationsError } = useAllocations();
  const { data: assets = [], isLoading: isAssetsLoading, error: assetsError } = useAssets();
  const { mutate: saveAllocation, isPending } = useSaveAllocation();
  const { editor, filters, list, navigation, selectedMonthAllocations, summary } = useAllocationHistory({
    allocations,
    assets,
  });

  const handleSave = () => {
    saveAllocation({
      allocationMonth: getAllocationMonthValue(navigation.selectedMonth),
      existingAllocations: selectedMonthAllocations,
      items: editor.allItems,
    }, {
      onSuccess: () => {
        editor.handleCancelEditing();
        Alert.alert('성공', '변경사항이 저장되었습니다.');
      },
      onError: () => {
        Alert.alert('오류', '저장에 실패했습니다. 다시 시도해주세요.');
      },
    });
  };

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
          <Text className="text-[28px] font-bold text-gray-900">자금 흐름</Text>
          <Text className="text-sm text-gray-500 mt-1">월별 자금 이동</Text>
        </View>

        <View className="bg-white rounded-2xl px-4 py-4 mb-4 flex-row items-center justify-between">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={() => navigation.handleMonthChange(-1)}
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.secondaryDark} />
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-lg font-bold text-gray-900">{navigation.selectedMonthLabel}</Text>
          </View>

          <TouchableOpacity
            className={`w-10 h-10 rounded-full items-center justify-center ${navigation.isCurrentMonth ? 'bg-gray-100' : 'bg-primary-light'}`}
            onPress={() => navigation.handleMonthChange(1)}
            disabled={navigation.isCurrentMonth}
          >
            <Ionicons name="chevron-forward" size={20} color={navigation.isCurrentMonth ? '#9CA3AF' : COLORS.primary} />
          </TouchableOpacity>
        </View>

        <HistorySummaryCard
          hasPreviousMonthData={summary.hasPreviousMonthData}
          monthDiff={summary.monthDiff}
          previousMonthLabel={summary.previousMonthLabel}
          selectedMonthLabel={navigation.selectedMonthLabel}
          totalAmount={summary.totalAmount}
        />

        <View className="bg-white rounded-[28px] px-5 py-4 mb-5">
          {summary.categoryTotals.map((item, index) => {
            const isLastItem = index === summary.categoryTotals.length - 1;
            const categoryConfig = CATEGORY_CONFIG[item.category];

            return (
              <View
                key={item.category}
                className={`flex-row items-center justify-between py-4 ${isLastItem ? '' : 'border-b border-gray-100'}`}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                    style={{ backgroundColor: `${categoryConfig.color}20` }}
                  >
                    <Ionicons
                      name={categoryConfig.icon}
                      size={18}
                      color={categoryConfig.color}
                    />
                  </View>
                  <Text className="text-sm text-gray-500">{categoryConfig.label}</Text>
                </View>
                <Text className="text-[18px] font-bold text-gray-900">{formatAmount(item.amount)}원</Text>
              </View>
            );
          })}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row">
            {filters.filterOptions.map((filter) => {
              const isSelected = filters.selectedFilter === filter.key;
              const selectedColor = filter.key === ALL_FILTER
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
                  onPress={() => filters.setSelectedFilter(filter.key)}
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
          <View className="flex-row items-center justify-between">
            <Text className="text-[17px] font-bold text-gray-900">{navigation.selectedMonthLabel} 배분 내역</Text>
            {editor.isEditing ? (
              <View className="flex-row items-center">
                <TouchableOpacity className="px-3 py-2 rounded-full bg-gray-200 mr-2" onPress={editor.handleCancelEditing}>
                  <Text className="text-xs font-semibold text-gray-700">취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-3 py-2 rounded-full bg-primary-light"
                  onPress={handleSave}
                  disabled={isPending}
                >
                  <Text className="text-xs font-semibold text-primary">{isPending ? '저장 중' : '저장'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity className="px-3 py-2 rounded-full bg-primary-light" onPress={editor.handleStartEditing}>
                <Text className="text-xs font-semibold text-primary">편집</Text>
              </TouchableOpacity>
            )}
          </View>
          {editor.isEditing ? (
            <Text className="text-xs text-gray-500 mt-2">금액 수정, 항목 삭제, 자산 추가까지 먼저 구성했습니다.</Text>
          ) : null}
        </View>

        <HistoryItemList
          isEditing={editor.isEditing}
          items={editor.isEditing ? editor.items : list.items}
          onAddPress={() => setModalVisible(true)}
          onAmountChange={editor.handleAmountChange}
          onRemove={editor.handleRemoveItem}
          selectedFilter={filters.selectedFilter}
          selectedMonthLabel={navigation.selectedMonthLabel}
        />
      </ScrollView>

      <AssetSelectionModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onAddAsset={(assetId, name, category) => {
          editor.handleAddAsset(assetId, name, category);
          setModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}
