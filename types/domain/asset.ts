import { CategoryType } from '@/constants/categories';

export interface Asset {
  id: string;
  userId: string | null;
  name: string;
  category: CategoryType;
  currentBalance: number | null;
  iconName: string | null;
  color: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
