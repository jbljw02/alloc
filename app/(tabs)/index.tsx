import { PortfolioList } from '@/components/dashboard/PortfolioList';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { TotalAssetsChart } from '@/components/dashboard/TotalAssetsChart';
import { useAssets } from '@/hooks/useAssets';
import { supabase } from '@/lib/supabase';
import React from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { CATEGORY_TYPES } from '@/constants/categories';

export default function HomeScreen() {
  const { data: assets = [], isLoading, error, refetch } = useAssets();

  const handleSignOut = async () => {
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError != null) {
      Alert.alert('오류', '로그아웃에 실패했습니다.');
    }
  };

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

  const totalAssets = assets.reduce((sum, a) => sum + (a.currentBalance ?? 0), 0);
  const investTotal = assets.
    filter(a => a.category === CATEGORY_TYPES.INVEST)
    .reduce((sum, a) => sum + (a.currentBalance ?? 0), 0);
  const cashTotal = assets.
    filter(a => a.category === CATEGORY_TYPES.CASH)
    .reduce((sum, a) => sum + (a.currentBalance ?? 0), 0);
  const lastMonthDiff = 0; // TODO: 전월 대비 자산 증감액 로직 구현 필요

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-end mb-4">
          <TouchableOpacity
            onPress={handleSignOut}
            className="px-4 py-2 rounded-full bg-white"
            style={{ shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
          >
            <Text className="text-sm font-semibold" style={{ color: COLORS.secondaryDark }}>로그아웃</Text>
          </TouchableOpacity>
        </View>
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
