import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { CategoryType } from '@/constants/mock-categories';

import { AssetListContent } from './AssetListContent';
import { CustomAssetInput } from './CustomAssetInput';

interface AssetSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onAddAsset: (name: string, category: CategoryType) => void;
}

export const AssetSelectionModal = ({ visible, onClose, onAddAsset }: AssetSelectionModalProps) => {
  const [isCustomInputMode, setCustomInputMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<CategoryType>('INVEST');

  const handleAddAsset = (name: string, category: CategoryType) => {
    onAddAsset(name, category);
    setCustomInputMode(false);
    setCustomName('');
  };

  const handleClose = () => {
    onClose();
    setCustomInputMode(false);
    setCustomName('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 pb-10 max-h-[80%]">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-lg font-bold text-gray-900">
              {isCustomInputMode ? '직접 입력하기' : '자산 선택'}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={COLORS.secondaryDark} />
            </TouchableOpacity>
          </View>

          {isCustomInputMode ? (
            <CustomAssetInput
              name={customName}
              onNameChange={setCustomName}
              category={customCategory}
              onCategoryChange={setCustomCategory}
              onAdd={() => handleAddAsset(customName, customCategory)}
              onBackToList={() => setCustomInputMode(false)}
            />
          ) : (
            <AssetListContent
              onSelectAsset={handleAddAsset}
              onOpenCustomInput={() => setCustomInputMode(true)}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};
