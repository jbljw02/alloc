export interface Allocation {
  id: string;
  userId: string | null;
  assetId: string;
  inputAmount: number;
  allocationMonth: string;
  createdAt: string | null;
  updatedAt: string | null;
}
