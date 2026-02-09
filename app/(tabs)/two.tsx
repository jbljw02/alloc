import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView } from 'react-native';
import { AllocationFooter } from '../../components/allocation/AllocationFooter';
import { AllocationItem, AllocationList } from '../../components/allocation/AllocationList';
import { AssetSelectionModal } from '../../components/allocation/AssetSelectionModal';
import { IncomeInput } from '../../components/allocation/IncomeInput';
import { CategoryType } from '@/constants/mock-categories';
import { formatNumber } from '@/utils/formatters';

export default function AllocationScreen() {
  const [income, setIncome] = useState('');
  const [items, setItems] = useState<AllocationItem[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);

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

  const handleAddAsset = (name: string, category: CategoryType) => {
    const newItem: AllocationItem = { id: Date.now().toString(), name, category, amount: '' };
    setItems((prev) => [...prev, newItem]);
    setModalVisible(false);
  };

  const handleSave = () => {
    // TODO: 배분 완료 로직
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
