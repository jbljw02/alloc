import { CATEGORY_CONFIG } from '@/constants/categories';
import { CategoryType } from '@/constants/categories';
import { allocationRepository } from '@/repositories/allocation.repository';
import { assetRepository } from '@/repositories/asset.repository';
import { Allocation } from '@/types/domain/allocation';
import { formatDate, parseNumber } from '@/utils/formatters';
import { AppError, ERROR_CODES } from '@/utils/errors';

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

interface ParsedSaveAllocationItem extends SaveAllocationItem {
  inputAmount: number;
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

const parseValidItems = (items: SaveAllocationItem[]): ParsedSaveAllocationItem[] => {
  return items.reduce<ParsedSaveAllocationItem[]>((validItems, item) => {
    const inputAmount = parseNumber(item.amount);

    if (inputAmount === null) {
      throw new AppError('유효하지 않은 배분 금액이 있습니다.', ERROR_CODES.VALIDATION_ERROR);
    }

    if (inputAmount <= 0) {
      return validItems;
    }

    return [
      ...validItems,
      {
        ...item,
        inputAmount,
      },
    ];
  }, []);
};

const getBalanceUpdatesForExistingAllocation = ({
  assetId,
  existingAllocation,
  inputAmount,
}: {
  assetId: string;
  existingAllocation: Allocation;
  inputAmount: number;
}): BalanceUpdate[] => {
  const didAssetChange = existingAllocation.assetId !== assetId;

  if (didAssetChange) {
    return [
      {
        amount: -existingAllocation.inputAmount,
        id: existingAllocation.assetId,
      },
      {
        amount: inputAmount,
        id: assetId,
      },
    ];
  }

  const amountDiff = inputAmount - existingAllocation.inputAmount;
  if (amountDiff === 0) {
    return [];
  }

  return [
    {
      amount: amountDiff,
      id: assetId,
    },
  ];
};

const shouldUpdateExistingAllocation = ({
  assetId,
  existingAllocation,
  inputAmount,
  normalizedAllocationMonth,
}: {
  assetId: string;
  existingAllocation: Allocation;
  inputAmount: number;
  normalizedAllocationMonth: string;
}): boolean => {
  return existingAllocation.assetId !== assetId
    || existingAllocation.inputAmount !== inputAmount
    || existingAllocation.allocationMonth !== normalizedAllocationMonth;
};

const updateExistingAllocation = async ({
  assetId,
  existingAllocation,
  inputAmount,
  normalizedAllocationMonth,
}: {
  assetId: string;
  existingAllocation: Allocation;
  inputAmount: number;
  normalizedAllocationMonth: string;
}) => {
  const shouldUpdateAllocation = shouldUpdateExistingAllocation({
    assetId,
    existingAllocation,
    inputAmount,
    normalizedAllocationMonth,
  });

  if (shouldUpdateAllocation === false) {
    return;
  }

  await allocationRepository.updateAllocation(existingAllocation.id, {
    allocationMonth: normalizedAllocationMonth,
    assetId,
    inputAmount,
  });
};

const createAllocation = async ({
  assetId,
  inputAmount,
  normalizedAllocationMonth,
}: {
  assetId: string;
  inputAmount: number;
  normalizedAllocationMonth: string;
}) => {
  await allocationRepository.createAllocation({
    allocationMonth: normalizedAllocationMonth,
    assetId,
    inputAmount,
  });
};

const deleteRemovedAllocations = async (removedAllocations: Allocation[]): Promise<BalanceUpdate[]> => {
  return Promise.all(
    removedAllocations.map(async (allocation) => {
      await allocationRepository.deleteAllocation(allocation.id);

      return {
        amount: -allocation.inputAmount,
        id: allocation.assetId,
      };
    }),
  );
};

export const saveAllocations = async ({
  allocationMonth,
  existingAllocations,
  items,
}: SaveAllocationParams) => {
  const normalizedAllocationMonth = normalizeAllocationMonth(allocationMonth);
  const validItems = parseValidItems(items);
  const existingAllocationMap = new Map(existingAllocations.map((allocation) => [allocation.id, allocation]));
  const nextBalanceUpdates: BalanceUpdate[] = [];
  const processedAllocationIds = new Set<string>();

  for (const item of validItems) {
    const assetId = await resolveAssetId(item);
    const { inputAmount } = item;
    const existingAllocation = existingAllocationMap.get(item.id);

    if (existingAllocation) {
      processedAllocationIds.add(existingAllocation.id);
      const existingAllocationBalanceUpdates = getBalanceUpdatesForExistingAllocation({
        assetId,
        existingAllocation,
        inputAmount,
      });
      nextBalanceUpdates.push(...existingAllocationBalanceUpdates);
      await updateExistingAllocation({
        assetId,
        existingAllocation,
        inputAmount,
        normalizedAllocationMonth,
      });

      continue;
    }

    await createAllocation({
      assetId,
      inputAmount,
      normalizedAllocationMonth,
    });

    nextBalanceUpdates.push({
      amount: inputAmount,
      id: assetId,
    });
  }

  const removedAllocations = existingAllocations.filter((allocation) => !processedAllocationIds.has(allocation.id));
  const removedAllocationBalanceUpdates = await deleteRemovedAllocations(removedAllocations);
  nextBalanceUpdates.push(...removedAllocationBalanceUpdates);

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
