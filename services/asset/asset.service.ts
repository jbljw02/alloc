import { CATEGORY_TYPES } from '@/constants/categories';
import { assetRepository } from '@/repositories/asset.repository';
import { Asset } from '@/types/domain/asset';

const TOTAL_ASSET_ADJUSTMENT_NAME = '총자산 조정';

const getCurrentTotalAssets = (assets: Asset[]): number => {
  return assets.reduce((sum, asset) => {
    return sum + (asset.currentBalance ?? 0);
  }, 0);
};

const getAdjustmentAsset = (assets: Asset[]): Asset | undefined => {
  return assets.find((asset) => {
    return asset.category === CATEGORY_TYPES.CASH && asset.name === TOTAL_ASSET_ADJUSTMENT_NAME;
  });
};

export const updateTotalAssets = async ({
  assets,
  targetTotalAssets,
}: {
  assets: Asset[];
  targetTotalAssets: number;
}): Promise<void> => {
  const currentTotalAssets = getCurrentTotalAssets(assets);
  const diffAmount = targetTotalAssets - currentTotalAssets;

  if (diffAmount === 0) {
    return;
  }

  const adjustmentAsset = getAdjustmentAsset(assets);

  if (adjustmentAsset) {
    await assetRepository.updateAsset(adjustmentAsset.id, {
      currentBalance: (adjustmentAsset.currentBalance ?? 0) + diffAmount,
    });

    return;
  }

  await assetRepository.createAsset({
    category: CATEGORY_TYPES.CASH,
    color: null,
    currentBalance: diffAmount,
    iconName: 'wallet',
    name: TOTAL_ASSET_ADJUSTMENT_NAME,
  });
};

