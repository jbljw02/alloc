import { AssetRow } from '@/types/database/asset-row';
import { Asset } from '@/types/domain/asset';
import { isNotNil } from '@/utils/validators';

export const toAssetDTO = (row: AssetRow): Asset => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  category: row.category,
  currentBalance: row.current_balance,
  iconName: row.icon_name,
  color: row.color,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const toAssetRow = (dto: Partial<Asset>): Partial<AssetRow> => {
  const row: Partial<AssetRow> = {};
  if (isNotNil(dto.id)) {
    row.id = dto.id;
  }
  if (isNotNil(dto.name)) {
    row.name = dto.name;
  }
  if (isNotNil(dto.category)) {
    row.category = dto.category;
  }
  if (isNotNil(dto.currentBalance)) {
    row.current_balance = dto.currentBalance;
  }
  if (isNotNil(dto.iconName)) {
    row.icon_name = dto.iconName;
  }
  if (isNotNil(dto.color)) {
    row.color = dto.color;
  }

  return row;
};
