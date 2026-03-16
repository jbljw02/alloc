import { CATEGORY_TYPES } from '@/constants/categories';
import { Asset } from '@/types/domain/asset';
import { AssetSnapshot } from '@/types/domain/asset-snapshot';

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

const calculateDashboardSummary = ({
  assets,
  currentMonthSnapshots,
  previousMonthSnapshots,
}: {
  assets: Asset[];
  currentMonthSnapshots: AssetSnapshot[];
  previousMonthSnapshots: AssetSnapshot[];
}) => {
  const assetCategoryMap = new Map(assets.map((asset) => [asset.id, asset.category]));
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

  return {
    cashTotal,
    investTotal,
    lastMonthDiff: previousMonthSnapshots.length > 0
      ? totalAssets - previousMonthTotalAssets
      : 0,
    totalAssets,
  };
};

const createAssetFixture = (overrides: Partial<Asset>): Asset => {
  return {
    category: CATEGORY_TYPES.CASH,
    color: null,
    createdAt: null,
    currentBalance: 0,
    iconName: null,
    id: 'asset-1',
    name: '자산',
    updatedAt: null,
    userId: 'user-1',
    ...overrides,
  };
};

const createSnapshotFixture = (overrides: Partial<AssetSnapshot>): AssetSnapshot => {
  return {
    assetId: 'asset-1',
    balance: 0,
    createdAt: null,
    id: 'snapshot-1',
    snapshotMonth: '2026-03-01',
    updatedAt: null,
    userId: 'user-1',
    ...overrides,
  };
};

describe('calculateDashboardSummary', () => {
  it('현재 월 스냅샷이 있으면 스냅샷 기준으로 합계를 계산한다', () => {
    const assets = [
      createAssetFixture({
        category: CATEGORY_TYPES.INVEST,
        id: 'asset-invest',
      }),
      createAssetFixture({
        category: CATEGORY_TYPES.CASH,
        id: 'asset-cash',
      }),
    ];

    const summary = calculateDashboardSummary({
      assets,
      currentMonthSnapshots: [
        createSnapshotFixture({
          assetId: 'asset-invest',
          balance: 700,
          id: 'snapshot-invest',
        }),
        createSnapshotFixture({
          assetId: 'asset-cash',
          balance: 300,
          id: 'snapshot-cash',
        }),
      ],
      previousMonthSnapshots: [
        createSnapshotFixture({
          assetId: 'asset-invest',
          balance: 400,
          id: 'snapshot-prev-invest',
          snapshotMonth: '2026-02-01',
        }),
        createSnapshotFixture({
          assetId: 'asset-cash',
          balance: 200,
          id: 'snapshot-prev-cash',
          snapshotMonth: '2026-02-01',
        }),
      ],
    });

    expect(summary).toEqual({
      cashTotal: 300,
      investTotal: 700,
      lastMonthDiff: 400,
      totalAssets: 1000,
    });
  });

  it('현재 월 스냅샷이 없으면 현재 자산 잔액을 fallback으로 사용한다', () => {
    const summary = calculateDashboardSummary({
      assets: [
        createAssetFixture({
          category: CATEGORY_TYPES.INVEST,
          currentBalance: 900,
          id: 'asset-invest',
        }),
        createAssetFixture({
          category: CATEGORY_TYPES.CASH,
          currentBalance: 100,
          id: 'asset-cash',
        }),
      ],
      currentMonthSnapshots: [],
      previousMonthSnapshots: [],
    });

    expect(summary).toEqual({
      cashTotal: 100,
      investTotal: 900,
      lastMonthDiff: 0,
      totalAssets: 1000,
    });
  });
});
