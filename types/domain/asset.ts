import { CategoryType } from '@/constants/categories';
import { Ionicons } from '@expo/vector-icons';

export interface Asset {
  id: string;
  userId: string | null;
  name: string;
  category: CategoryType;
  currentBalance: number | null;
  iconName: keyof typeof Ionicons.glyphMap | null;
  color: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
