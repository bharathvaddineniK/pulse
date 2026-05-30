import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Feather } from '@expo/vector-icons';

const VibeTile = () => {
  return (
    <View style={styles.container}>
      <Feather name="zap" size={24} color={Colors.accentCalm} style={styles.icon} />
      <Text style={styles.title}>Your Vibe</Text>
      <Text style={styles.bodyText}>Curate a visual for your current mood.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(30, 30, 30, 0.75)',
    borderRadius: 16,
    padding: 20,
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.2)',
    justifyContent: 'space-between',
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  bodyText: {
    ...Typography.h2,
    fontSize: 20,
    color: Colors.textPrimary,
  },
});

export default VibeTile;