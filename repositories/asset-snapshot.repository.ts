import { supabase } from '@/lib/supabase';
import { toAssetSnapshotDTO, toAssetSnapshotRow } from '@/services/mapper/assetSnapshotMapper';
import { AssetSnapshot } from '@/types/domain/asset-snapshot';
import { AppError, ERROR_CODES } from '@/utils/errors';
import { isNil } from '@/utils/validators';

export const assetSnapshotRepository = {
  async getSnapshotsByMonth(snapshotMonth: string): Promise<AssetSnapshot[]> {
    const { data, error } = await supabase
      .from('asset_snapshots')
      .select('*')
      .eq('snapshot_month', snapshotMonth)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError(`자산 스냅샷을 가져오는데 실패했습니다: ${error.message}`, ERROR_CODES.NETWORK_ERROR, error);
    }

    if (isNil(data)) {
      return [];
    }

    return data.map(toAssetSnapshotDTO);
  },

  async getSnapshotsByMonths(snapshotMonths: string[]): Promise<AssetSnapshot[]> {
    if (snapshotMonths.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('asset_snapshots')
      .select('*')
      .in('snapshot_month', snapshotMonths)
      .order('snapshot_month', { ascending: false });

    if (error) {
      throw new AppError(`자산 스냅샷 목록을 가져오는데 실패했습니다: ${error.message}`, ERROR_CODES.NETWORK_ERROR, error);
    }

    if (isNil(data)) {
      return [];
    }

    return data.map(toAssetSnapshotDTO);
  },

  async upsertSnapshots(snapshots: Partial<AssetSnapshot>[]): Promise<AssetSnapshot[]> {
    if (snapshots.length === 0) {
      return [];
    }

    const rows = snapshots.map(toAssetSnapshotRow);
    const { data, error } = await supabase
      .from('asset_snapshots')
      .upsert(rows, {
        onConflict: 'asset_id,snapshot_month',
      })
      .select();

    if (error) {
      throw new AppError(`자산 스냅샷 저장에 실패했습니다: ${error.message}`, ERROR_CODES.VALIDATION_ERROR, error);
    }

    if (isNil(data)) {
      throw new AppError('자산 스냅샷 저장 후 데이터를 가져오지 못했습니다.', ERROR_CODES.UNKNOWN_ERROR);
    }

    return data.map(toAssetSnapshotDTO);
  },
};
