import { CATEGORY_TYPES } from '@/constants/categories';
import { useAssetSnapshots } from '@/hooks/useAssetSnapshots';
import { useAssets } from '@/hooks/useAssets';
import { AssetSnapshot } from '@/types/domain/asset-snapshot';
import { formatDate } from '@/utils/formatters';

const getSnapshotMonthValue = (date: Date): string => {
  return `${formatDate(date, 'yyyy-MM')}-01`;
};

const getCurrentAndPreviousSnapshotMonths = (baseDate: Date) => {
  const previousMonthDate = new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1);

  return {
    currentSnapshotMonth: getSnapshotMonthValue(baseDate),
    previousSnapshotMonth: getSnapshotMonthValue(previousMonthDate),
  };
};

const getTotalBalance = (snapshots: AssetSnapshot[]): number => {
  return snapshots.reduce((sum, snapshot) => {
    return sum + snapshot.balance;
  }, 0);
};

const getCategoryBalance = ({
  assetCategoryMap,
  category,
  snapshots,
}: {
  assetCategoryMap: Map<string, string>;
  category: string;
  snapshots: AssetSnapshot[];
}): number => {
  return snapshots.reduce((sum, snapshot) => {
    if (assetCategoryMap.get(snapshot.assetId) !== category) {
      return sum;
    }

    return sum + snapshot.balance;
  }, 0);
};

export const useDashboardSnapshotSummary = () => {
  const { data: assets = [], isLoading: isAssetsLoading, error: assetsError, refetch } = useAssets();
  const { currentSnapshotMonth, previousSnapshotMonth } = getCurrentAndPreviousSnapshotMonths(new Date());
  const {
    data: snapshots = [],
    isLoading: isSnapshotsLoading,
    error: snapshotsError,
  } = useAssetSnapshots([currentSnapshotMonth, previousSnapshotMonth]);

  const assetCategoryMap = new Map(assets.map((asset) => [asset.id, asset.category]));
  const currentMonthSnapshots = snapshots.filter((snapshot) => {
    return snapshot.snapshotMonth === currentSnapshotMonth;
  });
  const previousMonthSnapshots = snapshots.filter((snapshot) => {
    return snapshot.snapshotMonth === previousSnapshotMonth;
  });
  const hasCurrentMonthSnapshots = currentMonthSnapshots.length > 0;
  const totalAssets = hasCurrentMonthSnapshots
    ? getTotalBalance(currentMonthSnapshots)
    : assets.reduce((sum, asset) => {
      return sum + (asset.currentBalance ?? 0);
    }, 0);
  const investTotal = hasCurrentMonthSnapshots
    ? getCategoryBalance({
      assetCategoryMap,
      category: CATEGORY_TYPES.INVEST,
      snapshots: currentMonthSnapshots,
    })
    : assets.reduce((sum, asset) => {
      if (asset.category !== CATEGORY_TYPES.INVEST) {
        return sum;
      }

      return sum + (asset.currentBalance ?? 0);
    }, 0);
  const cashTotal = hasCurrentMonthSnapshots
    ? getCategoryBalance({
      assetCategoryMap,
      category: CATEGORY_TYPES.CASH,
      snapshots: currentMonthSnapshots,
    })
    : assets.reduce((sum, asset) => {
      if (asset.category !== CATEGORY_TYPES.CASH) {
        return sum;
      }

      return sum + (asset.currentBalance ?? 0);
    }, 0);
  const previousMonthTotalAssets = getTotalBalance(previousMonthSnapshots);
  const lastMonthDiff = previousMonthSnapshots.length > 0
    ? totalAssets - previousMonthTotalAssets
    : 0;

  return {
    cashTotal,
    error: assetsError ?? snapshotsError,
    investTotal,
    isLoading: isAssetsLoading || isSnapshotsLoading,
    lastMonthDiff,
    refetch,
    totalAssets,
  };
};
