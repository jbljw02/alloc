import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, ScrollView, 
  TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Modal, FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // 아이콘 사용

// 타입 정의
type CategoryType = 'INVEST' | 'CASH' | 'SPEND';

type AllocationItem = {
  id: string;
  name: string;
  category: CategoryType;
  amount: string;
};

// Mock Data
const MY_ASSETS_DB = [
  { id: 'a1', name: '미국채(3개월)', category: 'INVEST' },
  { id: 'a2', name: '비트코인', category: 'INVEST' },
  { id: 'a3', name: 'S&P 500', category: 'INVEST' },
  { id: 'a4', name: '파킹통장', category: 'CASH' },
  { id: 'a5', name: '생활비', category: 'SPEND' },
];

export default function AllocationScreen() {
  const [income, setIncome] = useState('');
  const [items, setItems] = useState<AllocationItem[]>([]); // 빈 리스트로 시작
  const [isModalVisible, setModalVisible] = useState(false); // 자산 선택 모달

  // 숫자 포맷팅 (10000 -> 10,000)
  const formatNumber = (num: string) => {
    const cleanNum = num.replace(/[^0-9]/g, '');
    return cleanNum ? parseInt(cleanNum).toLocaleString() : '';
  };

  // 잔액 계산
  const totalIncome = parseInt(income.replace(/,/g, '') || '0');
  const totalAllocated = items.reduce((sum, item) => sum + parseInt(item.amount.replace(/,/g, '') || '0'), 0);
  const remaining = totalIncome - totalAllocated;

  // 핸들러: 금액 수정
  const handleAmountChange = (text: string, id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, amount: formatNumber(text) } : item
    ));
  };

  // 핸들러: 항목 삭제
  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // 핸들러: 자산 추가 (선택 or 직접입력)
  const addAsset = (name: string, category: CategoryType) => {
    const newItem: AllocationItem = {
      id: Date.now().toString(), // 임시 ID
      name,
      category,
      amount: '',
    };
    setItems(prev => [...prev, newItem]);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* 1. 수입 입력 */}
          <View style={styles.incomeSection}>
            <Text style={styles.label}>이번 달 수입</Text>
            <View style={styles.incomeInputWrapper}>
              <Text style={styles.currency}>₩</Text>
              <TextInput 
                style={styles.incomeInput}
                placeholder="0"
                keyboardType="numeric"
                value={income}
                onChangeText={(t) => setIncome(formatNumber(t))}
                placeholderTextColor="#ccc"
              />
            </View>
          </View>

          {/* 2. 자산 배분 리스트 */}
          <View style={styles.listSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>자산 배분 (Allocation)</Text>
              <TouchableOpacity onPress={() => setItems([])}>
                <Text style={styles.resetText}>초기화</Text>
              </TouchableOpacity>
            </View>
            
            {items.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>아래 버튼을 눌러 자산을 추가하세요 👇</Text>
              </View>
            ) : (
              items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    {/* 삭제 버튼 */}
                    <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
                      <Ionicons name="remove-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                    
                    <View style={[styles.dot, 
                      item.category === 'INVEST' ? { backgroundColor: '#4F46E5' } :
                      item.category === 'CASH' ? { backgroundColor: '#10B981' } :
                      { backgroundColor: '#9CA3AF' }
                    ]} />
                    <Text style={styles.itemName}>{item.name}</Text>
                  </View>
                  
                  <TextInput 
                    style={styles.amountInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={item.amount}
                    onChangeText={(t) => handleAmountChange(t, item.id)}
                  />
                </View>
              ))
            )}

            {/* 자산 추가 버튼 */}
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Ionicons name="add" size={20} color="#4B5563" />
              <Text style={styles.addButtonText}>자산 추가하기</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* 3. 하단 상태바 */}
        <View style={styles.footer}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>남은 금액</Text>
            <Text style={[styles.statusValue, { color: remaining < 0 ? '#EF4444' : '#111827' }]}>
              {remaining.toLocaleString()} 원
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: remaining === 0 && totalIncome > 0 ? '#111827' : '#E5E7EB' }]}
            disabled={remaining !== 0 || totalIncome === 0}
          >
            <Text style={[styles.saveButtonText, { color: remaining === 0 && totalIncome > 0 ? '#fff' : '#9CA3AF' }]}>
              배분 완료하기
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. 자산 선택 모달 (Bottom Sheet 느낌) */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>추가할 자산을 선택하세요</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>내 자산 목록 (DB)</Text>
              <ScrollView style={{ maxHeight: 200 }}>
                {MY_ASSETS_DB.map((asset) => (
                  <TouchableOpacity 
                    key={asset.id} 
                    style={styles.modalItem}
                    onPress={() => addAsset(asset.name, asset.category as CategoryType)}
                  >
                    <Text style={styles.modalItemName}>{asset.name}</Text>
                    <Text style={styles.modalItemType}>{asset.category}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.divider} />

              <TouchableOpacity 
                style={styles.modalManualButton}
                onPress={() => addAsset('임의 추가 항목', 'SPEND')} // 나중엔 입력창 띄우기
              >
                <Ionicons name="create-outline" size={20} color="#4F46E5" />
                <Text style={styles.modalManualText}>+ 직접 입력해서 추가하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  
  // 수입 섹션
  incomeSection: { padding: 24, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  label: { fontSize: 14, color: '#6B7280', marginBottom: 8, fontWeight: '600' },
  incomeInputWrapper: { flexDirection: 'row', alignItems: 'center' },
  currency: { fontSize: 28, fontWeight: '700', color: '#111827', marginRight: 8 },
  incomeInput: { fontSize: 28, fontWeight: '700', color: '#111827', flex: 1 },

  // 리스트 섹션
  listSection: { padding: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  resetText: { fontSize: 13, color: '#EF4444' },
  emptyState: { alignItems: 'center', paddingVertical: 20 },
  emptyText: { color: '#9CA3AF' },

  // 리스트 아이템
  itemRow: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6'
  },
  itemInfo: { flexDirection: 'row', alignItems: 'center' },
  deleteBtn: { marginRight: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  itemName: { fontSize: 16, color: '#1F2937' },
  amountInput: { 
    fontSize: 18, fontWeight: '600', color: '#111827', 
    minWidth: 100, textAlign: 'right', padding: 0 
  },

  // 추가 버튼
  addButton: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    padding: 16, marginTop: 10, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, borderStyle: 'dashed' 
  },
  addButtonText: { marginLeft: 6, color: '#4B5563', fontWeight: '600' },

  // 하단 바
  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', padding: 20, paddingBottom: 40,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05, elevation: 10
  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statusLabel: { fontSize: 16, color: '#6B7280' },
  statusValue: { fontSize: 18, fontWeight: '700' },
  saveButton: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { fontSize: 16, fontWeight: '700' },

  // 모달 스타일
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 10, fontWeight: '600' },
  modalItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', flexDirection: 'row', justifyContent: 'space-between' },
  modalItemName: { fontSize: 16, color: '#374151' },
  modalItemType: { fontSize: 12, color: '#9CA3AF' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 },
  modalManualButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12 },
  modalManualText: { color: '#4F46E5', fontWeight: '600', marginLeft: 8 },
});