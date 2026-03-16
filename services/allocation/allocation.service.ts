import { CATEGORY_CONFIG } from '@/constants/categories';
import { CategoryType } from '@/constants/categories';
import { allocationRepository } from '@/repositories/allocation.repository';
import { assetRepository } from '@/repositories/asset.repository';
import { Allocation } from '@/types/domain/allocation';
import { formatDate, parseNumber } from '@/utils/formatters';

export interface SaveAllocationItem {
  id: string;
  assetId?: string;
  name: string;
  amount: string;
  category: CategoryType;
}

interface SaveAllocationParams {
  allocationMonth: string;
  existingAllocations: Allocation[];
  items: SaveAllocationItem[];
}

interface BalanceUpdate {
  amount: number;
  id: string;
}

const resolveAssetId = async (item: SaveAllocationItem): Promise<string> => {
  if (item.assetId) {
    return item.assetId;
  }

  const config = CATEGORY_CONFIG[item.category];
  const newAsset = await assetRepository.createAsset({
    category: item.category,
    color: config.color,
    currentBalance: 0,
    iconName: config.icon,
    name: item.name,
  });

  return newAsset.id;
};

const normalizeAllocationMonth = (allocationMonth: string): string => {
  return `${allocationMonth}-01`;
};

const createBalanceUpdateMap = (updates: BalanceUpdate[]): Map<string, number> => {
  return updates.reduce((map, update) => {
    const currentAmount = map.get(update.id) ?? 0;
    map.set(update.id, currentAmount + update.amount);

    return map;
  }, new Map<string, number>());
};

const toBalanceUpdates = (updates: Map<string, number>): BalanceUpdate[] => {
  return Array.from(updates.entries())
    .filter(([, amount]) => amount !== 0)
    .map(([id, amount]) => ({
      amount,
      id,
    }));
};

export const saveAllocations = async ({
  allocationMonth,
  existingAllocations,
  items,
}: SaveAllocationParams) => {
  const normalizedAllocationMonth = normalizeAllocationMonth(allocationMonth);
  const validItems = items.filter((item) => parseNumber(item.amount) > 0);
  const existingAllocationMap = new Map(existingAllocations.map((allocation) => [allocation.id, allocation]));
  const nextBalanceUpdates: BalanceUpdate[] = [];
  const processedAllocationIds = new Set<string>();

  for (const item of validItems) {
    const assetId = await resolveAssetId(item);
    const inputAmount = parseNumber(item.amount);
    const existingAllocation = existingAllocationMap.get(item.id);

    if (existingAllocation) {
      processedAllocationIds.add(existingAllocation.id);

      const didAssetChange = existingAllocation.assetId !== assetId;
      const amountDiff = inputAmount - existingAllocation.inputAmount;

      if (didAssetChange) {
        nextBalanceUpdates.push({
          amount: -existingAllocation.inputAmount,
          id: existingAllocation.assetId,
        });
        nextBalanceUpdates.push({
          amount: inputAmount,
          id: assetId,
        });
      } else if (amountDiff !== 0) {
        nextBalanceUpdates.push({
          amount: amountDiff,
          id: assetId,
        });
      }

      const shouldUpdateAllocation = didAssetChange
        || existingAllocation.inputAmount !== inputAmount
        || existingAllocation.allocationMonth !== normalizedAllocationMonth;

      if (shouldUpdateAllocation) {
        await allocationRepository.updateAllocation(existingAllocation.id, {
          allocationMonth: normalizedAllocationMonth,
          assetId,
          inputAmount,
        });
      }

      continue;
    }

    await allocationRepository.createAllocation({
      allocationMonth: normalizedAllocationMonth,
      assetId,
      inputAmount,
    });

    nextBalanceUpdates.push({
      amount: inputAmount,
      id: assetId,
    });
  }

  const removedAllocations = existingAllocations.filter((allocation) => !processedAllocationIds.has(allocation.id));

  await Promise.all(
    removedAllocations.map(async (allocation) => {
      await allocationRepository.deleteAllocation(allocation.id);
      nextBalanceUpdates.push({
        amount: -allocation.inputAmount,
        id: allocation.assetId,
      });
    }),
  );

  const balanceUpdateMap = createBalanceUpdateMap(nextBalanceUpdates);
  const balanceUpdates = toBalanceUpdates(balanceUpdateMap);

  if (balanceUpdates.length === 0) {
    return;
  }

  await assetRepository.bulkUpdateBalance(balanceUpdates);
};

export const getAllocationMonthValue = (date: Date): string => {
  return formatDate(date, 'yyyy-MM');
};
