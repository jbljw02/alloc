export interface AssetSnapshotRow {
  id: string;
  user_id: string;
  asset_id: string;
  snapshot_month: string;
  balance: number;
  created_at: string | null;
  updated_at: string | null;
}
