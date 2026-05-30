import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Feather } from '@expo/vector-icons';

const ChallengeTile = () => {
  return (
    <View style={styles.container}>
        <View style={styles.headerContainer}>
            <Feather name="camera" size={16} color={Colors.textSecondary} />
            <Text style={styles.header}>Photo Prompt</Text>
        </View>
      <Text style={styles.bodyText}>Capture a unique shadow nearby</Text>
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
    justifyContent: 'center', // Center the content vertically
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  header: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  bodyText: {
    ...Typography.h2,
    fontSize: 20,
    color: Colors.textPrimary,
  },
});

export default ChallengeTile;