import { PortfolioList } from '@/components/dashboard/PortfolioList';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { TotalAssetsChart } from '@/components/dashboard/TotalAssetsChart';
import { useAssets } from '@/hooks/useAssets';
import { useUpdateTotalAssets } from '@/hooks/useUpdateTotalAssets';
import { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { CATEGORY_TYPES } from '@/constants/categories';
import { formatNumber, parseNumber } from '@/utils/formatters';
import { isEmptyString } from '@/utils/validators';

export default function HomeScreen() {
  const [isEditingTotalAssets, setIsEditingTotalAssets] = useState(false);
  const [totalAssetsInput, setTotalAssetsInput] = useState('');
  const { data: assets = [], isLoading, error, refetch } = useAssets();
  const { mutate: updateTotalAssets, isPending: isUpdateTotalAssetsPending } = useUpdateTotalAssets();

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

  const handleStartEditingTotalAssets = () => {
    setTotalAssetsInput(formatNumber(totalAssets));
    setIsEditingTotalAssets(true);
  };

  const handleCancelEditingTotalAssets = () => {
    setTotalAssetsInput('');
    setIsEditingTotalAssets(false);
  };

  const handleSubmitTotalAssets = () => {
    if (isEmptyString(totalAssetsInput)) {
      Alert.alert('안내', '총자산 값을 입력해주세요.');

      return;
    }

    const targetTotalAssets = parseNumber(totalAssetsInput);

    updateTotalAssets({
      assets,
      targetTotalAssets,
    }, {
      onSuccess: () => {
        handleCancelEditingTotalAssets();
      },
      onError: () => {
        Alert.alert('오류', '총자산 수정에 실패했습니다. 다시 시도해주세요.');
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <TotalAssetsChart
          totalAssets={totalAssets}
          investTotal={investTotal}
          cashTotal={cashTotal}
          inputValue={totalAssetsInput}
          isEditing={isEditingTotalAssets}
          isPending={isUpdateTotalAssetsPending}
          onCancel={handleCancelEditingTotalAssets}
          onEditAmountChange={setTotalAssetsInput}
          onStartEditing={handleStartEditingTotalAssets}
          onSubmit={handleSubmitTotalAssets}
        />
        <SummaryCards investTotal={investTotal} cashTotal={cashTotal} />
        <PortfolioList assets={assets} />
        <View className="h-[60px]" />
      </ScrollView>
    </SafeAreaView>
  );
}
