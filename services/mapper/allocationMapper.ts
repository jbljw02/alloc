import { AllocationRow } from '@/types/database/allocation-row';
import { Allocation } from '@/types/domain/allocation';
import { isNotNil } from '@/utils/validators';

export const toAllocationDTO = (row: AllocationRow): Allocation => ({
  id: row.id,
  userId: row.user_id,
  assetId: row.asset_id,
  inputAmount: row.input_amount,
  allocationMonth: row.allocation_month,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const toAllocationRow = (dto: Partial<Allocation>): Partial<AllocationRow> => {
  const row: Partial<AllocationRow> = {};
  if (isNotNil(dto.id)) {
    row.id = dto.id;
  }
  if (isNotNil(dto.assetId)) {
    row.asset_id = dto.assetId;
  }
  if (isNotNil(dto.inputAmount)) {
    row.input_amount = dto.inputAmount;
  }
  if (isNotNil(dto.allocationMonth)) {
    row.allocation_month = dto.allocationMonth;
  }

  return row;
};
