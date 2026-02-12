import React from 'react';
import { ScrollView, SafeAreaView, StatusBar, View } from 'react-native';
import { DASHBOARD_DATA } from '@/constants/mock-dashboard';
import { TotalAssetsChart } from '@/components/dashboard/TotalAssetsChart';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { PortfolioList } from '@/components/dashboard/PortfolioList';

export default function HomeScreen() {
  const { totalAssets, lastMonthDiff, summary, assets } = DASHBOARD_DATA;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <TotalAssetsChart totalAssets={totalAssets} lastMonthDiff={lastMonthDiff} />
        <SummaryCards investTotal={summary.investTotal} cashTotal={summary.cashTotal} />
        <PortfolioList assets={assets} />
        <View className="h-[60px]" />
      </ScrollView>
    </SafeAreaView>
  );
}
