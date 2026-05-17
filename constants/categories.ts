import { COLORS } from '@/constants/colors';

export const CATEGORY_TYPES = {
  INVEST: 'INVEST',
  CASH: 'CASH',
  SPEND: 'SPEND',
} as const;

export type CategoryType = typeof CATEGORY_TYPES[keyof typeof CATEGORY_TYPES];

export const CATEGORY_CONFIG = {
  [CATEGORY_TYPES.INVEST]: { label: '투자', color: COLORS.primary, icon: 'trending-up', bgClass: 'bg-primary-light', textClass: 'text-primary' },
  [CATEGORY_TYPES.CASH]: { label: '현금', color: COLORS.emerald, icon: 'shield-checkmark', bgClass: 'bg-emerald-light', textClass: 'text-emerald' },
  [CATEGORY_TYPES.SPEND]: { label: '소비', color: COLORS.warning, icon: 'cart', bgClass: 'bg-warning-light', textClass: 'text-warning-dark' },
} as const;
