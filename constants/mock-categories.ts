import { COLORS } from '@/constants/colors';

export type CategoryType = 'INVEST' | 'CASH' | 'SPEND';

export const CATEGORY_CONFIG = {
  INVEST: { label: '투자', color: COLORS.primary, icon: 'trending-up' as const, bgClass: 'bg-primary-light', textClass: 'text-primary' },
  CASH: { label: '현금', color: COLORS.emerald, icon: 'shield-checkmark' as const, bgClass: 'bg-emerald-light', textClass: 'text-emerald' },
  SPEND: { label: '소비', color: COLORS.warning, icon: 'cart' as const, bgClass: 'bg-warning-light', textClass: 'text-warning' },
};

export const MY_ASSETS_DB = [
  { id: 'a1', name: '미국채 10년물', category: 'INVEST' },
  { id: 'a2', name: '비트코인', category: 'INVEST' },
  { id: 'a3', name: 'S&P 500', category: 'INVEST' },
  { id: 'a4', name: '파킹통장', category: 'CASH' },
];
