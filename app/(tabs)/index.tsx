import { PortfolioList } from '@/components/dashboard/PortfolioList';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { TotalAssetsChart } from '@/components/dashboard/TotalAssetsChart';
import { useAssets } from '@/hooks/useAssets';
import { useDashboardSnapshotSummary } from '@/hooks/useDashboardSnapshotSummary';
import React from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '@/constants/colors';

export default function HomeScreen() {
  const { data: assets = [] } = useAssets();
  const { cashTotal, error, investTotal, isLoading, lastMonthDiff, refetch, totalAssets } = useDashboardSnapshotSummary();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-500 mb-4">데이터를 불러오는데 실패했습니다.</Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="px-6 py-3 rounded-lg"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Text className="text-white font-semibold">다시 시도</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <TotalAssetsChart
          totalAssets={totalAssets}
          lastMonthDiff={lastMonthDiff}
          investTotal={investTotal}
          cashTotal={cashTotal}
        />
        <SummaryCards investTotal={investTotal} cashTotal={cashTotal} />
        <PortfolioList assets={assets} />
        <View className="h-[60px]" />
      </ScrollView>
    </SafeAreaView>
  );
}
