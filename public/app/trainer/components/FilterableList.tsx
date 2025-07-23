import React, { useState, useCallback, memo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface FilterableListProps<T> {
  tabKey: string;
  placeholder: string;
  items: T[];
  selectedItems: T[];
  onSelectionChange: (items: T[]) => void;
  getItemId: (item: T) => string;
  getItemName: (item: T) => string;
  getItemDescription: (item: T) => string;
  showSetsRepsModal?: boolean;
  onExerciseConfigured?: (item: T, sets: number, reps: number) => void;
}

function FilterableList<T>({
  tabKey,
  placeholder,
  items,
  selectedItems,
  onSelectionChange,
  getItemId,
  getItemName,
  getItemDescription,
  showSetsRepsModal: enableSetsRepsModal = false,
  onExerciseConfigured,
}: FilterableListProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSetsRepsModal, setShowSetsRepsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const inputRef = useRef<TextInput>(null);

  const filteredItems = items.filter(item => 
    getItemName(item).toLowerCase().includes(searchQuery.toLowerCase()) ||
    getItemDescription(item).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleItem = useCallback((item: T) => {
    const itemId = getItemId(item);
    const isSelected = selectedItems.some(selected => getItemId(selected) === itemId);
    
    if (isSelected) {
      onSelectionChange(selectedItems.filter(selected => getItemId(selected) !== itemId));
    } else {
      if (enableSetsRepsModal && onExerciseConfigured) {
        setSelectedItem(item);
        setSets('');
        setReps('');
        setShowSetsRepsModal(true);
      } else {
        onSelectionChange([...selectedItems, item]);
      }
    }
  }, [selectedItems, onSelectionChange, getItemId, enableSetsRepsModal, onExerciseConfigured]);

  const isItemSelected = useCallback((item: T) => {
    const itemId = getItemId(item);
    return selectedItems.some(selected => getItemId(selected) === itemId);
  }, [selectedItems, getItemId]);

  const handleConfirmExercise = () => {
    if (!selectedItem || !sets || !reps) {
      Alert.alert('Error', 'Please fill in both sets and reps');
      return;
    }

    const setsNum = parseInt(sets);
    const repsNum = parseInt(reps);

    if (isNaN(setsNum) || isNaN(repsNum) || setsNum <= 0 || repsNum <= 0) {
      Alert.alert('Error', 'Please enter valid numbers for sets and reps');
      return;
    }

    if (onExerciseConfigured) {
      onExerciseConfigured(selectedItem, setsNum, repsNum);
    }

    // Add the item to selectedItems to show the green tick
    onSelectionChange([...selectedItems, selectedItem]);
    
    setShowSetsRepsModal(false);
    setSelectedItem(null);
    setSets('');
    setReps('');
  };

  return (
    <View style={styles.tabContent}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#64748B" />
        <TextInput
          ref={inputRef}
          key={`search-input-${tabKey}`}
          style={styles.searchInput}
          placeholder={placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#64748B"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          blurOnSubmit={false}
          selectTextOnFocus={false}
          clearButtonMode="while-editing"
          enablesReturnKeyAutomatically={false}
        />
      </View>
      <ScrollView style={styles.selectionList}>
        {filteredItems.map((item, index) => (
          <Animated.View
            key={getItemId(item)}
            entering={FadeInUp.delay(index * 100)}
          >
            <Pressable
              style={[
                styles.selectionCard,
                isItemSelected(item) && styles.selectedCard
              ]}
              onPress={() => toggleItem(item)}
            >
              <View style={styles.selectionInfo}>
                <Text style={styles.selectionName}>{getItemName(item)}</Text>
                <Text style={styles.selectionDescription}>{getItemDescription(item)}</Text>
              </View>
              {isItemSelected(item) && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                </View>
              )}
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Sets/Reps Modal */}
      <Modal
        visible={showSetsRepsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSetsRepsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How Many?</Text>
            
            {selectedItem && (
              <Text style={styles.exerciseName}>
                {getItemName(selectedItem)}
              </Text>
            )}
            
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Sets</Text>
                <TextInput
                  style={styles.numberInput}
                  value={sets}
                  onChangeText={setSets}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#64748B"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                  style={styles.numberInput}
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowSetsRepsModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmExercise}
              >
                <Text style={styles.confirmButtonText}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#21262F",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#FFFFFF",
  },
  selectionList: {
    flex: 1,
  },
  selectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#21262F',
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedCard: {
    backgroundColor: '#374151',
    borderColor: '#4F46E5',
    borderWidth: 1,
  },
  selectionInfo: {
    flex: 1,
  },
  selectionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  selectionDescription: {
    fontSize: 12,
    color: '#64748B',
  },
  selectedIndicator: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#21262F',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  exerciseName: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  numberInput: {
    backgroundColor: '#3C4148',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#3C4148',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default memo(FilterableList) as <T>(props: FilterableListProps<T>) => JSX.Element; 