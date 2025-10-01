import React from 'react';
import { StyleSheet, View } from 'react-native';
import OTPTextInput from 'react-native-otp-textinput';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface OtpInputProps {
  onComplete: (code: string) => void;
}

const OtpInput = ({ onComplete }: OtpInputProps) => {
  // This function will be called on every input change
  const handleTextChange = (code: string) => {
    // We only call the onComplete function when the code is 6 digits long
    if (code.length === 6) {
      onComplete(code);
    }
  };

  return (
    <View style={styles.container}>
      <OTPTextInput
        handleTextChange={handleTextChange} // Use the correct prop name
        inputCount={6}
        tintColor={Colors.accentCalm}
        offTintColor={Colors.surface}
        textInputStyle={styles.box}
        keyboardType="number-pad"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
  },
  box: {
    ...Typography.h2,
    height: 60,
    width: 50,
    backgroundColor: Colors.surface,
    borderColor: Colors.surface,
    borderWidth: 1,
    borderRadius: 12,
    borderBottomWidth: 1,
  },
});

export default OtpInput;