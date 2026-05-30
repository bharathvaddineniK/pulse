import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Feather } from '@expo/vector-icons';

const TipTile = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Getting Started Tip</Text>
      <View style={styles.contentContainer}>
        <Feather name="lightbulb" size={28} color={Colors.accentCalm} />
        <Text style={styles.bodyText}>Tip for new user</Text>
      </View>
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
  },
  title: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  bodyText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginTop: 8,
  },
});

export default TipTile;