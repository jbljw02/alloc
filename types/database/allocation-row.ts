export interface AllocationRow {
  id: string;
  user_id: string | null;
  asset_id: string;
  input_amount: number;
  allocation_month: string; // 'YYYY-MM-DD'
  created_at: string | null;
  updated_at: string | null;
}
