export interface AssetSnapshot {
  id: string;
  userId: string;
  assetId: string;
  snapshotMonth: string;
  balance: number;
  createdAt: string | null;
  updatedAt: string | null;
}
