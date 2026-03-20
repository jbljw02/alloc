import { Asset } from '@/types/domain/asset';
import { parseNumber } from '@/utils/formatters';
import { AppError, ERROR_CODES } from '@/utils/errors';
import { isEmptyString } from '@/utils/validators';

export interface UpdateAssetBalanceItem {
  currentBalance: number | null;
  id: string;
}

interface BuildAssetBalanceUpdatesParams {
  assets: Asset[];
  editingAmounts: Record<string, string>;
}

export const buildAssetBalanceUpdates = ({
  assets,
  editingAmounts,
}: BuildAssetBalanceUpdatesParams): UpdateAssetBalanceItem[] => {
  return assets.reduce<UpdateAssetBalanceItem[]>((nextItems, asset) => {
    const editingValue = editingAmounts[asset.id] ?? '';
    const parsedBalance = parseNumber(editingValue);

    if (parsedBalance === null) {
      throw new AppError('유효하지 않은 자산 금액이 있습니다.', ERROR_CODES.VALIDATION_ERROR);
    }

    const nextBalance = isEmptyString(editingValue) ? null : parsedBalance;

    if (asset.currentBalance === nextBalance) {
      return nextItems;
    }

    return [
      ...nextItems,
      {
        currentBalance: nextBalance,
        id: asset.id,
      },
    ];
  }, []);
};
