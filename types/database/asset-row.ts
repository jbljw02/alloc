import { CategoryType } from '@/constants/categories';
import { Ionicons } from '@expo/vector-icons';

export interface AssetRow {
  id: string;
  user_id: string | null;
  name: string;
  category: CategoryType;
  current_balance: number | null;
  icon_name: keyof typeof Ionicons.glyphMap | null;
  color: string | null;
  created_at: string | null;
  updated_at: string | null;
}
