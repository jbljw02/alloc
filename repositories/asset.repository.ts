import { supabase } from '@/lib/supabase';
import { toAssetDTO, toAssetRow } from '@/services/mapper/assetMapper';
import { Asset } from '@/types/domain/asset';
import { isNil } from '@/utils/validators';
import { AppError, ERROR_CODES } from '@/utils/errors';

export const assetRepository = {
  async getAssets(): Promise<Asset[]> {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError(`자산 목록을 가져오는데 실패했습니다: ${error.message}`, ERROR_CODES.NETWORK_ERROR, error);
    }

    if (isNil(data)) {
      return [];
    }

    return data.map(toAssetDTO);
  },

  async getAssetById(id: string): Promise<Asset | null> {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === ERROR_CODES.SINGLE_ROW_EXPECTED) {
        return null;
      }
      throw new AppError(`자산 정보를 가져오는데 실패했습니다: ${error.message}`, ERROR_CODES.NETWORK_ERROR, error);
    }

    if (isNil(data)) {
      return null;
    }

    return toAssetDTO(data);
  },

  async createAsset(asset: Partial<Asset>): Promise<Asset> {
    const row = toAssetRow(asset);
    const { data, error } = await supabase
      .from('assets')
      .insert([row])
      .select()
      .single();

    if (error) {
      throw new AppError(`자산 생성에 실패했습니다: ${error.message}`, ERROR_CODES.VALIDATION_ERROR, error);
    }

    if (isNil(data)) {
      throw new AppError('자산 생성 후 데이터를 가져오지 못했습니다.', ERROR_CODES.UNKNOWN_ERROR);
    }

    return toAssetDTO(data);
  },

  async updateAsset(id: string, asset: Partial<Asset>): Promise<Asset> {
    const row = toAssetRow(asset);
    const { data, error } = await supabase
      .from('assets')
      .update(row)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError(`자산 업데이트에 실패했습니다: ${error.message}`, ERROR_CODES.VALIDATION_ERROR, error);
    }

    if (isNil(data)) {
      throw new AppError('자산 업데이트 후 데이터를 가져오지 못했습니다.', ERROR_CODES.UNKNOWN_ERROR);
    }

    return toAssetDTO(data);
  },

  async bulkUpdateAssets(updates: Array<{ id: string; currentBalance: number | null }>): Promise<Asset[]> {
    if (updates.length === 0) {
      return [];
    }

    const { data, error } = await supabase.rpc('bulk_update_assets', {
      updates: updates.map((update) => {
        return {
          id: update.id,
          current_balance: update.currentBalance,
        };
      }),
    });

    if (error) {
      throw new AppError(`자산 일괄 업데이트에 실패했습니다: ${error.message}`, ERROR_CODES.VALIDATION_ERROR, error);
    }

    if (isNil(data)) {
      throw new AppError('자산 일괄 업데이트 후 데이터를 가져오지 못했습니다.', ERROR_CODES.UNKNOWN_ERROR);
    }

    return data.map(toAssetDTO);
  },

  async bulkUpdateBalance(updates: { id: string; amount: number }[]): Promise<void> {
    if (updates.length === 0) {
      return;
    }

    const { error } = await supabase.rpc('bulk_update_asset_balances', {
      updates
    });

    if (error) {
      throw new AppError(`자산 잔액 일괄 업데이트에 실패했습니다.`, ERROR_CODES.NETWORK_ERROR, error);
    }
  },

  async deleteAsset(id: string): Promise<void> {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);

    if (error) {
      throw new AppError(`자산 삭제에 실패했습니다: ${error.message}`, ERROR_CODES.NETWORK_ERROR, error);
    }
  }
};
