import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './colors';

type CategoryType = 'INVEST' | 'CASH';

export type Asset = {
  id: string;
  name: string;
  category: CategoryType;
  amount: number;
  profit: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export const DASHBOARD_DATA = {
  totalAssets: 124500000,
  lastMonthDiff: 1500000,
  summary: {
    investTotal: 88000000,
    cashTotal: 24500000,
  },
  assets: [
    { id: '1', name: '미국채 10년물', category: 'INVEST' as const, amount: 50000000, profit: '+12%', color: COLORS.primary, icon: 'flag' as const },
    { id: '2', name: '비트코인', category: 'INVEST' as const, amount: 38000000, profit: '+15%', color: COLORS.warning, icon: 'logo-bitcoin' as const },
    { id: '3', name: '파킹통장 (토스)', category: 'CASH' as const, amount: 20000000, profit: '2.0%', color: COLORS.success, icon: 'wallet' as const },
    { id: '4', name: 'S&P 500', category: 'INVEST' as const, amount: 12000000, profit: '+8%', color: '#3B82F6', icon: 'bar-chart' as const },
    { id: '5', name: '엔화 (JPY)', category: 'CASH' as const, amount: 4500000, profit: '-2%', color: '#6366F1', icon: 'wallet' as const },
  ] as Asset[],
};