import { AssetSnapshotRow } from '@/types/database/asset-snapshot-row';
import { AssetSnapshot } from '@/types/domain/asset-snapshot';
import { isNotNil } from '@/utils/validators';

export const toAssetSnapshotDTO = (row: AssetSnapshotRow): AssetSnapshot => ({
  id: row.id,
  userId: row.user_id,
  assetId: row.asset_id,
  snapshotMonth: row.snapshot_month,
  balance: row.balance,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const toAssetSnapshotRow = (dto: Partial<AssetSnapshot>): Partial<AssetSnapshotRow> => {
  const row: Partial<AssetSnapshotRow> = {};

  if (isNotNil(dto.id)) {
    row.id = dto.id;
  }

  if (isNotNil(dto.userId)) {
    row.user_id = dto.userId;
  }

  if (isNotNil(dto.assetId)) {
    row.asset_id = dto.assetId;
  }

  if (isNotNil(dto.snapshotMonth)) {
    row.snapshot_month = dto.snapshotMonth;
  }

  if (isNotNil(dto.balance)) {
    row.balance = dto.balance;
  }

  return row;
};
