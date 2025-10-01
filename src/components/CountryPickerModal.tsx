import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
const countryCodes = require('country-codes-list');
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

// Helper to convert country code to flag emoji
const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// Define the shape of our country data
export interface Country {
  code: string;
  name: string;
  flag: string;
}

interface CountryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: Country) => void;
}

const CountryPickerModal = ({
  visible,
  onClose,
  onSelect,
}: CountryPickerModalProps) => {
  const [search, setSearch] = useState('');

  const countryData = useMemo((): Country[] => {
    return countryCodes.all().map((item: any) => ({
      code: item.countryCode,
      name: item.countryNameEn,
      flag: getFlagEmoji(item.countryCode),
    }));
  }, []);

  const filteredData = useMemo(() => {
    if (!search) return countryData;
    return countryData.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, countryData]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={Typography.h2}>Select a Country</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        <FlatList
          data={filteredData}
          keyExtractor={item => item.code + item.name} // <-- Changed this line for a more unique key
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.countryItem}
              onPress={() => {
                onSelect(item);
                onClose();
              }}>
              <Text style={styles.flag}>{item.flag}</Text>
              <Text style={Typography.body}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};

// ...styles remain the same
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  closeButton: {
    ...Typography.body,
    color: Colors.accentCalm,
  },
  searchInput: {
    ...Typography.body,
    backgroundColor: Colors.surface,
    margin: 20,
    padding: 12,
    borderRadius: 8,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
});

export default CountryPickerModal;