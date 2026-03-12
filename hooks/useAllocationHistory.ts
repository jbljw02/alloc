import { Allocation } from '@/types/domain/allocation';
import { Asset } from '@/types/domain/asset';
import {
  AllocationHistoryEditorItem,
  AllocationHistoryFilter,
  ALL_FILTER,
  ALLOCATION_HISTORY_FILTERS,
  getAllocationsByMonth,
  getCategoryTotals,
  getEditableHistoryItems,
  getFilteredEditableHistoryItems,
  getFilteredHistoryItems,
  getHistoryItems,
  getInitialSelectedMonth,
  getMonthKey,
  getMonthLabels,
  getPreviousMonthTotalAmount,
  getTotalAmount,
  shiftMonth,
} from '@/hooks/history/allocationHistory';
import { formatNumber, parseNumber } from '@/utils/formatters';
import { useState } from 'react';

interface UseAllocationHistoryParams {
  allocations: Allocation[];
  assets: Asset[];
}

export const useAllocationHistory = ({ allocations, assets }: UseAllocationHistoryParams) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(getInitialSelectedMonth);
  const [selectedFilter, setSelectedFilter] = useState<AllocationHistoryFilter>(ALL_FILTER);
  const [editingItems, setEditingItems] = useState<AllocationHistoryEditorItem[] | null>(null);

  const currentMonthKey = getMonthKey(new Date());
  const { previousMonthKey, previousMonthLabel, selectedMonthKey, selectedMonthLabel } = getMonthLabels(selectedMonth);
  const selectedMonthAllocations = getAllocationsByMonth(allocations, selectedMonthKey);
  const previousMonthAllocations = getAllocationsByMonth(allocations, previousMonthKey);
  const historyItems = getHistoryItems(selectedMonthAllocations, assets);
  const editableHistoryItems = getEditableHistoryItems(historyItems);
  const isEditing = editingItems !== null;
  const filteredHistoryItems = getFilteredHistoryItems(historyItems, selectedFilter);
  const filteredEditingItems = getFilteredEditableHistoryItems(editingItems ?? [], selectedFilter);
  const displayCategoryTotals = isEditing
    ? getCategoryTotals(
      (editingItems ?? []).map((item) => ({
        ...item,
        amount: parseNumber(item.amount),
      })),
    )
    : getCategoryTotals(historyItems);
  const totalAmount = isEditing
    ? getTotalAmount((editingItems ?? []).map((item) => ({ amount: parseNumber(item.amount) })))
    : getTotalAmount(historyItems);
  const previousMonthTotalAmount = getPreviousMonthTotalAmount(previousMonthAllocations);
  const monthDiff = totalAmount - previousMonthTotalAmount;
  const hasPreviousMonthData = previousMonthAllocations.length > 0;
  const isCurrentMonth = selectedMonthKey === currentMonthKey;

  const handleStartEditing = () => {
    setEditingItems(editableHistoryItems);
    setSelectedFilter(ALL_FILTER);
  };

  const handleCancelEditing = () => {
    setEditingItems(null);
  };

  const handleAmountChange = (text: string, id: string) => {
    setEditingItems((previousItems) => {
      if (previousItems === null) {
        return previousItems;
      }

      return previousItems.map((item) => item.id === id ? { ...item, amount: formatNumber(text) } : item);
    });
  };

  const handleRemoveItem = (id: string) => {
    setEditingItems((previousItems) => {
      if (previousItems === null) {
        return previousItems;
      }

      return previousItems.filter((item) => item.id !== id);
    });
  };

  const handleAddAsset = (assetId: string | undefined, name: string, category: AllocationHistoryEditorItem['category']) => {
    const newItem: AllocationHistoryEditorItem = {
      id: Date.now().toString(),
      assetId,
      name,
      amount: '',
      category,
      assetColor: null,
      assetIconName: null,
    };

    setEditingItems((previousItems) => {
      if (previousItems === null) {
        return [newItem];
      }

      return [...previousItems, newItem];
    });
  };

  const handleMonthChange = (amount: number) => {
    setEditingItems(null);
    setSelectedMonth((prevSelectedMonth) => shiftMonth(prevSelectedMonth, amount));
    setSelectedFilter(ALL_FILTER);
  };

  return {
    editor: {
      allItems: editingItems ?? [],
      handleAddAsset,
      handleAmountChange,
      handleCancelEditing,
      handleRemoveItem,
      handleStartEditing,
      isEditing,
      items: isEditing ? filteredEditingItems : [],
    },
    filters: {
      filterOptions: ALLOCATION_HISTORY_FILTERS,
      selectedFilter,
      setSelectedFilter,
    },
    list: {
      historyCount: historyItems.length,
      items: filteredHistoryItems,
    },
    navigation: {
      handleMonthChange,
      isCurrentMonth,
      selectedMonth,
      selectedMonthKey,
      selectedMonthLabel,
    },
    selectedMonthAllocations,
    summary: {
      categoryTotals: displayCategoryTotals,
      hasPreviousMonthData,
      monthDiff,
      previousMonthLabel,
      totalAmount,
    },
  };
};
