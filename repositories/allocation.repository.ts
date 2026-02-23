import { supabase } from '@/lib/supabase';
import { toAllocationDTO, toAllocationRow } from '@/services/mapper/allocationMapper';
import { Allocation } from '@/types/domain/allocation';
import { AppError, ERROR_CODES } from '@/utils/errors';
import { isNil } from '@/utils/validators';

export const allocationRepository = {
  async getAllocations(): Promise<Allocation[]> {
    const { data, error } = await supabase
      .from('allocations')
      .select('*')
      .order('allocation_month', { ascending: false });

    if (error) {
      throw new AppError(`자산 배분 내역을 가져오는데 실패했습니다: ${error.message}`, ERROR_CODES.NETWORK_ERROR, error);
    }

    if (isNil(data)) {
      return [];
    }

    return data.map(toAllocationDTO);
  },

  async getAllocationById(id: string): Promise<Allocation | null> {
    const { data, error } = await supabase
      .from('allocations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === ERROR_CODES.SINGLE_ROW_EXPECTED) {
        return null;
      }
      throw new AppError(`자산 배분 정보를 가져오는데 실패했습니다: ${error.message}`, ERROR_CODES.NETWORK_ERROR, error);
    }

    if (isNil(data)) {
      return null;
    }

    return toAllocationDTO(data);
  },

  async createAllocation(allocation: Partial<Allocation>): Promise<Allocation> {
    const row = toAllocationRow(allocation);
    const { data, error } = await supabase
      .from('allocations')
      .insert([row])
      .select()
      .single();

    if (error) {
      throw new AppError(`자산 배분에 실패했습니다: ${error.message}`, ERROR_CODES.VALIDATION_ERROR, error);
    }

    if (isNil(data)) {
      throw new AppError('자산 배분 후 데이터를 가져오지 못했습니다.', ERROR_CODES.UNKNOWN_ERROR);
    }

    return toAllocationDTO(data);
  },

  async updateAllocation(id: string, allocation: Partial<Allocation>): Promise<Allocation> {
    const row = toAllocationRow(allocation);
    const { data, error } = await supabase
      .from('allocations')
      .update(row)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError(`자산 배분에 실패했습니다: ${error.message}`, ERROR_CODES.VALIDATION_ERROR, error);
    }

    if (isNil(data)) {
      throw new AppError('자산 배분 후 데이터를 가져오지 못했습니다.', ERROR_CODES.UNKNOWN_ERROR);
    }

    return toAllocationDTO(data);
  },

  async deleteAllocation(id: string): Promise<void> {
    const { error } = await supabase
      .from('allocations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new AppError(`자산 배분 삭제에 실패했습니다: ${error.message}`, ERROR_CODES.NETWORK_ERROR, error);
    }
  }
};
