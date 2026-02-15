import { PortfolioList } from '@/components/dashboard/PortfolioList';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { TotalAssetsChart } from '@/components/dashboard/TotalAssetsChart';
import { DASHBOARD_DATA } from '@/constants/mock-dashboard';
import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, View } from 'react-native';

export default function HomeScreen() {
  const { totalAssets, lastMonthDiff, summary, assets } = DASHBOARD_DATA;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <TotalAssetsChart
          totalAssets={totalAssets}
          lastMonthDiff={lastMonthDiff}
          investTotal={summary.investTotal}
          cashTotal={summary.cashTotal}
        />
        <SummaryCards investTotal={summary.investTotal} cashTotal={summary.cashTotal} />
        <PortfolioList assets={assets} />
        <View className="h-[60px]" />
      </ScrollView>
    </SafeAreaView>
  );
}
