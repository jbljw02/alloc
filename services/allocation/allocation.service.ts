import { allocationRepository } from '@/repositories/allocation.repository';
import { assetRepository } from '@/repositories/asset.repository';
import { AllocationItem } from '@/components/allocation/AllocationList';
import { CATEGORY_CONFIG } from '@/constants/mock-categories';
import { formatDate, parseNumber } from '@/utils/formatters';
import { isEmptyArray } from '@/utils/validators';

const resolveAssetId = async (item: AllocationItem): Promise<string> => {
  if (item.assetId) {
    return item.assetId;
  }

  const config = CATEGORY_CONFIG[item.category];
  const newAsset = await assetRepository.createAsset({
    name: item.name,
    category: item.category,
    currentBalance: 0,
    iconName: config?.icon ?? null,
    color: config?.color ?? null,
  });

  return newAsset.id;
};

export const saveAllocations = async (items: AllocationItem[]) => {
  const currentMonth = formatDate(new Date(), 'yyyy-MM');

  const validItems = items.filter((item) => {
    const amount = parseNumber(item.amount);
    return amount > 0;
  });

  if (isEmptyArray(validItems)) {
    return;
  }

  const allocationPayloads = await Promise.all(
    validItems.map(async (item) => {
      const assetId = await resolveAssetId(item);
      const amount = parseNumber(item.amount);

      return {
        assetId,
        inputAmount: amount,
        allocationMonth: currentMonth,
      };
    })
  );

  // 2. 확보된 데이터를 한 번의 쿼리로 Bulk Insert 합니다.
  await allocationRepository.bulkCreateAllocation(allocationPayloads);
};
