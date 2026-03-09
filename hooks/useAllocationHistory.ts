import { Allocation } from '@/types/domain/allocation';
import { Asset } from '@/types/domain/asset';
import {
  AllocationHistoryFilter,
  ALL_FILTER,
  ALLOCATION_HISTORY_FILTERS,
  getAllocationsByMonth,
  getCategoryTotals,
  getFilteredHistoryItems,
  getHistoryItems,
  getInitialSelectedMonth,
  getMonthLabels,
  getPreviousMonthTotalAmount,
  getTotalAmount,
  shiftMonth,
} from '@/hooks/history/allocationHistory';
import { useState } from 'react';

interface UseAllocationHistoryParams {
  allocations: Allocation[];
  assets: Asset[];
}

export const useAllocationHistory = ({ allocations, assets }: UseAllocationHistoryParams) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(getInitialSelectedMonth);
  const [selectedFilter, setSelectedFilter] = useState<AllocationHistoryFilter>(ALL_FILTER);

  const currentMonth = getInitialSelectedMonth();
  const { previousMonthKey, previousMonthLabel, selectedMonthKey, selectedMonthLabel } = getMonthLabels(selectedMonth);
  const selectedMonthAllocations = getAllocationsByMonth(allocations, selectedMonthKey);
  const previousMonthAllocations = getAllocationsByMonth(allocations, previousMonthKey);
  const historyItems = getHistoryItems(selectedMonthAllocations, assets);
  const filteredHistoryItems = getFilteredHistoryItems(historyItems, selectedFilter);
  const totalAmount = getTotalAmount(historyItems);
  const previousMonthTotalAmount = getPreviousMonthTotalAmount(previousMonthAllocations);
  const monthDiff = totalAmount - previousMonthTotalAmount;
  const hasPreviousMonthData = previousMonthAllocations.length > 0;
  const categoryTotals = getCategoryTotals(historyItems);
  const isCurrentMonth = selectedMonth.getTime() === currentMonth.getTime();

  const handleMonthChange = (amount: number) => {
    setSelectedMonth((prevSelectedMonth) => shiftMonth(prevSelectedMonth, amount));
    setSelectedFilter(ALL_FILTER);
  };

  return {
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
      selectedMonthLabel,
    },
    summary: {
      categoryTotals,
      hasPreviousMonthData,
      monthDiff,
      previousMonthLabel,
      totalAmount,
    },
  };
};
