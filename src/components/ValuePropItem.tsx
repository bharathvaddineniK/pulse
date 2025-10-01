import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface ValuePropItemProps {
  label: string;
}

const ValuePropItem = ({ label }: ValuePropItemProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✅</Text>
      <Text style={Typography.body}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // Add some space between items
  },
  icon: {
    color: Colors.accentCalm, // The check-circle icon is rendered in our vibrant Accent - Calm (Teal) color.
    fontSize: 20,
    marginRight: 12, // Space between icon and text
  },
});

export default ValuePropItem;