import React, { useState, useCallback, memo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
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
}: FilterableListProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
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
      onSelectionChange([...selectedItems, item]);
    }
  }, [selectedItems, onSelectionChange, getItemId]);

  const isItemSelected = useCallback((item: T) => {
    const itemId = getItemId(item);
    return selectedItems.some(selected => getItemId(selected) === itemId);
  }, [selectedItems, getItemId]);

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
    padding: 16,
    backgroundColor: '#21262F',
    borderRadius: 12,
    marginBottom: 8,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  selectionDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  selectedIndicator: {
    marginLeft: 12,
  },
});

export default memo(FilterableList) as <T>(props: FilterableListProps<T>) => JSX.Element; 