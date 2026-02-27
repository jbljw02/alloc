import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView } from 'react-native';
import { AllocationFooter } from '../../components/allocation/AllocationFooter';
import { AllocationItem, AllocationList } from '../../components/allocation/AllocationList';
import { AssetSelectionModal } from '../../components/allocation/AssetSelectionModal';
import { IncomeInput } from '../../components/allocation/IncomeInput';
import { CategoryType } from '@/constants/categories';
import { formatNumber } from '@/utils/formatters';
import { useSaveAllocation } from '@/hooks/useSaveAllocation';
import { isEmptyArray } from '@/utils/validators';

export default function AllocationScreen() {
  const [income, setIncome] = useState('');
  const [items, setItems] = useState<AllocationItem[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);

  const { mutate: saveAllocation, isPending } = useSaveAllocation();

  const totalIncome = parseInt(income.replace(/,/g, '') ?? '0');
  const totalAllocated = items.reduce((sum, item) => sum + parseInt(item.amount.replace(/,/g, '') ?? '0'), 0);
  const remaining = totalIncome - totalAllocated;
  const progressPercent = totalIncome > 0 ? Math.min((totalAllocated / totalIncome) * 100, 100) : 0;

  const handleIncomeChange = (text: string) => {
    setIncome(formatNumber(text));
  };

  const handleAmountChange = (text: string, id: string) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, amount: formatNumber(text) } : item));
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetItems = () => {
    setItems([]);
  };

  const handleAddAsset = (assetId: string | undefined, name: string, category: CategoryType) => {
    const date = Date.now().toString();
    const newItem: AllocationItem = { id: date, assetId, name, category, amount: '' };
    setItems((prev) => [...prev, newItem]);
    setModalVisible(false);
  };

  const handleSave = () => {
    if (isEmptyArray(items)) {
      Alert.alert('알림', '배분할 자산을 추가해주세요.');
      return;
    }

    saveAllocation(items, {
      onSuccess: () => {
        Alert.alert('성공', '변경사항이 저장되었습니다.', [
          {
            text: '확인',
            onPress: () => {
              setItems([]);
              setIncome('');
            },
          },
        ]);
      },
      onError: () => {
        Alert.alert('오류', '저장에 실패했습니다. 다시 시도해주세요.');
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
          <IncomeInput value={income} onValueChange={handleIncomeChange} />

          <AllocationList
            items={items}
            onAmountChange={handleAmountChange}
            onRemove={handleRemoveItem}
            onReset={handleResetItems}
            onAddPress={() => setModalVisible(true)}
          />
        </ScrollView>

        <AllocationFooter
          remaining={remaining}
          progressPercent={progressPercent}
          totalIncome={totalIncome}
          isLoading={isPending}
          onSave={handleSave}
        />

        <AssetSelectionModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          onAddAsset={handleAddAsset}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
