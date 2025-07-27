import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DropdownProps {
  label?: string;
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function Dropdown({
  label,
  value,
  options,
  onValueChange,
  placeholder = 'Select an option',
  disabled = false
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    onValueChange(option);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <Pressable
        style={[styles.dropdown, disabled && styles.disabled]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
      >
        <Text style={[styles.dropdownText, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#94A3B8" />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
              <Pressable onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </Pressable>
            </View>
            
            <ScrollView style={styles.optionsList}>
              {options.map((option) => (
                <Pressable
                  key={option}
                  style={[
                    styles.option,
                    value === option && styles.selectedOption
                  ]}
                  onPress={() => handleSelect(option)}
                >
                  <Text style={[
                    styles.optionText,
                    value === option && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                                      {value === option && (
                      <Ionicons name="checkmark" size={20} color="#E94E77" />
                    )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
    fontWeight: '500',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#21262F',
    borderWidth: 1,
    borderColor: '#353D45',
    borderRadius: 8,
    minHeight: 48,
  },
  disabled: {
    backgroundColor: '#1A1D23',
    opacity: 0.6,
  },
  dropdownText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  placeholder: {
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#21262F',
    borderRadius: 12,
    width: '90%',
    maxHeight: '70%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#353D45',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedOption: {
    backgroundColor: 'rgba(233, 78, 119, 0.1)',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  selectedOptionText: {
    color: '#E94E77',
    fontWeight: '500',
  },
}); 