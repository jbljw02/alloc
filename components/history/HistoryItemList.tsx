import { CATEGORY_CONFIG, CATEGORY_TYPES, CategoryType } from '@/constants/categories';
import { AllocationHistoryEditorItem, AllocationHistoryFilter, AllocationHistoryItem } from '@/hooks/history/allocationHistory';
import { formatAmount } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '@/constants/colors';

const HEX_OPACITY_8_PERCENT = '15';
type HistoryListItem = AllocationHistoryItem | AllocationHistoryEditorItem;

interface HistoryItemListProps {
  isEditing?: boolean;
  items: HistoryListItem[];
  onAddPress?: () => void;
  onAmountChange?: (text: string, id: string) => void;
  onRemove?: (id: string) => void;
  selectedFilter: AllocationHistoryFilter;
  selectedMonthLabel: string;
}

const getEmptyMessage = (selectedFilter: AllocationHistoryFilter, selectedMonthLabel: string): string => {
  if (selectedFilter === 'ALL') {
    return `${selectedMonthLabel} 배분을 저장하면 여기에 표시됩니다.`;
  }

  return `${selectedMonthLabel} ${CATEGORY_CONFIG[selectedFilter].label} 배분 내역이 없습니다.`;
};

const getCategoryBadgeClassName = (category: CategoryType): string => {
  if (category === CATEGORY_TYPES.INVEST) {
    return 'bg-primary-light';
  }

  if (category === CATEGORY_TYPES.CASH) {
    return 'bg-emerald-light';
  }

  return 'bg-warning-light';
};

const getItemColor = (item: HistoryListItem): string => {
  return item.assetColor ?? CATEGORY_CONFIG[item.category].color;
};

const getItemIconName = (item: HistoryListItem): keyof typeof Ionicons.glyphMap => {
  return item.assetIconName ?? CATEGORY_CONFIG[item.category].icon;
};

const getAmountLabel = (amount: string | number): string => {
  if (typeof amount === 'number') {
    return `${formatAmount(amount)}원`;
  }

  return amount === '' ? '' : `${amount}원`;
};

export const HistoryItemList = ({
  isEditing = false,
  items,
  onAddPress,
  onAmountChange,
  onRemove,
  selectedFilter,
  selectedMonthLabel,
}: HistoryItemListProps) => {
  if (items.length === 0) {
    return (
      <View className="bg-white rounded-2xl p-6 items-center">
        <Text className="text-base font-semibold text-gray-800 mb-1">
          {isEditing ? '편집 중인 배분 항목이 없습니다.' : '아직 배분 내역이 없습니다.'}
        </Text>
        <Text className="text-sm text-gray-500">
          {isEditing ? '자산을 추가해서 이 달의 배분 초안을 만들어보세요.' : getEmptyMessage(selectedFilter, selectedMonthLabel)}
        </Text>
        {isEditing && onAddPress ? (
          <TouchableOpacity
            className="flex-row items-center justify-center px-4 py-3 mt-4 border border-dashed border-gray-200 rounded-xl"
            onPress={onAddPress}
          >
            <Ionicons name="add" size={18} color={COLORS.secondary} />
            <Text className="ml-1.5 text-gray-600 font-semibold">자산 추가하기</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <View className="mb-2">
      {items.map((item) => {
        const categoryConfig = CATEGORY_CONFIG[item.category];
        const itemColor = getItemColor(item);
        const itemIconName = getItemIconName(item);

        return (
          <View
            key={item.id}
            className="flex-row justify-between items-center p-4 bg-white rounded-2xl mb-3"
            style={{ shadowColor: '#000', shadowOpacity: 0.02, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
          >
            <View className="flex-row items-center flex-1 mr-4">
              {isEditing && onRemove ? (
                <TouchableOpacity onPress={() => onRemove(item.id)} className="mr-3">
                  <Ionicons name="remove-circle" size={22} color={COLORS.failure} />
                </TouchableOpacity>
              ) : null}
              <View
                className="w-11 h-11 rounded-[14px] items-center justify-center mr-3.5"
                style={{ backgroundColor: itemColor + HEX_OPACITY_8_PERCENT }}
              >
                <Ionicons name={itemIconName} size={20} color={itemColor} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-[15px] font-semibold text-gray-800 mr-2">{item.name}</Text>
                  <View className={`px-1.5 py-0.5 rounded-md ${getCategoryBadgeClassName(item.category)}`}>
                    <Text className={`text-[10px] font-bold ${categoryConfig.textClass}`}>{categoryConfig.label}</Text>
                  </View>
                </View>
                <Text className="text-xs text-gray-400">{selectedMonthLabel} 배분액</Text>
              </View>
            </View>
            {isEditing && onAmountChange ? (
              <TextInput
                className="text-base font-bold text-gray-900 min-w-[88px] text-right p-0"
                keyboardType="numeric"
                placeholder="0"
                value={typeof item.amount === 'string' ? item.amount : ''}
                onChangeText={(text) => onAmountChange(text, item.id)}
              />
            ) : (
              <Text className="text-base font-bold text-gray-900">{getAmountLabel(item.amount)}</Text>
            )}
          </View>
        );
      })}
      {isEditing && onAddPress ? (
        <TouchableOpacity
          className="flex-row items-center justify-center p-4 mt-1 mb-3 border border-dashed border-gray-200 rounded-xl bg-white"
          onPress={onAddPress}
        >
          <Ionicons name="add" size={20} color={COLORS.secondary} />
          <Text className="ml-1.5 text-gray-600 font-semibold">자산 추가하기</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};
