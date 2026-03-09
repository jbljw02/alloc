import { CATEGORY_TYPES, CategoryType } from '@/constants/categories';
import { Allocation } from '@/types/domain/allocation';
import { Asset } from '@/types/domain/asset';
import { formatDate } from '@/utils/formatters';

export const ALL_FILTER = 'ALL';

const CATEGORY_ORDER: CategoryType[] = [
  CATEGORY_TYPES.INVEST,
  CATEGORY_TYPES.CASH,
  CATEGORY_TYPES.SPEND,
];

export type AllocationHistoryFilter = CategoryType | typeof ALL_FILTER;

export interface AllocationHistoryItem {
  id: string;
  name: string;
  amount: number;
  category: CategoryType;
  assetColor: Asset['color'];
  assetIconName: Asset['iconName'];
}

export interface AllocationHistoryCategoryTotal {
  category: CategoryType;
  amount: number;
}

export interface AllocationHistoryFilterOption {
  key: AllocationHistoryFilter;
  label: string;
}

export const ALLOCATION_HISTORY_FILTERS: AllocationHistoryFilterOption[] = [
  { key: ALL_FILTER, label: '전체' },
  { key: CATEGORY_TYPES.INVEST, label: '투자' },
  { key: CATEGORY_TYPES.CASH, label: '현금' },
  { key: CATEGORY_TYPES.SPEND, label: '소비' },
];

export const getInitialSelectedMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

export const shiftMonth = (date: Date, amount: number): Date => {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
};

export const getMonthLabels = (selectedMonth: Date) => {
  const previousMonth = shiftMonth(selectedMonth, -1);

  return {
    previousMonthKey: formatDate(previousMonth, 'yyyy-MM'),
    previousMonthLabel: formatDate(previousMonth, 'M월'),
    selectedMonthKey: formatDate(selectedMonth, 'yyyy-MM'),
    selectedMonthLabel: formatDate(selectedMonth, 'yyyy년 M월'),
  };
};

export const getAllocationsByMonth = (allocations: Allocation[], monthKey: string): Allocation[] => {
  return allocations.filter((allocation) => allocation.allocationMonth.startsWith(monthKey));
};

export const getHistoryItems = (selectedMonthAllocations: Allocation[], assets: Asset[]): AllocationHistoryItem[] => {
  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));

  return selectedMonthAllocations.map((allocation) => {
    const asset = assetMap.get(allocation.assetId);
    const category = asset?.category ?? CATEGORY_TYPES.CASH;

    return {
      id: allocation.id,
      name: asset?.name ?? '알 수 없는 자산',
      amount: allocation.inputAmount,
      assetColor: asset?.color ?? null,
      assetIconName: asset?.iconName ?? null,
      category,
    };
  });
};

export const getFilteredHistoryItems = (
  historyItems: AllocationHistoryItem[],
  selectedFilter: AllocationHistoryFilter,
): AllocationHistoryItem[] => {
  if (selectedFilter === ALL_FILTER) {
    return historyItems;
  }

  return historyItems.filter((item) => item.category === selectedFilter);
};

export const getTotalAmount = (allocations: Array<{ amount: number }>): number => {
  return allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
};

export const getPreviousMonthTotalAmount = (allocations: Allocation[]): number => {
  return allocations.reduce((sum, allocation) => sum + allocation.inputAmount, 0);
};

export const getCategoryTotals = (historyItems: AllocationHistoryItem[]): AllocationHistoryCategoryTotal[] => {
  return CATEGORY_ORDER.map((category) => {
    const amount = historyItems
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      category,
      amount,
    };
  });
};
