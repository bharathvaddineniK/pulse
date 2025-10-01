import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
const countryCodes = require('country-codes-list');
// Import the 'CountryCode' type from the library
import { isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import CountryPickerModal from './CountryPickerModal';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

const countriesData = countryCodes.all();
interface Country {
  countryCode: string;
  countryNameEn: string;
  countryCallingCode: string;
}
const findCountryByCode = (code: string): Country | undefined => {
  return countriesData.find(
    (c: Country) => c.countryCode.toLowerCase() === code.toLowerCase()
  );
};
const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onChangeFormattedText: (text: string) => void;
}

export interface PhoneInputRef {
  isValid: () => boolean;
}

const PhoneInput = forwardRef<PhoneInputRef, PhoneInputProps>(
  ({ value, onChangeText, onChangeFormattedText }, ref) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
      findCountryByCode('US')
    );

    useImperativeHandle(ref, () => ({
      isValid: () => {
        if (!selectedCountry) return false;
        // Add the type assertion 'as CountryCode' here
        return isValidPhoneNumber(
          value,
          selectedCountry.countryCode as CountryCode
        );
      },
    }));

    useEffect(() => {
      if (selectedCountry) {
        onChangeFormattedText(`+${selectedCountry.countryCallingCode}${value}`);
      }
    }, [value, selectedCountry, onChangeFormattedText]);

    const handleTextChange = (text: string) => {
      const numericText = text.replace(/[^0-9]/g, '');
      onChangeText(numericText);
    };

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.flag}>
            {selectedCountry ? getFlagEmoji(selectedCountry.countryCode) : '🏳️'}
          </Text>
          <Text style={styles.dialCode}>
            {selectedCountry ? `+${selectedCountry.countryCallingCode}` : '+1'}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={handleTextChange}
          placeholder="Phone Number"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="number-pad"
        />

        <CountryPickerModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSelect={country => {
            const countryData = findCountryByCode(country.code);
            setSelectedCountry(countryData);
            setModalVisible(false);
          }}
        />
      </View>
    );
  }
);

// ...styles remain the same
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 58,
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    height: '100%',
  },
  flag: {
    fontSize: 24,
  },
  dialCode: {
    ...Typography.body,
    marginLeft: 8,
  },
  divider: {
    width: 1,
    height: '50%',
    backgroundColor: Colors.textSecondary,
    opacity: 0.5,
  },
  textInput: {
    ...Typography.body,
    flex: 1,
    paddingHorizontal: 12,
  },
});

export default PhoneInput;